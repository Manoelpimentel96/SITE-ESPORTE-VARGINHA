import {
  getDashboard,
  listDashboardChampionships,
  listDashboardSeasons,
} from '../../../../../src/backend/modules/dashboard/dashboard.use-cases'

import type { DashboardFilters } from '../../../../../src/backend/modules/dashboard/dashboard.types'

export const dashboardService = {
  listChampionships: listDashboardChampionships,

  listSeasons: listDashboardSeasons,

  getDashboard: (filters: DashboardFilters) =>
    getDashboard(filters),
}
