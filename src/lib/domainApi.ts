import { apiRequest } from './api'

export async function domainCall<T = unknown>(module: string, action: string, ...args: unknown[]): Promise<T> {
  const response = await apiRequest<{ data: T }>(`/domain/${encodeURIComponent(module)}/${encodeURIComponent(action)}`, {
    method: 'POST',
    body: JSON.stringify({ args }),
  })
  return response.data
}
