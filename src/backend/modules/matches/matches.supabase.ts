
import { supabase } from '../../../../apps/api/src/lib/supabase'

import type {
  ChampionshipOption,
  Match,
  MatchEvent,
  MatchEventFormData,
  MatchFilters,
  MatchFormData,
  MatchRepository,
  MatchStatusUpdate,
  MatchTeamOption,
  PhaseOption,
  RoundOption,
  SeasonOption,
} from './matches.types'

interface MatchRow {
  id: string
  season_id: string
  phase_id: string
  group_id: string | null
  round_id: string | null
  home_registration_id: string
  away_registration_id: string
  city: string | null
  venue: string | null
  scheduled_at: string | null
  started_at: string | null
  finished_at: string | null
  home_score: number
  away_score: number
  status: Match['status']
  notes: string | null
  created_at: string
  updated_at: string
}

interface MatchEventRow {
  id: string
  match_id: string
  team_registration_id: string
  player_registration_id: string | null
  related_player_registration_id: string | null
  event_type: MatchEvent['eventType']
  minute: number
  added_time: number
  description: string | null
  created_at: string
}

interface MatchEventScoreRow {
  team_registration_id: string
  event_type: MatchEvent['eventType']
}

interface TeamRegistrationRow {
  id: string
  team_id: string
  status: string
}

interface TeamRow {
  id: string
  name: string
}

interface PhaseRow {
  id: string
  name: string
}

interface RoundRow {
  id: string
  phase_id: string
  group_id: string | null
  round_number: number
}

function mapMatch(
  row: MatchRow,
  homeTeamName = 'Equipe mandante',
  awayTeamName = 'Equipe visitante',
  phaseName = 'Fase',
): Match {
  return {
    id: row.id,
    seasonId: row.season_id,
    phaseId: row.phase_id,
    groupId: row.group_id,
    roundId: row.round_id,
    homeRegistrationId: row.home_registration_id,
    awayRegistrationId: row.away_registration_id,
    city: row.city,
    venue: row.venue,
    scheduledAt: row.scheduled_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    homeScore: row.home_score,
    awayScore: row.away_score,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    homeTeamName,
    awayTeamName,
    phaseName,
  }
}

function mapEvent(row: MatchEventRow): MatchEvent {
  return {
    id: row.id,
    matchId: row.match_id,
    teamRegistrationId: row.team_registration_id,
    playerRegistrationId: row.player_registration_id,
    relatedPlayerRegistrationId: row.related_player_registration_id,
    eventType: row.event_type,
    minute: row.minute,
    addedTime: row.added_time,
    description: row.description,
    createdAt: row.created_at,
  }
}

function toDatabase(data: MatchFormData) {
  return {
    season_id: data.seasonId,
    phase_id: data.phaseId,
    group_id: data.groupId || null,
    round_id: data.roundId || null,
    home_registration_id: data.homeRegistrationId,
    away_registration_id: data.awayRegistrationId,
    city: data.city || null,
    venue: data.venue || null,
    scheduled_at: data.scheduledAt
      ? new Date(data.scheduledAt).toISOString()
      : null,
    notes: data.notes || null,
  }
}

function eventToDatabase(data: MatchEventFormData) {
  return {
    team_registration_id: data.teamRegistrationId,
    player_registration_id: data.playerRegistrationId || null,
    related_player_registration_id:
      data.relatedPlayerRegistrationId || null,
    event_type: data.eventType,
    minute: data.minute,
    added_time: data.addedTime,
    description: data.description || null,
  }
}

