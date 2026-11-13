
import { createStandingsUseCases } from '../../../../../src/backend/modules/standings/standings.use-cases'
import { standingsSupabaseRepository } from '../../../../../src/backend/modules/standings/standings.supabase'

const standings = createStandingsUseCases(
  standingsSupabaseRepository,
)

export const getStandings = standings.getStandings
export const listStandingsChampionships = standings.listChampionships
export const listStandingsSeasons = standings.listSeasons
export const listStandingsPhases = standings.listPhases
export const listStandingsGroups = standings.listGroups
export const subscribeToStandings = standings.subscribeToSeason
