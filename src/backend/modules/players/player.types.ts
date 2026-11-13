
export type PlayerStatus = 'active' | 'inactive' | 'suspended'

export type PlayerPosition =
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'forward'
  | 'other'

export interface Player {
  id: string
  championshipId: string
  fullName: string
  birthDate: string | null
  position: PlayerPosition | null
  shirtNumber: number | null
  photoUrl: string | null
  status: PlayerStatus
  createdAt: string
}

export interface PlayerFormData {
  id?: string
  championshipId: string
  seasonId: string
  teamId: string
  fullName: string
  birthDate: string
  position: PlayerPosition | ''
  shirtNumber: string
  photo: File | null
}

export interface PlayerListFilters {
  championshipId?: string
  seasonId?: string
  teamId?: string
  search?: string
}

export interface PlayerChampionshipOption {
  id: string
  name: string
}

export interface PlayerSeasonOption {
  id: string
  name: string
  championshipId: string
}

export interface PlayerTeamOption {
  id: string
  name: string
}

export interface PlayerResult {
  success: boolean
  message: string
  player?: Player
}

export interface PlayerRepository {
  list(filters?: PlayerListFilters): Promise<Player[]>
  findById(id: string): Promise<Player | null>
  create(data: Omit<Player, 'id' | 'createdAt'>): Promise<Player>
  update(id: string, data: Partial<Omit<Player, 'id' | 'createdAt'>>): Promise<Player>
  delete(id: string): Promise<void>
  registerInSeason(playerId: string, teamId: string, seasonId: string, shirtNumber: number | null): Promise<void>
  uploadPhoto(file: File, playerId: string): Promise<string>
  listChampionships(): Promise<PlayerChampionshipOption[]>
  listSeasons(championshipId: string): Promise<PlayerSeasonOption[]>
  listTeams(seasonId: string): Promise<PlayerTeamOption[]>
}

