import type { PublicRepository } from './public.repository.js'
import { matchesSupabaseRepository } from './matches/matches.supabase.js'
import { overviewSupabaseRepository } from './overview/overview.supabase.js'
import { playersSupabaseRepository } from './players/players.supabase.js'
import { seasonsSupabaseRepository } from './seasons/seasons.supabase.js'
import { standingsSupabaseRepository } from './standings/standings.supabase.js'
import { statisticsSupabaseRepository } from './statistics/statistics.supabase.js'
import { teamsSupabaseRepository } from './teams/teams.supabase.js'

/**
 * Repositório Supabase do portal público.
 *
 * As consultas ficam na pasta de cada página (ex.: statistics/statistics.supabase.ts).
 * Este arquivo só reúne os repositórios das páginas em um único objeto.
 */
export const publicSupabaseRepository: PublicRepository = {
  ...seasonsSupabaseRepository,
  ...teamsSupabaseRepository,
  ...matchesSupabaseRepository,
  ...playersSupabaseRepository,
  ...standingsSupabaseRepository,
  ...overviewSupabaseRepository,
  ...statisticsSupabaseRepository,
}
