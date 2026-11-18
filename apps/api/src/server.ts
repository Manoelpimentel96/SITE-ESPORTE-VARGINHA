import Fastify from 'fastify'

const app = Fastify({
  logger: true,
  bodyLimit: 8 * 1024 * 1024,
})

let bootStep = 'inicio'
let bootError: string | null = null

// DIAGNÓSTICO TEMPORÁRIO: mostra a etapa e o motivo da falha.
app.get('/health', async (_request, reply) => {
  if (bootError) {
    return reply.code(500).send({ status: 'erro', etapa: bootStep, erro: bootError })
  }
  return { status: 'ok', service: 'site-esporte-api' }
})

try {
  bootStep = 'carregar configuracao (lib/env.mjs)'
  const { env } = await import('./lib/env.mjs')

  bootStep = 'carregar plugins do Fastify'
  const { default: helmet } = await import('@fastify/helmet')
  const { default: cors } = await import('@fastify/cors')
  const { default: cookie } = await import('@fastify/cookie')
  const { default: rateLimit } = await import('@fastify/rate-limit')

  bootStep = 'registrar helmet'
  await app.register(helmet, { contentSecurityPolicy: false })

  const allowedOrigins = new Set(
    env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  )

  bootStep = 'registrar cors'
  await app.register(cors, {
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
    credentials: true,
  })

  bootStep = 'registrar cookie'
  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
    hook: 'onRequest',
  })

  bootStep = 'registrar rate limit'
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  })

  app.addHook('onRequest', async (request, reply) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.headers.origin

      if (!origin || !allowedOrigins.has(origin)) {
        return reply.code(403).send({ error: 'Origem não autorizada.' })
      }
    }
  })

  bootStep = 'carregar rotas de autenticacao (routes/auth.routes.mjs)'
  const { authRoutes } = await import('./routes/auth.routes.mjs')

  bootStep = 'carregar rotas de dominio (routes/domain.routes.js)'
  const { domainRoutes } = await import('./routes/domain.routes.js')

  bootStep = 'registrar rotas de autenticacao'
  await app.register(authRoutes, { prefix: '/api' })

  bootStep = 'registrar rotas de dominio'
  await app.register(domainRoutes, { prefix: '/api' })

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

  // Na Vercel o app é exportado; o listen() só roda fora dela (ambiente local).
  if (!process.env.VERCEL) {
    bootStep = 'iniciar servidor (listen)'
    await app.listen({ host: env.API_HOST, port: env.API_PORT })
  }

  bootStep = 'concluido'
} catch (error) {
  bootError = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  console.error(`[BOOT ERROR] etapa "${bootStep}":`, error)

  if (!process.env.VERCEL) {
    process.exit(1)
  }
}

export default app