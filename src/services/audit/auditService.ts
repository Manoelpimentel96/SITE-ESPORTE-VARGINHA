import { domainCall } from '../../lib/domainApi'
import type { AuditFilters, AuditListResult } from '../../backend/modules/audit/audit.types'
export const auditService = { list: (filters: AuditFilters) => domainCall<AuditListResult>('audit', 'list', filters) }
