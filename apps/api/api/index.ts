import type { IncomingMessage, ServerResponse } from 'node:http'

// Função clássica da Vercel que entrega cada requisição ao app Fastify.
// O import é dinâmico e protegido: se a API falhar ao iniciar, o erro aparece
// no navegador (JSON) e nos Runtime Logs da Vercel, em vez de "500 sem log".
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const { default: app } = await import('../src/server.js')
    await app.ready()
    app.server.emit('request', req, res)
  } catch (error) {
    console.error('[FUNCTION ERROR]', error)
    res.statusCode = 500
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(
      JSON.stringify({
        status: 'erro',
        etapa: 'carregar src/server',
        erro: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      }),
    )
  }
}