import { supabase } from '../../../../apps/api/src/lib/supabase.js'

import type {
  Title,
  TitleChampionshipOption,
  TitleFormData,
  TitleSeasonOption,
  TitleTeamOption,
  TitleFilters,
  TitlesRepository,
} from './titles.types.js'

interface ChampionshipRow {
  id: string
  name: string
}

interface SeasonRow {
  id: string
  championship_id: string
  name: string
}

interface TeamRegistrationRow {
  id: string
  team_id: string
  teams: {
    id: string
    name: string
    short_name: string | null
  }
}

interface TitleRow {
  id: string
  season_id: string
  team_registration_id: string
  awarded_at: string | null
  notes: string | null
  created_at: string
  seasons: {
    name: string
    championship_id: string
    championships: {
      name: string
    }
  }
  season_team_registrations: {
    id: string
    team_id: string
    teams: {
      id: string
      name: string
      short_name: string | null
    }
  }
}

function mapTitle(row: TitleRow): Title {
  return {
    id: row.id,
    seasonId: row.season_id,
    championshipId: row.seasons.championship_id,
    championshipName: row.seasons.championships.name,
    seasonName: row.seasons.name,
    seasonTeamRegistrationId: row.season_team_registrations.id,
    teamId: row.season_team_registrations.teams.id,
    teamName: row.season_team_registrations.teams.name,
    teamShortName: row.season_team_registrations.teams.short_name,
    awardedAt: row.awarded_at,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export const titlesSupabaseRepository: TitlesRepository = {
  async listChampionships(): Promise<TitleChampionshipOption[]> {
    const { data, error } = await supabase
      .from('championships')
      .select('id, name')
      .order('name')

    if (error) throw error

    return (data ?? []).map((row) => row as ChampionshipRow)
  },

  async listSeasons(
    championshipId: string,
  ): Promise<TitleSeasonOption[]> {
    const { data, error } = await supabase
      .from('seasons')
      .select('id, championship_id, name')
      .eq('championship_id', championshipId)
      .order('name', { ascending: false })

    if (error) throw error

    return (data ?? []).map((item) => {
      const row = item as SeasonRow

      return {
        id: row.id,
        championshipId: row.championship_id,
        name: row.name,
      }
    })
  },

  async listTeams(seasonId: string): Promise<TitleTeamOption[]> {
    const { data, error } = await supabase
      .from('season_team_registrations')
      .select(`
        id,
        team_id,
        teams!inner (
          id,
          name,
          short_name
        )
      `)
      .eq('season_id', seasonId)

    if (error) throw error

    return (data ?? []).map((item) => {
      const row = item as unknown as TeamRegistrationRow

      return {
        registrationId: row.id,
        teamId: row.team_id,
        name: row.teams.name,
        shortName: row.teams.short_name,
      }
    })
  },

  async listTitles(filters: TitleFilters): Promise<Title[]> {
    const { data, error } = await supabase
      .from('championship_titles')
      .select(`
        id,
        season_id,
        team_registration_id,
        awarded_at,
        notes,
        created_at,
        seasons!inner (
          name,
          championship_id,
          championships!inner (
            name
          )
        ),
        season_team_registrations!inner (
          id,
          team_id,
          teams!inner (
            id,
            name,
            short_name
          )
        )
      `)
      .eq('season_id', filters.seasonId)
      .eq('seasons.championship_id', filters.championshipId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((item) =>
      mapTitle(item as unknown as TitleRow),
    )
  },

  async createTitle(data: TitleFormData): Promise<Title> {
    const { data: created, error } = await supabase
      .from('championship_titles')
      .insert({
        season_id: data.seasonId,
        team_registration_id: data.seasonTeamRegistrationId,
        awarded_at: data.awardedAt || null,
        notes: data.notes.trim() || null,
      })
      .select(`
        id,
        season_id,
        team_registration_id,
        awarded_at,
        notes,
        created_at,
        seasons!inner (
          name,
          championship_id,
          championships!inner (
            name
          )
        ),
        season_team_registrations!inner (
          id,
          team_id,
          teams!inner (
            id,
            name,
            short_name
          )
        )
      `)
      .single()

    if (error) throw error

    return mapTitle(created as unknown as TitleRow)
  },

  async updateTitle(
    id: string,
    data: TitleFormData,
  ): Promise<Title> {
    const { data: updated, error } = await supabase
      .from('championship_titles')
      .update({
        season_id: data.seasonId,
        team_registration_id: data.seasonTeamRegistrationId,
        awarded_at: data.awardedAt || null,
        notes: data.notes.trim() || null,
      })
      .eq('id', id)
      .select(`
        id,
        season_id,
        team_registration_id,
        awarded_at,
        notes,
        created_at,
        seasons!inner (
          name,
          championship_id,
          championships!inner (
            name
          )
        ),
        season_team_registrations!inner (
          id,
          team_id,
          teams!inner (
            id,
            name,
            short_name
          )
        )
      `)
      .single()

    if (error) throw error

    return mapTitle(updated as unknown as TitleRow)
  },

  async deleteTitle(id: string): Promise<void> {
    const { error } = await supabase
      .from('championship_titles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
