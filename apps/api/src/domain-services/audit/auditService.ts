
import { getAuditLogs } from '../../../../../src/backend/modules/audit/audit.use-cases'

import type { AuditFilters } from '../../../../../src/backend/modules/audit/audit.types'

export const auditService = {
  list(filters: AuditFilters) {
    return getAuditLogs(filters)
  },
}
