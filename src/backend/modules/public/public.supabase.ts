import { supabase } from '../../../../apps/api/src/lib/supabase'
import type { PublicRepository } from './public.repository'
import type {
  PublicMatch,
  PublicPlayer,
  PublicSeason,
  PublicTeam
} from './public.types'

type Relation<T> = T | T[] | null

type SupabaseErrorLike = {
  message: string
  code?: string
  details?: string
  hint?: string
}

interface SeasonRow {
  id: string
  championship_id: string
  name: string
  edition: number | null
  year: number
  start_date: string | null
  end_date: string | null
  status: string
}

interface ChampionshipRow {
  id: string
  name: string
  acronym: string | null
  description: string | null
  logo_url: string | null
}

interface TeamRow {
  id: string
  name: string
  short_name: string | null
  city: string | null
  primary_color: string | null
  crest_url: string | null
  founded_year: number | null
}

interface TeamRegistrationRow {
  id: string
  team: Relation<TeamRow>
}

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

interface PlayerRelationRow {
  id: string
  full_name: string
  position: string | null
  photo_url: string | null
}

interface PlayerTeamRegistrationRow {
  id: string
  season_id: string
  team: Relation<{ name: string }>
}

interface PlayerRegistrationRow {
  player_id: string
  team_registration_id: string
  shirt_number: number | null
  player: Relation<PlayerRelationRow>
  team_registration: Relation<PlayerTeamRegistrationRow>
}

interface StaffRow {
  full_name: string
  role: string
  team_registration_id: string | null
}

interface ScorerEventRow {
  player_registration_id: string | null
  player_registration: Relation<{
    player: Relation<{ id: string; full_name: string }>
  }>
  team_registration: Relation<{ team: Relation<{ name: string }> }>
}

function firstRelation<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value
}

function fail(error: SupabaseErrorLike | null): void {
  if (!error) return
  // Preserve o código Postgres/PostgREST para que a rota HTTP classifique o erro corretamente.
  const exception = new Error(error.message) as Error & SupabaseErrorLike
  exception.code = error.code
  exception.details = error.details
  exception.hint = error.hint
  throw exception
}

function mapSeason(row: SeasonRow): PublicSeason {
  return {
    id: row.id,
    championshipId: row.championship_id,
    name: row.name,
    edition: row.edition ?? row.year,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    status: row.status,
  }
}

