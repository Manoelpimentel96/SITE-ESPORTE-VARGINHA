import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { env } from './lib/env.mjs'
import { authRoutes } from './routes/auth.routes.mjs'
import { domainRoutes } from './routes/domain.routes.js'

console.log('[BOOT 01] Imports carregados e configuração disponível')

const app = Fastify({
  logger: true,
  trustProxy: env.NODE_ENV === 'production',
  bodyLimit: 8 * 1024 * 1024,
})

console.log('[BOOT 02] Fastify criado')

await app.register(helmet, { contentSecurityPolicy: false })
console.log('[BOOT 03] Helmet registrado')

const allowedOrigins = new Set(
  env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
)

await app.register(cors, {
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
  credentials: true,
})
console.log('[BOOT 04] CORS registrado')

await app.register(cookie, {
  secret: env.COOKIE_SECRET,
  hook: 'onRequest',
})
console.log('[BOOT 05] Cookie registrado')

await app.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
})
console.log('[BOOT 06] Rate Limit registrado')

app.addHook('onRequest', async (request, reply) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.origin

    if (!origin || !allowedOrigins.has(origin)) {
      return reply.code(403).send({ error: 'Origem não autorizada.' })
    }
  }
})

app.get('/health', async () => ({
  status: 'ok',
  service: 'site-esporte-api',
}))
console.log('[BOOT 07] Rota health registrada')

await app.register(authRoutes, { prefix: '/api' })
console.log('[BOOT 08] Rotas de autenticação registradas')

await app.register(domainRoutes, { prefix: '/api' })
console.log('[BOOT 09] Rotas de domínio registradas')

app.setNotFoundHandler((request, reply) =>
  reply.code(404).send({ error: 'Rota não encontrada.' }),
)

app.setErrorHandler((error: unknown, request, reply) => {
  request.log.error({ error }, 'Unhandled API error')

  const candidate =
    typeof error === 'object' && error !== null
      ? (error as { statusCode?: unknown; message?: unknown })
      : {}

  const statusCode =
    typeof candidate.statusCode === 'number' && candidate.statusCode >= 400
      ? candidate.statusCode
      : 500

  const message =
    typeof candidate.message === 'string'
      ? candidate.message
      : 'Erro interno do servidor.'

  return reply.code(statusCode).send({
    error: statusCode >= 500 ? 'Erro interno do servidor.' : message,
  })
})

console.log('[BOOT 10] Configuração do Fastify concluída')

// Na Vercel a função precisa exportar o app; a plataforma controla a porta.
export default app

// O listen() só roda fora da Vercel (desenvolvimento local e outros provedores).
if (!process.env.VERCEL) {
  try {
    console.log('[BOOT 11] Iniciando app.listen')

    await app.listen({
      host: env.API_HOST,
      port: env.API_PORT,
    })

    console.log('[BOOT 12] Servidor iniciado com sucesso')
  } catch (error) {
    console.error('[BOOT ERROR] Falha ao iniciar o servidor:', error)
    app.log.error(error)
    process.exit(1)
  }
}