import { supabase } from '../../../../apps/api/src/lib/supabase'

import type {
    DashboardActivity,
    DashboardChampionship,
    DashboardData,
    DashboardFilters,
    DashboardMatch,
    DashboardRepository,
    DashboardSeason,
    DashboardStats,
} from './dashboard.types'

function throwSupabaseError(error: { message: string } | null): void {
  if (error) {
    throw new Error(`Erro ao consultar o Dashboard: ${error.message}`)
  }
}

function isLiveStatus(status: string): boolean {
  return ['live', 'in_progress', 'ongoing'].includes(status.toLowerCase())
}

function isFinishedStatus(status: string): boolean {
  return ['finished', 'completed'].includes(status.toLowerCase())
}

function mapMatch(
  row: Record<string, unknown>,
  teams: Map<string, string>,
): DashboardMatch {
  const homeRegistrationId = String(row.home_registration_id ?? '')
  const awayRegistrationId = String(row.away_registration_id ?? '')

  return {
    id: String(row.id),
    homeTeam: teams.get(homeRegistrationId) ?? 'Equipe não encontrada',
    awayTeam: teams.get(awayRegistrationId) ?? 'Equipe não encontrada',
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    status: String(row.status ?? ''),
    homeScore:
      typeof row.home_score === 'number' ? row.home_score : null,
    awayScore:
      typeof row.away_score === 'number' ? row.away_score : null,
    city: row.city ? String(row.city) : null,
  }
}

async function countRows(
  table: string,
  column?: string,
  value?: string,
): Promise<number> {
  let query = supabase.from(table).select('id', {
    count: 'exact',
    head: true,
  })

  if (column && value) {
    query = query.eq(column, value)
  }

  const { count, error } = await query

  throwSupabaseError(error)

  return count ?? 0
}

export const dashboardSupabaseRepository: DashboardRepository = {
  async listChampionships(): Promise<DashboardChampionship[]> {
    const { data, error } = await supabase
      .from('championships')
      .select('id, name')
      .order('name')

    throwSupabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    }))
  },

  async listSeasons(
    championshipId: string,
  ): Promise<DashboardSeason[]> {
    let query = supabase
      .from('seasons')
      .select('id, championship_id, name')
      .order('name')

    if (championshipId) {
      query = query.eq('championship_id', championshipId)
    }

    const { data, error } = await query

    throwSupabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      championshipId: row.championship_id,
      name: row.name,
    }))
  },

  async getDashboardData(
    filters: DashboardFilters,
  ): Promise<DashboardData> {
    const [championships, seasons, teamsCount, playersCount] =
      await Promise.all([
        countRows('championships'),
        countRows('seasons', 'championship_id', filters.championshipId),
        countRows('teams', 'championship_id', filters.championshipId),
        filters.seasonId
          ? countRows('season_player_registrations', 'season_id', filters.seasonId)
          : countRows('players'),
      ])

    let matchesQuery = supabase
      .from('matches')
      .select(
        'id, home_registration_id, away_registration_id, scheduled_at, status, home_score, away_score, city',
      )
      .order('scheduled_at', { ascending: true })

    let matchData: Array<Record<string, unknown>> = []
    if (filters.seasonId) {
      matchesQuery = matchesQuery.eq('season_id', filters.seasonId)
      const { data: matchRows, error: matchesError } = await matchesQuery
      throwSupabaseError(matchesError)
      matchData = (matchRows ?? []) as Array<Record<string, unknown>>
    } else if (filters.championshipId) {
      const { data: seasonRows, error: seasonError } = await supabase
        .from('seasons').select('id').eq('championship_id', filters.championshipId)
      throwSupabaseError(seasonError)
      const seasonIds = (seasonRows ?? []).map((season) => season.id)
      if (seasonIds.length) {
        matchesQuery = matchesQuery.in('season_id', seasonIds)
        const { data: matchRows, error: matchesError } = await matchesQuery
        throwSupabaseError(matchesError)
        matchData = (matchRows ?? []) as Array<Record<string, unknown>>
      }
    } else {
      const { data: matchRows, error: matchesError } = await matchesQuery
      throwSupabaseError(matchesError)
      matchData = (matchRows ?? []) as Array<Record<string, unknown>>
    }

    const registrationIds = [...new Set(matchData.flatMap((match) => [match.home_registration_id, match.away_registration_id]).filter((id): id is string => typeof id === 'string'))]
    const teamMap = new Map<string, string>()

    if (registrationIds.length > 0) {
      const { data: registrationRows, error: registrationError } = await supabase
        .from('season_team_registrations').select('id,team_id').in('id', registrationIds)
      throwSupabaseError(registrationError)
      const teamIds = [...new Set((registrationRows ?? []).map((row) => row.team_id))]
      const { data: teamRows, error: teamsError } = await supabase
        .from('teams').select('id,name').in('id', teamIds)
      throwSupabaseError(teamsError)
      const namesByTeam = new Map((teamRows ?? []).map((team) => [team.id, team.name]))
      for (const registration of registrationRows ?? []) {
        teamMap.set(registration.id, namesByTeam.get(registration.team_id) ?? 'Equipe não encontrada')
      }
    }

    const matches = matchData.map((row) =>
      mapMatch(row as Record<string, unknown>, teamMap),
    )

    const liveMatches = matches.filter((match) =>
      isLiveStatus(match.status),
    )

    const completedMatches = matches.filter((match) =>
      isFinishedStatus(match.status),
    )

    const upcomingMatches = matches
      .filter(
        (match) =>
          !isLiveStatus(match.status) &&
          !isFinishedStatus(match.status),
      )
      .filter((match) => {
        if (!match.scheduledAt) return true
        return new Date(match.scheduledAt).getTime() >= Date.now()
      })
      .slice(0, 5)

    const recentResults = completedMatches
      .sort((a, b) => {
        return (
          new Date(b.scheduledAt ?? 0).getTime() -
          new Date(a.scheduledAt ?? 0).getTime()
        )
      })
      .slice(0, 5)

    const { data: canReadAudit, error: permissionError } = await supabase.rpc('has_permission', { permission_key: 'audit.read' })
    throwSupabaseError(permissionError)
    let activities: DashboardActivity[] = []
    if (canReadAudit) {
      const { data: activityRows, error: activityError } = await supabase
        .from('audit_logs')
        .select('id, user_name, action, module, description, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      throwSupabaseError(activityError)
      activities = (activityRows ?? []).map((row) => ({
        id: row.id, userName: row.user_name ?? 'Usuário', action: row.action ?? '',
        module: row.module ?? '', description: row.description ?? '', createdAt: row.created_at,
      }))
    }

    const stats: DashboardStats = {
      championships,
      seasons,
      teams: teamsCount,
      players: playersCount,
      matches: matches.length,
      completedMatches: completedMatches.length,
      upcomingMatches: upcomingMatches.length,
      liveMatches: liveMatches.length,
    }

    return {
      stats,
      liveMatches,
      upcomingMatches,
      recentResults,
      activities,
    }
  },
}
