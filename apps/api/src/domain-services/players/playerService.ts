import {
  listPlayers as backendListPlayers,
  getPlayer as backendGetPlayer,
  savePlayer as backendSavePlayer,
  deletePlayer as backendDeletePlayer,
  listPlayerChampionships,
  listPlayerSeasons,
  listPlayerTeams,
} from '../../../../../src/backend/modules/players/player.use-cases'

import type {
  Player,
  PlayerFormData,
  PlayerListFilters,
  PlayerResult,
} from '../../../../../src/backend/modules/players/player.types'

export type {
  Player,
  PlayerFormData,
  PlayerListFilters,
  PlayerResult,
  PlayerPosition,
  PlayerStatus,
  PlayerChampionshipOption,
  PlayerSeasonOption,
  PlayerTeamOption,
} from '../../../../../src/backend/modules/players/player.types'

export async function listPlayers(filters?: PlayerListFilters): Promise<Player[]> {
  return backendListPlayers(filters)
}

export async function getPlayer(id: string): Promise<Player | null> {
  return backendGetPlayer(id)
}

export async function savePlayer(data: PlayerFormData): Promise<PlayerResult> {
  return backendSavePlayer(data)
}

export async function deletePlayer(id: string): Promise<PlayerResult> {
  return backendDeletePlayer(id)
}

export async function listChampionships() {
  return listPlayerChampionships()
}

export async function listSeasons(championshipId: string) {
  return listPlayerSeasons(championshipId)
}

export async function listTeams(seasonId: string) {
  return listPlayerTeams(seasonId)
}
