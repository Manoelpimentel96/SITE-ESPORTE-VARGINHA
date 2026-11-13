
export type StagePhaseType = 'league' | 'groups' | 'knockout' | 'final' | 'other'

export interface Stage {
  id: string
  seasonId: string
  name: string
  phaseType: StagePhaseType
  orderNumber: number
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface StageGroup {
  id: string
  phaseId: string
  seasonId: string
  name: string
  orderNumber: number
  createdAt: string
}

export interface StageRound {
  id: string
  phaseId: string
  seasonId: string
  groupId: string | null
  name: string
  roundNumber: number
  scheduledDate: string | null
  createdAt: string
}

export interface StageChampionshipOption {
  id: string
  name: string
}

export interface StageSeasonOption {
  id: string
  championshipId: string
  name: string
}

export interface StageFormData {
  seasonId: string
  name: string
  phaseType: StagePhaseType
  orderNumber: number
  settings: Record<string, unknown>
}

export interface GroupFormData {
  phaseId: string
  seasonId: string
  name: string
  orderNumber: number
}

export interface RoundFormData {
  phaseId: string
  seasonId: string
  groupId: string | null
  name: string
  roundNumber: number
  scheduledDate: string | null
}

export interface StageFilters {
  championshipId: string
  seasonId: string
}

export interface StagesRepository {
  listChampionships(): Promise<StageChampionshipOption[]>
  listSeasons(championshipId: string): Promise<StageSeasonOption[]>
  listStages(seasonId: string): Promise<Stage[]>
  createStage(data: StageFormData): Promise<Stage>
  updateStage(id: string, data: StageFormData): Promise<Stage>
  deleteStage(id: string): Promise<void>
  listGroups(phaseId: string): Promise<StageGroup[]>
  createGroup(data: GroupFormData): Promise<StageGroup>
  updateGroup(id: string, data: GroupFormData): Promise<StageGroup>
  deleteGroup(id: string): Promise<void>
  listRounds(phaseId: string, groupId?: string | null): Promise<StageRound[]>
  createRound(data: RoundFormData): Promise<StageRound>
  updateRound(id: string, data: RoundFormData): Promise<StageRound>
  deleteRound(id: string): Promise<void>
}
