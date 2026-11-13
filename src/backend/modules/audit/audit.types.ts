
export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'status_change'
  | 'permission_change'
  | 'other'

export interface AuditLog {
  id: string
  userId: string | null
  userName: string
  userEmail: string | null
  action: AuditAction
  module: string
  description: string
  entityType: string | null
  entityId: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface AuditFilters {
  search: string
  module: string
  action: string
  startDate: string
  endDate: string
  page: number
  pageSize: number
}

export interface AuditListResult {
  data: AuditLog[]
  total: number
}

export interface AuditRepository {
  list(filters: AuditFilters): Promise<AuditListResult>
}