async function getTeamNames(
  registrations: TeamRegistrationRow[],
): Promise<Map<string, string>> {
  const teamIds = [...new Set(registrations.map((item) => item.team_id))]

  if (teamIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', teamIds)

  if (error) throw new Error(error.message)

  const teams = (data ?? []) as TeamRow[]

  return new Map(teams.map((team) => [team.id, team.name]))
}

async function getRegistrationNames(
  registrationIds: string[],
): Promise<Map<string, string>> {
  if (registrationIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('season_team_registrations')
    .select('id, team_id, status')
    .in('id', registrationIds)

  if (error) throw new Error(error.message)

  const registrations = (data ?? []) as TeamRegistrationRow[]
  const teamNames = await getTeamNames(registrations)

  return new Map(
    registrations.map((registration) => [
      registration.id,
      teamNames.get(registration.team_id) ?? 'Equipe não encontrada',
    ]),
  )
}

async function getPhaseNames(
  phaseIds: string[],
): Promise<Map<string, string>> {
  if (phaseIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('competition_phases')
    .select('id, name')
    .in('id', phaseIds)

  if (error) throw new Error(error.message)

  const phases = (data ?? []) as PhaseRow[]

  return new Map(phases.map((phase) => [phase.id, phase.name]))
}

async function hydrateMatches(rows: MatchRow[]): Promise<Match[]> {
  const registrationIds = rows.flatMap((row) => [
    row.home_registration_id,
    row.away_registration_id,
  ])

  const phaseIds = [...new Set(rows.map((row) => row.phase_id))]

  const [teamNames, phaseNames] = await Promise.all([
    getRegistrationNames(registrationIds),
    getPhaseNames(phaseIds),
  ])

  return rows.map((row) =>
    mapMatch(
      row,
      teamNames.get(row.home_registration_id),
      teamNames.get(row.away_registration_id),
      phaseNames.get(row.phase_id),
    ),
  )
}

async function getHydratedMatch(id: string): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)

  const [match] = await hydrateMatches([data as MatchRow])

  if (!match) {
    throw new Error('Não foi possível carregar a partida.')
  }

  return match
}

async function recalculateMatchScore(matchId: string): Promise<Match> {
  const match = await getHydratedMatch(matchId)

  const { data, error } = await supabase
    .from('match_events')
    .select('team_registration_id, event_type')
    .eq('match_id', matchId)

  if (error) throw new Error(error.message)

  const events = (data ?? []) as MatchEventScoreRow[]

  let homeScore = 0
  let awayScore = 0

  for (const event of events) {
    const isHomeTeam =
      event.team_registration_id === match.homeRegistrationId

    const isAwayTeam =
      event.team_registration_id === match.awayRegistrationId

    if (!isHomeTeam && !isAwayTeam) continue

    const isGoal =
      event.event_type === 'goal' ||
      event.event_type === 'penalty_goal'

    if (isGoal) {
      if (isHomeTeam) homeScore += 1
      if (isAwayTeam) awayScore += 1
    }

    if (event.event_type === 'own_goal') {
      if (isHomeTeam) awayScore += 1
      if (isAwayTeam) homeScore += 1
    }
  }

  const { error: updateError } = await supabase
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
    })
    .eq('id', matchId)

  if (updateError) throw new Error(updateError.message)

  return getHydratedMatch(matchId)
}

