
import { stagesSupabaseRepository } from '../../backend/modules/stages/stages.supabase'
import { createStagesUseCases } from '../../backend/modules/stages/stages.use-cases'

import type {
  GroupFormData,
  RoundFormData,
  StageFormData,
} from '../../backend/modules/stages/stages.types'

const stages = createStagesUseCases(stagesSupabaseRepository)

export const listStageChampionships = stages.listChampionships
export const listStageSeasons = stages.listSeasons
export const listStages = stages.listStages

export function createStage(data: StageFormData) {
  return stages.createStage(data)
}

export function updateStage(id: string, data: StageFormData) {
  return stages.updateStage(id, data)
}

export function deleteStage(id: string) {
  return stages.deleteStage(id)
}

export const listStageGroups = stages.listGroups

export function createStageGroup(data: GroupFormData) {
  return stages.createGroup(data)
}

export function updateStageGroup(id: string, data: GroupFormData) {
  return stages.updateGroup(id, data)
}

export function deleteStageGroup(id: string) {
  return stages.deleteGroup(id)
}

export function listStageRounds(phaseId: string, groupId?: string | null) {
  return stages.listRounds(phaseId, groupId)
}

export function createStageRound(data: RoundFormData) {
  return stages.createRound(data)
}

export function updateStageRound(id: string, data: RoundFormData) {
  return stages.updateRound(id, data)
}

export function deleteStageRound(id: string) {
  return stages.deleteRound(id)
}
