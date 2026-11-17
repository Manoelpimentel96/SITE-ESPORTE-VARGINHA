import { listAuditLogs } from './audit.repository.js'
import { auditSupabaseRepository } from './audit.supabase.js'
import { validateAuditFilters } from './audit.validation.js'

import type { AuditFilters } from './audit.types.js'

export async function getAuditLogs(filters: AuditFilters) {
  const validatedFilters = validateAuditFilters(filters)

  return listAuditLogs(auditSupabaseRepository, validatedFilters)
}
