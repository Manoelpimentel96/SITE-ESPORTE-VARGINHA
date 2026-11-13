import { z } from 'zod'
import { env } from '../lib/env.mjs'
import { createSupabaseClient } from '../lib/supabase.mjs'

const COOKIE = 'site_esporte_session'
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) })
const recoverySchema = z.object({ email: z.string().trim().email().max(254) })
const passwordSchema = z.object({ password: z.string().min(8).max(128) })

function cookieOptions() {
  return {
    path: '/', httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}), maxAge: 60 * 60 * 24 * 7,
  }
}
function saveSession(reply, session) {
  reply.setCookie(COOKIE, JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }), { ...cookieOptions(), signed: true })
}
function readSession(request) {
  const raw = request.cookies[COOKIE]
  if (!raw) return null
  const unsigned = request.unsignCookie(raw)
  if (!unsigned.valid) return null
  try {
    const value = JSON.parse(unsigned.value)
    return value?.access_token && value?.refresh_token ? value : null
  } catch { return null }
}

async function getUserPermissions(userClient, role) {
  const query = role === 'owner'
    ? await userClient.from('permissions').select('key')
    : await userClient.from('role_permissions').select('permissions!inner(key)').eq('role', role)
  if (query.error) return []
  return (query.data ?? []).map((item) => {
    if (role === 'owner') return item.key
    const relation = Array.isArray(item.permissions) ? item.permissions[0] : item.permissions
    return relation?.key
  }).filter(Boolean)
}

function clearSession(reply) {
  reply.clearCookie(COOKIE, { path: '/', ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}) })
}

export async function authRoutes(app) {
  app.post('/auth/login', { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Informe um e-mail e uma senha válidos.' })
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
    if (error || !data.session || !data.user) return reply.code(401).send({ error: 'E-mail ou senha incorretos.' })

    const userClient = createSupabaseClient(data.session.access_token)
    const { data: profile, error: profileError } = await userClient.from('profiles').select('full_name,role,is_active').eq('user_id', data.user.id).maybeSingle()
    if (profileError || !profile || !profile.is_active) {
      await supabase.auth.signOut()
      return reply.code(403).send({ error: 'Usuário sem perfil administrativo ativo. Solicite liberação ao responsável.' })
    }
    if (profile.role === 'viewer') return reply.code(403).send({ error: 'Este perfil possui somente acesso público.' })

    const { error: accessLogError } = await userClient.from('access_logs').insert({
      user_id: data.user.id, action: 'login', ip_address: request.ip,
      user_agent: request.headers['user-agent'] ?? null,
    })
    if (accessLogError) request.log.warn({ accessLogError }, 'Could not write login access log')
    const permissions = await getUserPermissions(userClient, profile.role)
    saveSession(reply, data.session)
    return reply.send({ user: { id: data.user.id, email: data.user.email, name: profile.full_name, role: profile.role, permissions } })
  })

  app.get('/auth/me', async (request, reply) => {
    const saved = readSession(request)
    if (!saved) return reply.code(401).send({ error: 'Não autenticado.' })
    const client = createSupabaseClient()
    const { data: sessionData, error: sessionError } = await client.auth.setSession(saved)
    if (sessionError || !sessionData.session) { clearSession(reply); return reply.code(401).send({ error: 'Sessão expirada.' }) }
    const { data: userData, error: userError } = await client.auth.getUser(sessionData.session.access_token)
    if (userError || !userData.user) { clearSession(reply); return reply.code(401).send({ error: 'Sessão inválida.' }) }
    const userClient = createSupabaseClient(sessionData.session.access_token)
    const { data: profile, error: profileError } = await userClient.from('profiles').select('full_name,role,is_active').eq('user_id', userData.user.id).maybeSingle()
    if (profileError || !profile || !profile.is_active || profile.role === 'viewer') { clearSession(reply); return reply.code(403).send({ error: 'Acesso administrativo não autorizado.' }) }
    const permissions = await getUserPermissions(userClient, profile.role)
    saveSession(reply, sessionData.session)
    return reply.send({ user: { id: userData.user.id, email: userData.user.email, name: profile.full_name, role: profile.role, permissions } })
  })

  app.post('/auth/logout', async (request, reply) => {
    const saved = readSession(request)
    if (saved) {
      const client = createSupabaseClient()
      const { data: sessionData } = await client.auth.setSession(saved)
      if (sessionData.session) {
        const userClient = createSupabaseClient(sessionData.session.access_token)
        await userClient.from('access_logs').insert({ user_id: sessionData.session.user.id, action: 'logout', ip_address: request.ip, user_agent: request.headers['user-agent'] ?? null })
      }
      await client.auth.signOut()
    }
    clearSession(reply)
    return reply.code(204).send()
  })

  app.post('/auth/recovery', { config: { rateLimit: { max: 4, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const parsed = recoverySchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Informe um e-mail válido.' })
    const client = createSupabaseClient()
    await client.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${env.WEB_ORIGIN}/login?mode=recovery` })
    return reply.code(202).send({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.' })
  })

  app.post('/auth/recovery/session', async (request, reply) => {
    const tokens = z.object({ access_token: z.string().min(1), refresh_token: z.string().min(1) }).safeParse(request.body)
    if (!tokens.success) return reply.code(400).send({ error: 'Sessão de recuperação inválida.' })
    const client = createSupabaseClient()
    const { data, error } = await client.auth.setSession(tokens.data)
    if (error || !data.session) return reply.code(400).send({ error: 'O link de recuperação é inválido ou expirou.' })
    saveSession(reply, data.session)
    return reply.code(204).send()
  })

  app.post('/auth/recovery/verify', async (request, reply) => {
    const tokenHash = z.object({ token_hash: z.string().min(1).max(4096) }).safeParse(request.body)
    if (!tokenHash.success) return reply.code(400).send({ error: 'Link de recuperação inválido.' })
    const client = createSupabaseClient()
    const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash.data.token_hash, type: 'recovery' })
    if (error || !data.session) return reply.code(400).send({ error: 'O link de recuperação é inválido ou expirou.' })
    saveSession(reply, data.session)
    return reply.code(204).send()
  })

  app.post('/auth/password', async (request, reply) => {
    const parsed = passwordSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'A senha deve ter pelo menos 8 caracteres.' })
    const saved = readSession(request)
    if (!saved) return reply.code(401).send({ error: 'Sessão de recuperação inválida ou expirada.' })
    const client = createSupabaseClient()
    const { data, error } = await client.auth.setSession(saved)
    if (error || !data.session) { clearSession(reply); return reply.code(401).send({ error: 'Sessão de recuperação inválida ou expirada.' }) }
    const { error: updateError } = await client.auth.updateUser({ password: parsed.data.password })
    if (updateError) return reply.code(400).send({ error: 'Não foi possível atualizar a senha.' })
    clearSession(reply)
    return reply.code(204).send()
  })
}
