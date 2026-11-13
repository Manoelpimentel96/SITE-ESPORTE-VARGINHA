import { domainCall } from '../../lib/domainApi'
import type { Player, PlayerFormData, PlayerListFilters, PlayerResult, PlayerChampionshipOption, PlayerSeasonOption, PlayerTeamOption } from '../../backend/modules/players/player.types'
export type { Player, PlayerFormData, PlayerListFilters, PlayerResult, PlayerPosition, PlayerStatus, PlayerChampionshipOption, PlayerSeasonOption, PlayerTeamOption } from '../../backend/modules/players/player.types'
export const listPlayers = (filters?: PlayerListFilters) => domainCall<Player[]>('players', 'listPlayers', filters)
export const getPlayer = (id: string) => domainCall<Player | null>('players', 'getPlayer', id)
async function encodeFile(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  return { name: file.name, type: file.type, base64: btoa(binary) }
}
export const savePlayer = async (data: PlayerFormData) => {
  const { photo, ...form } = data
  const photoUpload = photo ? await encodeFile(photo) : null
  return domainCall<PlayerResult>('players', 'savePlayer', { ...form, photo: null, photoUpload })
}
export const deletePlayer = (id: string) => domainCall<PlayerResult>('players', 'deletePlayer', id)
export const listChampionships = () => domainCall<PlayerChampionshipOption[]>('players', 'listChampionships')
export const listSeasons = (id: string) => domainCall<PlayerSeasonOption[]>('players', 'listSeasons', id)
export const listTeams = (id: string) => domainCall<PlayerTeamOption[]>('players', 'listTeams', id)
