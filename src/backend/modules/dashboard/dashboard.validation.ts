import type { DashboardFilters } from './dashboard.types.js'

export function validateDashboardFilters(
  filters: DashboardFilters,
): DashboardFilters {
  if (!filters || typeof filters !== 'object') {
    throw new Error('Filtros do Dashboard inválidos.')
  }

  const championshipId = filters.championshipId?.trim() ?? ''
  const seasonId = filters.seasonId?.trim() ?? ''

  if (championshipId.length > 100 || seasonId.length > 100) {
    throw new Error('Um dos filtros informados é inválido.')
  }

  return {
    championshipId,
    seasonId,
  }
}