export const matchSupabaseRepository: MatchRepository = {
  async list(filters: MatchFilters) {
    let query = supabase
      .from('matches')
      .select('*')
      .order('scheduled_at', { ascending: true })

    if (filters.seasonId) {
      query = query.eq('season_id', filters.seasonId)
    }

    if (filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    const matches = await hydrateMatches((data ?? []) as MatchRow[])
    const search = filters.search.trim().toLocaleLowerCase('pt-BR')

    if (!search) return matches

    return matches.filter((match) =>
      [
        match.homeTeamName,
        match.awayTeamName,
        match.city ?? '',
        match.venue ?? '',
        match.phaseName,
      ].some((value) =>
        value.toLocaleLowerCase('pt-BR').includes(search),
      ),
    )
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return null

    const [match] = await hydrateMatches([data as MatchRow])
    return match ?? null
  },

  async create(data: MatchFormData) {
    const { data: created, error } = await supabase
      .from('matches')
      .insert(toDatabase(data))
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    const [match] = await hydrateMatches([created as MatchRow])
    return match
  },

  async update(id: string, data: MatchFormData) {
    const { data: updated, error } = await supabase
      .from('matches')
      .update(toDatabase(data))
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    const [match] = await hydrateMatches([updated as MatchRow])
    return match
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async listEvents(matchId: string) {
    const { data, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', matchId)
      .order('minute', { ascending: true })
      .order('added_time', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    return ((data ?? []) as MatchEventRow[]).map(mapEvent)
  },

  async createEvent(matchId: string, data: MatchEventFormData) {
    const { data: created, error } = await supabase
      .from('match_events')
      .insert({
        match_id: matchId,
        ...eventToDatabase(data),
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    await recalculateMatchScore(matchId)

    return mapEvent(created as MatchEventRow)
  },

  async updateEvent(
    matchId: string,
    eventId: string,
    data: MatchEventFormData,
  ) {
    const { data: updated, error } = await supabase
      .from('match_events')
      .update(eventToDatabase(data))
      .eq('id', eventId)
      .eq('match_id', matchId)
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    await recalculateMatchScore(matchId)

    return mapEvent(updated as MatchEventRow)
  },

  async deleteEvent(matchId: string, eventId: string) {
    const { error } = await supabase
      .from('match_events')
      .delete()
      .eq('id', eventId)
      .eq('match_id', matchId)

    if (error) throw new Error(error.message)

    await recalculateMatchScore(matchId)
  },

  async updateStatus(matchId: string, data: MatchStatusUpdate) {
    const updateData: {
      status: MatchStatusUpdate['status']
      started_at?: string | null
      finished_at?: string | null
    } = {
      status: data.status,
    }

    if (data.startedAt !== undefined) {
      updateData.started_at = data.startedAt
    }

    if (data.finishedAt !== undefined) {
      updateData.finished_at = data.finishedAt
    }

    const { error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', matchId)

    if (error) throw new Error(error.message)

    return getHydratedMatch(matchId)
  },

  async recalculateScore(matchId: string) {
    return recalculateMatchScore(matchId)
  },

  async listChampionships() {
    const { data, error } = await supabase
      .from('championships')
      .select('id, name')
      .order('name')

    if (error) throw new Error(error.message)

    return (data ?? []) as ChampionshipOption[]
  },

  async listSeasons(championshipId: string) {
    const { data, error } = await supabase
      .from('seasons')
      .select('id, championship_id, name')
      .eq('championship_id', championshipId)
      .order('name', { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map((row) => ({
      id: row.id,
      championshipId: row.championship_id,
      name: row.name,
    })) as SeasonOption[]
  },

  async listPhases(seasonId: string) {
    const { data, error } = await supabase
      .from('competition_phases')
      .select('id, season_id, name')
      .eq('season_id', seasonId)
      .order('created_at')

    if (error) throw new Error(error.message)

    return (data ?? []).map((row) => ({
      id: row.id,
      seasonId: row.season_id,
      name: row.name,
    })) as PhaseOption[]
  },

  async listGroups(phaseId: string) {
    const { data, error } = await supabase
      .from('competition_groups')
      .select('id, phase_id, name')
      .eq('phase_id', phaseId)
      .order('name')

    if (error) throw new Error(error.message)

    return (data ?? []).map((row) => ({
      id: row.id,
      phaseId: row.phase_id,
      name: row.name,
    }))
  },

  async listRounds(phaseId: string, groupId: string) {
    let query = supabase
      .from('competition_rounds')
      .select('id, phase_id, group_id, round_number')
      .eq('phase_id', phaseId)

    query = groupId
      ? query.eq('group_id', groupId)
      : query.is('group_id', null)

    const { data, error } = await query.order('round_number')

    if (error) throw new Error(error.message)

    return ((data ?? []) as RoundRow[]).map((row) => ({
      id: row.id,
      phaseId: row.phase_id,
      groupId: row.group_id,
      name: `Rodada ${row.round_number}`,
    })) as RoundOption[]
  },

  async listTeams(seasonId: string) {
    const { data, error } = await supabase
      .from('season_team_registrations')
      .select('id, team_id, status')
      .eq('season_id', seasonId)
      .eq('status', 'active')

    if (error) throw new Error(error.message)

    const registrations = (data ?? []) as TeamRegistrationRow[]
    const teamNames = await getTeamNames(registrations)

    return registrations.map((registration) => ({
      registrationId: registration.id,
      teamId: registration.team_id,
      teamName:
        teamNames.get(registration.team_id) ?? 'Equipe não encontrada',
    })) as MatchTeamOption[]
  },
}
