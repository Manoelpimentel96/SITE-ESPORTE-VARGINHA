
import { supabase } from '../../../../apps/api/src/lib/supabase'

import type {
  Team,
  TeamRepository,
  TeamListFilters,
  ChampionshipOption,
  SeasonOption,
} from './team.types'

interface TeamRow {
  id: string
  championship_id: string
  name: string
  short_name: string | null
  city: string | null
  primary_color: string | null
  founded_year: number | null
  crest_url: string | null
  status: Team['status'] | null
  created_at: string
}

interface ChampionshipRow {
  id: string
  name: string
}

interface SeasonRow {
  id: string
  name: string
  championship_id: string
}

function mapTeam(row: TeamRow): Team {
  return {
    id: row.id,
    championshipId: row.championship_id,
    name: row.name,
    shortName: row.short_name ?? null,
    city: row.city ?? null,
    primaryColor: row.primary_color ?? null,
    foundedYear: row.founded_year ?? null,
    crestUrl: row.crest_url ?? null,
    status: row.status ?? 'active',
    createdAt: row.created_at,
  }
}

export const teamRepository: TeamRepository = {
  async list(filters?: TeamListFilters) {
    let query = supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })

    if (filters?.championshipId) {
      query = query.eq('championship_id', filters.championshipId)
    }

    if (filters?.search?.trim()) {
      query = query.ilike('name', `%${filters.search.trim()}%`)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return ((data ?? []) as TeamRow[]).map(mapTeam)
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(error.message)

    return data ? mapTeam(data as TeamRow) : null
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('teams')
      .insert({
        championship_id: data.championshipId,
        name: data.name,
        short_name: data.shortName,
        city: data.city,
        primary_color: data.primaryColor,
        founded_year: data.foundedYear,
        crest_url: data.crestUrl,
        status: data.status,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return mapTeam(created as TeamRow)
  },

  async update(id, data) {
    const payload: Record<string, unknown> = {}

    if (data.championshipId !== undefined) {
      payload.championship_id = data.championshipId
    }

    if (data.name !== undefined) payload.name = data.name
    if (data.shortName !== undefined) payload.short_name = data.shortName
    if (data.city !== undefined) payload.city = data.city
    if (data.primaryColor !== undefined) {
      payload.primary_color = data.primaryColor
    }
    if (data.foundedYear !== undefined) {
      payload.founded_year = data.foundedYear
    }
    if (data.crestUrl !== undefined) payload.crest_url = data.crestUrl
    if (data.status !== undefined) payload.status = data.status

    const { data: updated, error } = await supabase
      .from('teams')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return mapTeam(updated as TeamRow)
  },

  async delete(id) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async saveStaff(teamId, seasonId, role, name) {
    let teamRegistrationId: string | null = null
    if (seasonId) {
      const { data: registration, error: registrationError } = await supabase
        .from('season_team_registrations').select('id')
        .eq('team_id', teamId).eq('season_id', seasonId).maybeSingle()
      if (registrationError) throw new Error(registrationError.message)
      if (!registration) throw new Error('A equipe precisa estar inscrita na temporada antes de cadastrar a comissão técnica.')
      teamRegistrationId = registration.id
    }

    let existingQuery = supabase.from('team_staff').select('id').eq('team_id', teamId).eq('role', role)
    existingQuery = teamRegistrationId
      ? existingQuery.eq('team_registration_id', teamRegistrationId)
      : existingQuery.is('team_registration_id', null)
    const { data: existing, error: lookupError } = await existingQuery.maybeSingle()
    if (lookupError) throw new Error(lookupError.message)

    const result = existing
      ? await supabase.from('team_staff').update({ full_name: name.trim() }).eq('id', existing.id)
      : await supabase.from('team_staff').insert({ team_id: teamId, team_registration_id: teamRegistrationId, role, full_name: name.trim() })
    if (result.error) throw new Error(result.error.message)
  },

  async deleteStaff(teamId, seasonId, role) {
    let query = supabase.from('team_staff').delete().eq('team_id', teamId).eq('role', role)
    if (seasonId) {
      const { data: registration, error: registrationError } = await supabase.from('season_team_registrations')
        .select('id').eq('team_id', teamId).eq('season_id', seasonId).maybeSingle()
      if (registrationError) throw new Error(registrationError.message)
      if (!registration) return
      query = query.eq('team_registration_id', registration.id)
    } else {
      query = query.is('team_registration_id', null)
    }
    const { error } = await query
    if (error) throw new Error(error.message)
  },

  async saveSeasonRegistration(teamId, seasonId) {
    const { error } = await supabase
      .from('season_team_registrations')
      .upsert(
        {
          team_id: teamId,
          season_id: seasonId,
          status: 'active',
        },
        {
          onConflict: 'season_id,team_id',
        },
      )

    if (error) throw new Error(error.message)
  },

  async uploadCrest(file, teamId) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filePath = `${teamId}/crest.${extension}`

    const { error } = await supabase.storage
      .from('team-crests')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage
      .from('team-crests')
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  async listChampionships() {
    const { data, error } = await supabase
      .from('championships')
      .select('id, name')
      .order('name')

    if (error) throw new Error(error.message)

    return ((data ?? []) as ChampionshipRow[]) as ChampionshipOption[]
  },

  async listSeasons(championshipId) {
    const { data, error } = await supabase
      .from('seasons')
      .select('id, name, championship_id')
      .eq('championship_id', championshipId)
      .order('name')

    if (error) throw new Error(error.message)

    return ((data ?? []) as SeasonRow[]).map((season) => ({
      id: season.id,
      name: season.name,
      championshipId: season.championship_id,
    })) as SeasonOption[]
  },
}
