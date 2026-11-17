
import type { AuditFilters } from './audit.types.js'

export function validateAuditFilters(
  filters: AuditFilters,
): AuditFilters {
  const search = filters.search.trim()

  if (search.length > 100) {
    throw new Error('A pesquisa deve ter no máximo 100 caracteres.')
  }

  if (!Number.isInteger(filters.page) || filters.page < 1) {
    throw new Error('Número de página inválido.')
  }

  if (
    !Number.isInteger(filters.pageSize) ||
    filters.pageSize < 1 ||
    filters.pageSize > 100
  ) {
    throw new Error('Quantidade de registros por página inválida.')
  }

  if (filters.startDate && filters.endDate) {
    if (filters.startDate > filters.endDate) {
      throw new Error('A data inicial não pode ser posterior à data final.')
    }
  }

  return {
    ...filters,
    search,
    module: filters.module.trim(),
    action: filters.action.trim(),
  }
}
