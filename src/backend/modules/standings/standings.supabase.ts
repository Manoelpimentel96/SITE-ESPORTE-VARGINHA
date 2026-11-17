
import { supabase } from '../../../../apps/api/src/lib/supabase.js'

import type {
  StandingsChampionshipOption,
  StandingsGroupOption,
  StandingsMatch,
  StandingsMatchEvent,
  StandingsPhaseOption,
  StandingsRegistration,
  StandingsRepository,
  StandingsRules,
  StandingsSeasonOption,
} from './standings.types.js'

function throwDatabaseError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function mapRules(settings: Record<string, unknown> | null): StandingsRules {
  const scoring = (settings?.scoring ?? {}) as Record<string, unknown>
  const tieBreakers = settings?.tieBreakers ?? settings?.orderBy

  return {
    pointsPerWin:
      typeof scoring.pointsPerWin === 'number' ? scoring.pointsPerWin : 3,
    pointsPerDraw:
      typeof scoring.pointsPerDraw === 'number' ? scoring.pointsPerDraw : 1,
    pointsPerLoss:
      typeof scoring.pointsPerLoss === 'number' ? scoring.pointsPerLoss : 0,
    tieBreakers: Array.isArray(tieBreakers)
      ? tieBreakers.filter((item): item is StandingsRules['tieBreakers'][number] =>
          typeof item === 'string',
        )
      : ['points', 'wins', 'goal_difference', 'goals_for'],
  }
}

export const standingsSupabaseRepository: StandingsRepository = {
  async listChampionships(): Promise<StandingsChampionshipOption[]> {
    const { data, error } = await supabase
      .from('championships')
      .select('id, name')
      .order('name')

    throwDatabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    }))
  },

  async listSeasons(championshipId): Promise<StandingsSeasonOption[]> {
    const { data, error } = await supabase
      .from('seasons')
      .select('id, championship_id, name')
      .eq('championship_id', championshipId)
      .order('name', { ascending: false })

    throwDatabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      championshipId: row.championship_id,
      name: row.name,
    }))
  },

  async listPhases(seasonId): Promise<StandingsPhaseOption[]> {
    const { data, error } = await supabase
      .from('competition_phases')
      .select('id, name')
      .eq('season_id', seasonId)
      .order('name')

    throwDatabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    }))
  },

  async listGroups(phaseId): Promise<StandingsGroupOption[]> {
    const { data, error } = await supabase
      .from('competition_groups')
      .select('id, name')
      .eq('phase_id', phaseId)
      .order('name')

    throwDatabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    }))
  },

  async listMatches(seasonId): Promise<StandingsMatch[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        season_id,
        phase_id,
        group_id,
        home_registration_id,
        away_registration_id,
        home_score,
        away_score,
        status
      `)
      .eq('season_id', seasonId)

    throwDatabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      seasonId: row.season_id,
      phaseId: row.phase_id,
      groupId: row.group_id,
      homeRegistrationId: row.home_registration_id,
      awayRegistrationId: row.away_registration_id,
      homeScore: row.home_score,
      awayScore: row.away_score,
      status: row.status,
    }))
  },

  async listRegistrations(seasonId): Promise<StandingsRegistration[]> {
    const { data, error } = await supabase
      .from('season_team_registrations')
      .select(`
        id,
        team_id,
        teams (
          id,
          name,
          short_name
        )
      `)
      .eq('season_id', seasonId)

    throwDatabaseError(error)

    return (data ?? []).flatMap((row) => {
      const team = Array.isArray(row.teams) ? row.teams[0] : row.teams

      if (!team) return []

      return [{
        id: row.id,
        teamId: row.team_id,
        team: {
          id: team.id,
          name: team.name,
          shortName: team.short_name ?? null,
        },
      }]
    })
  },

  async listMatchEvents(seasonId): Promise<StandingsMatchEvent[]> {
    const { data, error } = await supabase
      .from('match_events')
      .select(`
        event_type,
        match_id,
        team_registration_id,
        matches!inner (
          season_id
        )
      `)
      .eq('matches.season_id', seasonId)

    throwDatabaseError(error)

    return (data ?? []).map((row) => ({
      matchId: row.match_id,
      registrationId: row.team_registration_id,
      type: row.event_type,
    }))
  },

  async getRules(seasonId): Promise<StandingsRules> {
    const { data, error } = await supabase
      .from('competition_regulations')
      .select('scoring_settings,classification_settings')
      .eq('season_id', seasonId)
      .maybeSingle()

    throwDatabaseError(error)

    if (!data) {
      throw new Error(
        'O regulamento desta temporada não foi encontrado.',
      )
    }

    return mapRules({ scoring: data.scoring_settings, orderBy: (data.classification_settings as Record<string, unknown> | null)?.orderBy })
  },

  subscribeToSeason(seasonId, onChange) {
    const channel = supabase
      .channel(`standings-season-${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `season_id=eq.${seasonId}`,
        },
        onChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_events',
        },
        onChange,
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  },
}
