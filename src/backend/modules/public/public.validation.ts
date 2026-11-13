export function requireId(value: string, fieldName: string): string {
  const id = value?.trim()
  if (!id) throw new Error(`${fieldName} não informado.`)
  return id
}

export function normalizeSearch(value?: string): string {
  return (value ?? '').trim().slice(0, 80)
}
