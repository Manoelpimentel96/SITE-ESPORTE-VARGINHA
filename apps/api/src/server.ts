import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { env } from './lib/env.mjs'
import { authRoutes } from './routes/auth.routes.mjs'
import { domainRoutes } from './routes/domain.routes.js'

const app = Fastify({ logger: true, trustProxy: env.NODE_ENV === 'production', bodyLimit: 8 * 1024 * 1024 })
await app.register(helmet, { contentSecurityPolicy: false })
const allowedOrigins = new Set(env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean))
await app.register(cors, { origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)), credentials: true })
await app.register(cookie, { secret: env.COOKIE_SECRET, hook: 'onRequest' })
await app.register(rateLimit, { max: 120, timeWindow: '1 minute' })

app.addHook('onRequest', async (request, reply) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.origin
    if (!origin || !allowedOrigins.has(origin)) return reply.code(403).send({ error: 'Origem não autorizada.' })
  }
})

app.get('/health', async () => ({ status: 'ok', service: 'site-esporte-api' }))
await app.register(authRoutes, { prefix: '/api' })
await app.register(domainRoutes, { prefix: '/api' })
app.setNotFoundHandler((request, reply) => reply.code(404).send({ error: 'Rota não encontrada.' }))
app.setErrorHandler((error: unknown, request, reply) => {
  request.log.error({ error }, 'Unhandled API error')
  const candidate = typeof error === 'object' && error !== null
    ? error as { statusCode?: unknown; message?: unknown }
    : {}
  const statusCode = typeof candidate.statusCode === 'number' && candidate.statusCode >= 400
    ? candidate.statusCode
    : 500
  const message = typeof candidate.message === 'string'
    ? candidate.message
    : 'Erro interno do servidor.'
  return reply.code(statusCode).send({ error: statusCode >= 500 ? 'Erro interno do servidor.' : message })
})

try {
  await app.listen({ host: env.API_HOST, port: env.API_PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
