export type TeamStatus = 'active' | 'inactive' | 'suspended'

export interface Team {
  id: string
  championshipId: string
  name: string
  shortName: string | null
  city: string | null
  primaryColor: string | null
  foundedYear: number | null
  crestUrl: string | null
  status: TeamStatus
  createdAt: string
}

export interface TeamFormData {
  id?: string
  championshipId: string
  seasonId: string
  name: string
  shortName: string
  city: string
  primaryColor: string
  foundedYear: string
  crest: File | null
  president: string
  coach: string
}

export interface ChampionshipOption {
  id: string
  name: string
}

export interface SeasonOption {
  id: string
  name: string
  championshipId: string
}

export interface TeamListFilters {
  championshipId?: string
  search?: string
}

export interface TeamRepository {
  list(filters?: TeamListFilters): Promise<Team[]>
  findById(id: string): Promise<Team | null>
  create(data: Omit<Team, 'id' | 'createdAt'>): Promise<Team>
  update(id: string, data: Partial<Omit<Team, 'id' | 'createdAt'>>): Promise<Team>
  delete(id: string): Promise<void>
  saveStaff(teamId: string, seasonId: string | null, role: 'president' | 'coach', name: string): Promise<void>
  deleteStaff(teamId: string, seasonId: string | null, role: 'president' | 'coach'): Promise<void>
  saveSeasonRegistration(teamId: string, seasonId: string): Promise<void>
  uploadCrest(file: File, teamId: string): Promise<string>
  listChampionships(): Promise<ChampionshipOption[]>
  listSeasons(championshipId: string): Promise<SeasonOption[]>
}

export interface TeamResult {
  success: boolean
  message: string
  team?: Team
}