function mapTeam(registration: TeamRegistrationRow): PublicTeam {
  const team = firstRelation(registration.team)
  if (!team) throw new Error('Não foi possível carregar os dados de uma equipe.')

  return {
    registrationId: registration.id,
    teamId: team.id,
    name: team.name,
    shortName: team.short_name ?? null,
    city: team.city ?? null,
    primaryColor: team.primary_color ?? null,
    crestUrl: team.crest_url ?? null,
    foundedYear: team.founded_year ?? null,
  }
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

function mapPlayer(row: PlayerRegistrationRow): PublicPlayer {
  const player = firstRelation(row.player)
  const teamRegistration = firstRelation(row.team_registration)
  const team = teamRegistration ? firstRelation(teamRegistration.team) : null

  return {
    id: player?.id ?? row.player_id,
    name: player?.full_name ?? 'Jogador',
    position: player?.position ?? null,
    photoUrl: player?.photo_url ?? null,
    shirtNumber: row.shirt_number ?? null,
    teamName: team?.name ?? '',
    registrationId: row.team_registration_id,
  }
}

export const publicSupabaseRepository: PublicRepository = {
  async listChampionships() {
    const { data, error } = await supabase
      .from('championships')
      .select('id,name,acronym,description,logo_url')
      .eq('status', 'published')
      .order('name')
    fail(error)

    return ((data ?? []) as unknown as ChampionshipRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      acronym: row.acronym ?? null,
      description: row.description ?? null,
      logoUrl: row.logo_url ?? null,
    }))
  },

  async listSeasons(championshipId) {
    const { data, error } = await supabase
      .from('seasons')
      .select('id,championship_id,name,edition,year,start_date,end_date,status')
      .eq('championship_id', championshipId)
      .in('status', ['active', 'published', 'in_progress'])
      .order('start_date', { ascending: false })
    fail(error)
    return ((data ?? []) as unknown as SeasonRow[]).map(mapSeason)
  },

  async getSeason(seasonId) {
    const { data, error } = await supabase
      .from('seasons')
      .select('id,championship_id,name,edition,year,start_date,end_date,status')
      .eq('id', seasonId)
      .in('status', ['active', 'published', 'in_progress'])
      .single()
    fail(error)
    if (!data) throw new Error('Temporada pública não encontrada.')
    return mapSeason(data as unknown as SeasonRow)
  },

  async listTeams(seasonId, search = '') {
    let query = supabase
      .from('season_team_registrations')
      .select('id,status,team:teams!inner(id,name,short_name,city,primary_color,crest_url,founded_year)')
      .eq('season_id', seasonId)
      .eq('status', 'active')

    if (search) query = query.ilike('team.name', `%${search}%`)

    const { data, error } = await query.order('created_at')
    fail(error)
    return ((data ?? []) as unknown as TeamRegistrationRow[]).map(mapTeam)
  },

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

  async listPlayers(seasonId, search = '') {
    let query = supabase
      .from('season_player_registrations')
      .select(`
        player_id,team_registration_id,shirt_number,
        player:players!inner(id,full_name,position,photo_url),
        team_registration:season_team_registrations!inner(
          id,season_id,team:teams(name)
        )
      `)
      .eq('season_id', seasonId)
      .eq('status', 'active')

    if (search) query = query.ilike('player.full_name', `%${search}%`)

    const { data, error } = await query.order('shirt_number')
    fail(error)
    return ((data ?? []) as unknown as PlayerRegistrationRow[]).map(mapPlayer)
  },

  async getTeamDetails(seasonId, teamId) {
    const teams = await this.listTeams(seasonId)
    const team = teams.find((item) => item.teamId === teamId)
    if (!team) throw new Error('Equipe não encontrada nesta temporada.')

    const [players, allMatches, staffResult] = await Promise.all([
      this.listPlayers(seasonId),
      this.listMatches(seasonId),
      supabase
        .from('team_staff')
        .select('full_name,role,team_registration_id')
        .eq('team_id', teamId)
        .or(`team_registration_id.is.null,team_registration_id.eq.${team.registrationId}`),
    ])
    fail(staffResult.error)

    const matches = allMatches.filter(
      (match) =>
        match.homeRegistrationId === team.registrationId ||
        match.awayRegistrationId === team.registrationId,
    )
    const staffRows = (staffResult.data ?? []) as unknown as StaffRow[]

    return {
      team,
      players: players.filter((player) => player.registrationId === team.registrationId),
      matches,
      staff: staffRows.map((row) => ({ name: row.full_name, role: row.role })),
    }
  },

  async listPreviousSeasons(championshipId) {
    const { data, error } = await supabase
      .from('seasons')
      .select('id,championship_id,name,edition,year,start_date,end_date,status')
      .eq('championship_id', championshipId)
      .eq('status', 'completed')
      .order('end_date', { ascending: false })
    fail(error)
    return ((data ?? []) as unknown as SeasonRow[]).map(mapSeason)
  },

  async countPlayers(seasonId) {
    const { count, error } = await supabase
      .from('season_player_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('season_id', seasonId)
      .eq('status', 'active')
    fail(error)
    return count ?? 0
  },

  async listScorerEvents(seasonId) {
    const { data, error } = await supabase
      .from('match_events')
      .select(`
        player_registration_id,
        match:matches!inner(season_id),
        player_registration:season_player_registrations!match_events_player_registration_id_fkey(
          player:players(id,full_name)
        ),
        team_registration:season_team_registrations(team:teams(name))
      `)
      .eq('match.season_id', seasonId)
      .in('event_type', ['goal', 'penalty_goal'])
      .not('player_registration_id', 'is', null)
    fail(error)

    const rows = (data ?? []) as unknown as ScorerEventRow[]
    return rows.flatMap((row) => {
      const registration = firstRelation(row.player_registration)
      const player = registration ? firstRelation(registration.player) : null
      const teamRegistration = firstRelation(row.team_registration)
      const team = teamRegistration ? firstRelation(teamRegistration.team) : null
      if (!player?.id) return []
      return [{ playerId: player.id, playerName: player.full_name, teamName: team?.name ?? '' }]
    })
  },
}
