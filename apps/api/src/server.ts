import Fastify, { type FastifyInstance } from 'fastify'

// Na Vercel (e em qualquer ambiente de produção) a API fica atrás de proxy:
// sem trustProxy o rate limit enxergaria o IP do proxy para todos os usuários.
const app = Fastify({
  logger: true,
  trustProxy: Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production',
  bodyLimit: 8 * 1024 * 1024,
})

let bootStep = 'inicio'
let bootError: string | null = null
let listenOptions: { host: string; port: number } | null = null

// DIAGNÓSTICO TEMPORÁRIO: mostra a etapa e o motivo da falha de inicialização.
// Remova a parte de "bootError" quando o deploy estiver estável.
app.get('/health', async (_request, reply) => {
  if (bootError) {
    return reply.code(500).send({ status: 'erro', etapa: bootStep, erro: bootError })
  }
  return { status: 'ok', service: 'site-esporte-api' }
})

// Toda a inicialização acontece dentro de um plugin assíncrono (sem top-level await),
// para o módulo poder ser carregado tanto por import() quanto por require() no runtime.
// Erros são capturados aqui dentro: o app nunca rejeita em ready() e o /health
// consegue informar em qual etapa a inicialização falhou.
async function boot(instance: FastifyInstance): Promise<void> {
  try {
    bootStep = 'carregar configuracao (lib/env.mjs)'
    const { env } = await import('./lib/env.mjs')

    bootStep = 'carregar plugins do Fastify'
    const { default: helmet } = await import('@fastify/helmet')
    const { default: cors } = await import('@fastify/cors')
    const { default: cookie } = await import('@fastify/cookie')
    const { default: rateLimit } = await import('@fastify/rate-limit')

    bootStep = 'registrar helmet'
    await instance.register(helmet, { contentSecurityPolicy: false })

    const allowedOrigins = new Set(
      env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
    )

    bootStep = 'registrar cors'
    await instance.register(cors, {
      origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
      credentials: true,
    })

    bootStep = 'registrar cookie'
    await instance.register(cookie, {
      secret: env.COOKIE_SECRET,
      hook: 'onRequest',
    })

    bootStep = 'registrar rate limit'
    await instance.register(rateLimit, {
      max: 120,
      timeWindow: '1 minute',
    })

    instance.addHook('onRequest', async (request, reply) => {
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
    await instance.register(authRoutes, { prefix: '/api' })

    bootStep = 'registrar rotas de dominio'
    await instance.register(domainRoutes, { prefix: '/api' })

    instance.setNotFoundHandler((_request, reply) =>
      reply.code(404).send({ error: 'Rota não encontrada.' }),
    )

    instance.setErrorHandler((error: unknown, request, reply) => {
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

    listenOptions = { host: env.API_HOST, port: env.API_PORT }
    bootStep = 'concluido'
  } catch (error) {
    bootError = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    console.error(`[BOOT ERROR] etapa "${bootStep}":`, error)
  }
}

// Equivale ao fastify-plugin: o plugin roda no escopo raiz (sem encapsulamento),
// então cors, cookie, hooks e rotas valem para o app inteiro.
;(boot as unknown as Record<symbol, boolean>)[Symbol.for('skip-override')] = true

app.register(boot)

// Fora da Vercel (desenvolvimento local) o servidor é iniciado aqui.
// Na Vercel o app é apenas exportado e a plataforma cuida do servidor.
if (!process.env.VERCEL) {
  void (async () => {
    try {
      await app.ready()

      if (bootError || !listenOptions) {
        process.exit(1)
      }

      await app.listen(listenOptions)
    } catch (error) {
      app.log.error(error)
      process.exit(1)
    }
  })()
}

export default app