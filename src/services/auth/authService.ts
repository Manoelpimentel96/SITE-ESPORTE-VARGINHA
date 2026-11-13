import { apiRequest, type AuthenticatedUser } from '../../lib/api'

export interface LoginCredentials { email: string; password: string }
export interface PasswordRecoveryRequest { email: string }
export interface PasswordUpdate { password: string }

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
    const result = await apiRequest<{ user: AuthenticatedUser }>('/auth/login', {
      method: 'POST', body: JSON.stringify(credentials),
    })
    return result.user
  },
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  requestPasswordRecovery: (request: PasswordRecoveryRequest) =>
    apiRequest<{ message: string }>('/auth/recovery', { method: 'POST', body: JSON.stringify(request) }),
  establishRecoverySession: (accessToken: string, refreshToken: string) =>
    apiRequest<void>('/auth/recovery/session', { method: 'POST', body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }) }),
  verifyRecoveryToken: (tokenHash: string) =>
    apiRequest<void>('/auth/recovery/verify', { method: 'POST', body: JSON.stringify({ token_hash: tokenHash }) }),
  updatePassword: (request: PasswordUpdate) =>
    apiRequest<void>('/auth/password', { method: 'POST', body: JSON.stringify(request) }),
  currentUser: async () => {
    const result = await apiRequest<{ user: AuthenticatedUser }>('/auth/me')
    return result.user
  },
}
