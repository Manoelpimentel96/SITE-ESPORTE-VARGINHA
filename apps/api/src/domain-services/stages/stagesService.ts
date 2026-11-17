
import { stagesSupabaseRepository } from '../../../../../src/backend/modules/stages/stages.supabase.js'
import { createStagesUseCases } from '../../../../../src/backend/modules/stages/stages.use-cases.js'

import type {
  GroupFormData,
  RoundFormData,
  StageFormData,
} from '../../../../../src/backend/modules/stages/stages.types'

const stages = createStagesUseCases(stagesSupabaseRepository)

export const listStageChampionships = () => stages.listChampionships()

export const listStageSeasons = (championshipId: string) =>
  stages.listSeasons(championshipId)

export const listStages = (seasonId: string) => stages.listStages(seasonId)

export const createStage = (data: StageFormData) =>
  stages.createStage(data)

export const updateStage = (id: string, data: StageFormData) =>
  stages.updateStage(id, data)

export const deleteStage = (id: string) =>
  stages.deleteStage(id)

export const listStageGroups = (phaseId: string) =>
  stages.listGroups(phaseId)

export const createStageGroup = (data: GroupFormData) =>
  stages.createGroup(data)

export const updateStageGroup = (id: string, data: GroupFormData) =>
  stages.updateGroup(id, data)

export const deleteStageGroup = (id: string) =>
  stages.deleteGroup(id)

export const listStageRounds = (
  phaseId: string,
  groupId?: string | null,
) => stages.listRounds(phaseId, groupId)

export const createStageRound = (data: RoundFormData) =>
  stages.createRound(data)

export const updateStageRound = (id: string, data: RoundFormData) =>
  stages.updateRound(id, data)

export const deleteStageRound = (id: string) =>
  stages.deleteRound(id)
