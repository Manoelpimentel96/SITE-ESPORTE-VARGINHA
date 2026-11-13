import { domainCall } from '../../lib/domainApi'
import type { DashboardChampionship, DashboardData, DashboardFilters, DashboardSeason } from '../../backend/modules/dashboard/dashboard.types'
export const dashboardService = {
  listChampionships: () => domainCall<DashboardChampionship[]>('dashboard', 'listChampionships'),
  listSeasons: (championshipId: string) => domainCall<DashboardSeason[]>('dashboard', 'listSeasons', championshipId),
  getDashboard: (filters: DashboardFilters) => domainCall<DashboardData>('dashboard', 'getDashboard', filters),
}
