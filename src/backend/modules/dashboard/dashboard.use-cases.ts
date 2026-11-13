import { validateDashboardFilters } from './dashboard.validation'
import { dashboardSupabaseRepository } from './dashboard.supabase'

import type { DashboardFilters } from './dashboard.types'

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
