
import type {
  AuditFilters,
  AuditListResult,
  AuditRepository,
} from './audit.types'

export async function listAuditLogs(
  repository: AuditRepository,
  filters: AuditFilters,
): Promise<AuditListResult> {
  return repository.list(filters)
}
