import { publicSupabaseRepository } from '../../../../../src/backend/modules/public/public.supabase'
import { createPublicUseCases } from '../../../../../src/backend/modules/public/public.use-cases'

const useCases = createPublicUseCases(publicSupabaseRepository)

export const publicService = {
  listChampionships: useCases.listChampionships,
  listSeasons: useCases.listSeasons,
  getSeason: useCases.getSeason,
  getOverview: useCases.getOverview,
  listTeams: useCases.listTeams,
  getTeamDetails: useCases.getTeamDetails,
  listMatches: useCases.listMatches,
  getStandings: useCases.getStandings,
  listPlayers: useCases.listPlayers,
  getStatistics: useCases.getStatistics,
  listPreviousSeasons: useCases.listPreviousSeasons,
}
