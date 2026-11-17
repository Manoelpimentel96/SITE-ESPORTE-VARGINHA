
import type {
  GroupFormData,
  RoundFormData,
  StageFormData,
  StagesRepository,
} from './stages.types.js'

export interface StagesRepositoryContract extends StagesRepository {
  createStage(data: StageFormData): Promise<Awaited<ReturnType<StagesRepository['createStage']>>>
  updateStage(
    id: string,
    data: StageFormData,
  ): Promise<Awaited<ReturnType<StagesRepository['updateStage']>>>
  createGroup(data: GroupFormData): Promise<Awaited<ReturnType<StagesRepository['createGroup']>>>
  updateGroup(
    id: string,
    data: GroupFormData,
  ): Promise<Awaited<ReturnType<StagesRepository['updateGroup']>>>
  createRound(data: RoundFormData): Promise<Awaited<ReturnType<StagesRepository['createRound']>>>
  updateRound(
    id: string,
    data: RoundFormData,
  ): Promise<Awaited<ReturnType<StagesRepository['updateRound']>>>
}
