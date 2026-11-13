import {
  listTeams as backendListTeams,
  getTeam as backendGetTeam,
  saveTeam as backendSaveTeam,
  deleteTeam as backendDeleteTeam,
  listChampionshipOptions as backendListChampionships,
  listSeasonOptions as backendListSeasons,
} from '../../../../../src/backend/modules/teams/team.use-cases'

import type {
  Team,
  TeamFormData,
  TeamListFilters,
  TeamResult,
} from '../../../../../src/backend/modules/teams/team.types'

export type {
  Team,
  TeamFormData,
  TeamListFilters,
  TeamResult,
  ChampionshipOption,
  SeasonOption,
} from '../../../../../src/backend/modules/teams/team.types'

export async function listTeams(filters?: TeamListFilters): Promise<Team[]> {
  return backendListTeams(filters)
}

export async function getTeam(id: string): Promise<Team | null> {
  return backendGetTeam(id)
}

export async function saveTeam(data: TeamFormData): Promise<TeamResult> {
  return backendSaveTeam(data)
}

export async function deleteTeam(id: string): Promise<TeamResult> {
  return backendDeleteTeam(id)
}

export async function listChampionships() {
  return backendListChampionships()
}

export async function listSeasons(championshipId: string) {
  return backendListSeasons(championshipId)
}
