import { matchesSupabaseRepository } from '../matches/matches.supabase.js'
import { teamsSupabaseRepository } from '../teams/teams.supabase.js'
import type { StandingsRepository } from './standings.repository.js'

// A classificação não tem consulta própria: usa as equipes e as partidas da temporada.
export const standingsSupabaseRepository: StandingsRepository = {
  listTeams: teamsSupabaseRepository.listTeams,
  listMatches: matchesSupabaseRepository.listMatches,
}
