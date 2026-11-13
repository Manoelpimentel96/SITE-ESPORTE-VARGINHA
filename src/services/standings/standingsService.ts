import type { StandingsFilters, StandingsRow, StandingsChampionshipOption, StandingsSeasonOption, StandingsPhaseOption, StandingsGroupOption } from '../../backend/modules/standings/standings.types'
import { domainCall } from '../../lib/domainApi'
export const getStandings = (filters: StandingsFilters) => domainCall<StandingsRow[]>('standings', 'getStandings', filters)
export const listStandingsChampionships = () => domainCall<StandingsChampionshipOption[]>('standings', 'listStandingsChampionships')
export const listStandingsSeasons = (id: string) => domainCall<StandingsSeasonOption[]>('standings', 'listStandingsSeasons', id)
export const listStandingsPhases = (id: string) => domainCall<StandingsPhaseOption[]>('standings', 'listStandingsPhases', id)
export const listStandingsGroups = (id: string) => domainCall<StandingsGroupOption[]>('standings', 'listStandingsGroups', id)
/** Server polling replaces direct browser subscriptions to Supabase Realtime. */
export function subscribeToStandings(_seasonId: string, onChange: () => void): () => void {
  const timer = window.setInterval(onChange, 15000)
  return () => window.clearInterval(timer)
}
