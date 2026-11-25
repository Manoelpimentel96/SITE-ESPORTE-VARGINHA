import { matchesSupabaseRepository } from '../matches/matches.supabase.js'
import { teamsSupabaseRepository } from '../teams/teams.supabase.js'
import type { OverviewRepository } from './overview.repository.js'

// A visão geral não tem consulta própria: usa as equipes e as partidas da temporada.
export const overviewSupabaseRepository: OverviewRepository = {
  listTeams: teamsSupabaseRepository.listTeams,
  listMatches: matchesSupabaseRepository.listMatches,
}
