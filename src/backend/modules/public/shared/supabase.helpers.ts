/**
 * Utilitários compartilhados pelas consultas Supabase das páginas públicas.
 * Não contém regra de nenhuma página específica.
 */

/** O Supabase pode devolver uma relação como objeto, lista ou nulo. */
export type Relation<T> = T | T[] | null

export type SupabaseErrorLike = {
  message: string
  code?: string
  details?: string
  hint?: string
}

/** Primeiro item de uma relação (objeto, lista ou nulo). */
export function firstRelation<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value
}

/** Lança o erro do Supabase, se houver, preservando código, detalhes e dica. */
export function fail(error: SupabaseErrorLike | null): void {
  if (!error) return
  // Preserve o código Postgres/PostgREST para que a rota HTTP classifique o erro corretamente.
  const exception = new Error(error.message) as Error & SupabaseErrorLike
  exception.code = error.code
  exception.details = error.details
  exception.hint = error.hint
  throw exception
}
