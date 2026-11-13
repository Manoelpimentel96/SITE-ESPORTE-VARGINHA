
import { listAuditLogs } from './audit.repository'
import { auditSupabaseRepository } from './audit.supabase'
import { validateAuditFilters } from './audit.validation'

import type { AuditFilters } from './audit.types'

export async function getAuditLogs(filters: AuditFilters) {
  const validatedFilters = validateAuditFilters(filters)

  return listAuditLogs(auditSupabaseRepository, validatedFilters)
}
