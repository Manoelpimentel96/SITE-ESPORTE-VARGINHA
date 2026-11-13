/**
 * Server-only Supabase adapter.
 * This module is imported only by apps/api domain services. Never import it
 * from browser code. AsyncLocalStorage isolates the JWT per HTTP request.
 */
import { AsyncLocalStorage } from 'node:async_hooks'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const requestToken = new AsyncLocalStorage<string | null>()
const url = process.env.SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Fail when the API boots, not during frontend compilation.
  if (typeof window === 'undefined') {
    console.warn('Supabase API credentials are not configured yet.')
  }
}

function clientFor(token = requestToken.getStore() ?? null): SupabaseClient {
  if (!url || !anonKey) throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY não configurados na API.')
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  })
}

export function createSupabaseAdminClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados para administrar usuários.')
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}

export function runWithSupabaseToken<T>(token: string | null, operation: () => T): T {
  return requestToken.run(token, operation)
}

// Keeps existing repository adapters stable while making the active JWT
// request-scoped and preventing one user's token leaking into another request.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = clientFor()
    const value = Reflect.get(client, property, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
