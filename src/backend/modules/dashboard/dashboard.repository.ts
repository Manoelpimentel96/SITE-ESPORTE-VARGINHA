import type {
  DashboardData,
  DashboardFilters,
  DashboardRepository,
} from './dashboard.types.js'

export class DashboardRepositoryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DashboardRepositoryError'
  }
}

export function createDashboardRepository(
  repository: DashboardRepository,
): DashboardRepository {
  return {
    listChampionships: () => repository.listChampionships(),

    listSeasons: (championshipId) =>
      repository.listSeasons(championshipId),

    getDashboardData: (filters: DashboardFilters): Promise<DashboardData> =>
      repository.getDashboardData(filters),
  }
}
