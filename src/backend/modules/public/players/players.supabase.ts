import { supabase } from '../../../../../apps/api/src/lib/supabase.js'
import { fail, firstRelation } from '../shared/supabase.helpers.js'
import type { Relation } from '../shared/supabase.helpers.js'
import type { PlayersRepository } from './players.repository.js'
import type { PublicPlayer } from './players.types.js'

// Consultas da página pública: Jogadores.
// O portal público mostra do jogador apenas nome, posição, foto, número e equipe.

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

export const playersSupabaseRepository: PlayersRepository = {
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
}
