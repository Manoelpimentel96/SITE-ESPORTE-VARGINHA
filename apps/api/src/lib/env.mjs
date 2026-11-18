import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  WEB_ORIGIN: z.string().url(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  COOKIE_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  // Só nomes de variáveis e mensagens de validação; nunca os valores.
  const fieldErrors = parsed.error.flatten().fieldErrors
  console.error('Configuração da API inválida:', fieldErrors)

  // throw (em vez de process.exit) para o erro aparecer nos Runtime Logs da Vercel.
  throw new Error(
    `Configuração da API inválida: ${Object.keys(fieldErrors).join(', ')}`,
  )
}

export const env = parsed.data