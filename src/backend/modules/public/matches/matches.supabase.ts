import { supabase } from '../../../../../apps/api/src/lib/supabase.js'
import { fail, firstRelation } from '../shared/supabase.helpers.js'
import type { Relation } from '../shared/supabase.helpers.js'
import type { MatchesRepository } from './matches.repository.js'
import type { PublicMatch } from './matches.types.js'

// Consultas da página pública: Partidas (também usadas por Visão geral,
// Classificação, Estatísticas e detalhe da equipe).

interface MatchRelationTeam {
  name: string
  crest_url: string | null
}

interface MatchRegistrationRow {
  team: Relation<MatchRelationTeam>
}

interface MatchRow {
  id: string
  home_registration_id: string
  away_registration_id: string
  scheduled_at: string | null
  status: string
  home_score: number | null
  away_score: number | null
  city: string | null
  venue: string | null
  home_registration: Relation<MatchRegistrationRow>
  away_registration: Relation<MatchRegistrationRow>
  phase: Relation<{ name: string }>
  group: Relation<{ name: string }>
  round: Relation<{ name: string }>
}

function mapMatch(row: MatchRow): PublicMatch {
  const homeRegistration = firstRelation(row.home_registration)
  const awayRegistration = firstRelation(row.away_registration)
  const homeTeam = homeRegistration ? firstRelation(homeRegistration.team) : null
  const awayTeam = awayRegistration ? firstRelation(awayRegistration.team) : null

  return {
    id: row.id,
    homeRegistrationId: row.home_registration_id,
    awayRegistrationId: row.away_registration_id,
    scheduledAt: row.scheduled_at ?? null,
    status: row.status,
    homeScore: row.home_score ?? null,
    awayScore: row.away_score ?? null,
    city: row.city ?? null,
    venue: row.venue ?? null,
    homeTeam: homeTeam?.name ?? 'Equipe não disponível',
    awayTeam: awayTeam?.name ?? 'Equipe não disponível',
    homeCrest: homeTeam?.crest_url ?? null,
    awayCrest: awayTeam?.crest_url ?? null,
    phase: firstRelation(row.phase)?.name ?? null,
    group: firstRelation(row.group)?.name ?? null,
    round: firstRelation(row.round)?.name ?? null,
  }
}

export const matchesSupabaseRepository: MatchesRepository = {
  async listMatches(seasonId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,home_registration_id,away_registration_id,scheduled_at,status,
        home_score,away_score,city,venue,
        home_registration:season_team_registrations!matches_home_registration_id_season_id_fkey(
          team:teams(name,crest_url)
        ),
        away_registration:season_team_registrations!matches_away_registration_id_season_id_fkey(
          team:teams(name,crest_url)
        ),
        phase:competition_phases(name),
        group:competition_groups(name),
        round:competition_rounds(name)
      `)
      .eq('season_id', seasonId)
      .in('status', ['scheduled', 'live', 'finished', 'postponed'])
      .order('scheduled_at', { ascending: true })
    fail(error)
    return ((data ?? []) as unknown as MatchRow[]).map(mapMatch)
  },
}
