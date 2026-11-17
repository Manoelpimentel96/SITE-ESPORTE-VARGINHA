import { validateDashboardFilters } from './dashboard.validation.js'
import { dashboardSupabaseRepository } from './dashboard.supabase.js'

import type { DashboardFilters } from './dashboard.types.js'

export async function listDashboardChampionships() {
  return dashboardSupabaseRepository.listChampionships()
}

export async function listDashboardSeasons(championshipId: string) {
  return dashboardSupabaseRepository.listSeasons(championshipId)
}

export async function getDashboard(filters: DashboardFilters) {
  const validatedFilters = validateDashboardFilters(filters)

  return dashboardSupabaseRepository.getDashboardData(validatedFilters)
}
