import { supabase } from '../../../../apps/api/src/lib/supabase.js'
import type { Player, PlayerRepository, PlayerListFilters, PlayerTeamOption } from './player.types.js'

type PlayerRow = { id: string; full_name: string; birth_date: string | null; position: Player['position']; photo_url: string | null; status: Player['status']; created_at: string }
type RegistrationRow = { player_id: string; shirt_number: number | null; season_id: string; team_id: string; team_registration_id: string; created_at: string }
type TeamRow = { id: string; championship_id: string; name: string }

function mapPlayer(row: PlayerRow, championshipId = '', shirtNumber: number | null = null): Player {
  return { id: row.id, championshipId, fullName: row.full_name, birthDate: row.birth_date,
    position: row.position, shirtNumber, photoUrl: row.photo_url, status: row.status ?? 'active', createdAt: row.created_at }
}

export const playerRepository: PlayerRepository = {
  async list(filters?: PlayerListFilters) {
    let registrationsQuery = supabase.from('season_player_registrations')
      .select('player_id,shirt_number,season_id,team_id,team_registration_id,created_at')
      .eq('status', 'active')
    if (filters?.seasonId) registrationsQuery = registrationsQuery.eq('season_id', filters.seasonId)
    if (filters?.teamId) registrationsQuery = registrationsQuery.eq('team_id', filters.teamId)
    const { data: registrationData, error: registrationError } = await registrationsQuery.order('created_at', { ascending: false })
    if (registrationError) throw new Error(registrationError.message)
    let registrations = (registrationData ?? []) as RegistrationRow[]
    if (filters?.championshipId) {
      const { data: teamData, error } = await supabase.from('teams').select('id').eq('championship_id', filters.championshipId)
      if (error) throw new Error(error.message)
      const teamIds = new Set((teamData ?? []).map((team) => team.id))
      registrations = registrations.filter((item) => teamIds.has(item.team_id))
    }
    const registrationByPlayer = new Map<string, RegistrationRow>()
    for (const registration of registrations) if (!registrationByPlayer.has(registration.player_id)) registrationByPlayer.set(registration.player_id, registration)
    const playerIds = [...registrationByPlayer.keys()]
    if (!playerIds.length) return []
    let playersQuery = supabase.from('players').select('id,full_name,birth_date,position,photo_url,status,created_at').in('id', playerIds).order('full_name')
    if (filters?.search?.trim()) playersQuery = playersQuery.ilike('full_name', `%${filters.search.trim()}%`)
    const { data, error } = await playersQuery
    if (error) throw new Error(error.message)
    const teamIds = [...new Set(registrations.map((item) => item.team_id))]
    const { data: teamsData, error: teamsError } = await supabase.from('teams').select('id,championship_id,name').in('id', teamIds)
    if (teamsError) throw new Error(teamsError.message)
    const teams = new Map(((teamsData ?? []) as TeamRow[]).map((team) => [team.id, team]))
    return ((data ?? []) as PlayerRow[]).map((row) => {
      const registration = registrationByPlayer.get(row.id)!
      return mapPlayer(row, teams.get(registration.team_id)?.championship_id ?? '', registration.shirt_number)
    })
  },

  async findById(id: string) {
    const { data, error } = await supabase.from('players')
      .select('id,full_name,birth_date,position,photo_url,status,created_at').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    const { data: registration, error: registrationError } = await supabase.from('season_player_registrations')
      .select('shirt_number,team_id,created_at').eq('player_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (registrationError) throw new Error(registrationError.message)
    if (!registration) return mapPlayer(data as PlayerRow)
    const { data: team, error: teamError } = await supabase.from('teams').select('championship_id').eq('id', registration.team_id).maybeSingle()
    if (teamError) throw new Error(teamError.message)
    return mapPlayer(data as PlayerRow, team?.championship_id ?? '', registration.shirt_number)
  },

  async create(data) {
    const { data: created, error } = await supabase.from('players').insert({
      full_name: data.fullName, birth_date: data.birthDate, position: data.position,
      photo_url: data.photoUrl, status: data.status,
    }).select('id,full_name,birth_date,position,photo_url,status,created_at').single()
    if (error) throw new Error(error.message)
    return mapPlayer(created as PlayerRow, data.championshipId, data.shirtNumber)
  },

  async update(id, data) {
    const payload: Record<string, unknown> = {}
    if (data.fullName !== undefined) payload.full_name = data.fullName
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate
    if (data.position !== undefined) payload.position = data.position
    if (data.photoUrl !== undefined) payload.photo_url = data.photoUrl
    if (data.status !== undefined) payload.status = data.status
    const { data: updated, error } = await supabase.from('players').update(payload).eq('id', id)
      .select('id,full_name,birth_date,position,photo_url,status,created_at').single()
    if (error) throw new Error(error.message)
    const { data: registration, error: registrationError } = await supabase.from('season_player_registrations')
      .select('shirt_number,team_id,created_at').eq('player_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (registrationError) throw new Error(registrationError.message)
    let championshipId = data.championshipId ?? ''
    if (registration && !championshipId) {
      const { data: team, error: teamError } = await supabase.from('teams').select('championship_id').eq('id', registration.team_id).maybeSingle()
      if (teamError) throw new Error(teamError.message)
      championshipId = team?.championship_id ?? ''
    }
    return mapPlayer(updated as PlayerRow, championshipId, data.shirtNumber ?? registration?.shirt_number ?? null)
  },

  async delete(id) {
    const { error: registrationsError } = await supabase.from('season_player_registrations').delete().eq('player_id', id)
    if (registrationsError) throw new Error(registrationsError.message)
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  async registerInSeason(playerId, teamId, seasonId, shirtNumber) {
    const { data: teamRegistration, error: lookupError } = await supabase.from('season_team_registrations')
      .select('id').eq('team_id', teamId).eq('season_id', seasonId).maybeSingle()
    if (lookupError) throw new Error(lookupError.message)
    if (!teamRegistration) throw new Error('A equipe ainda não está inscrita nesta temporada.')
    const { error } = await supabase.from('season_player_registrations').upsert({
      player_id: playerId, team_registration_id: teamRegistration.id, team_id: teamId,
      season_id: seasonId, shirt_number: shirtNumber, status: 'active',
    }, { onConflict: 'player_id,season_id' })
    if (error) throw new Error(error.message)
  },

  async uploadPhoto(file, playerId) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${playerId}/photo.${extension}`
    const { error } = await supabase.storage.from('player-photos').upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw new Error(error.message)
    return supabase.storage.from('player-photos').getPublicUrl(path).data.publicUrl
  },

  async listChampionships() {
    const { data, error } = await supabase.from('championships').select('id,name').order('name')
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async listSeasons(championshipId) {
    const { data, error } = await supabase.from('seasons').select('id,name,championship_id').eq('championship_id', championshipId).order('name')
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => ({ id: row.id, name: row.name, championshipId: row.championship_id }))
  },

  async listTeams(seasonId): Promise<PlayerTeamOption[]> {
    const { data, error } = await supabase.from('season_team_registrations')
      .select('team:teams!inner(id,name)').eq('season_id', seasonId).eq('status', 'active')
    if (error) throw new Error(error.message)
    return (data ?? []).flatMap((row) => {
      const team = Array.isArray(row.team) ? row.team[0] : row.team
      return team ? [{ id: team.id, name: team.name }] : []
    })
  },
}
