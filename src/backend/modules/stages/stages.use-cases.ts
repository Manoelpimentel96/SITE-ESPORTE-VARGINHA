
import type {
  GroupFormData,
  RoundFormData,
  StageFormData,
  StagesRepository,
} from './stages.types'

import {
  validateGroup,
  validateRound,
  validateStage,
} from './stages.validation'

export function createStagesUseCases(repository: StagesRepository) {
  return {
    listChampionships: () => repository.listChampionships(),

    listSeasons: (championshipId: string) => {
      if (!championshipId) {
        throw new Error('Selecione um campeonato.')
      }

      return repository.listSeasons(championshipId)
    },

    listStages: (seasonId: string) => {
      if (!seasonId) {
        throw new Error('Selecione uma temporada.')
      }

      return repository.listStages(seasonId)
    },

    createStage: (data: StageFormData) => {
      validateStage(data)
      return repository.createStage(data)
    },

    updateStage: (id: string, data: StageFormData) => {
      if (!id) throw new Error('Fase não informada.')

      validateStage(data)
      return repository.updateStage(id, data)
    },

    deleteStage: (id: string) => {
      if (!id) throw new Error('Fase não informada.')

      return repository.deleteStage(id)
    },

    listGroups: (phaseId: string) => {
      if (!phaseId) throw new Error('Selecione uma fase.')

      return repository.listGroups(phaseId)
    },

    createGroup: (data: GroupFormData) => {
      validateGroup(data)
      return repository.createGroup(data)
    },

    updateGroup: (id: string, data: GroupFormData) => {
      if (!id) throw new Error('Grupo não informado.')

      validateGroup(data)
      return repository.updateGroup(id, data)
    },

    deleteGroup: (id: string) => {
      if (!id) throw new Error('Grupo não informado.')

      return repository.deleteGroup(id)
    },

    listRounds: (phaseId: string, groupId?: string | null) => {
      if (!phaseId) throw new Error('Selecione uma fase.')

      return repository.listRounds(phaseId, groupId)
    },

    createRound: (data: RoundFormData) => {
      validateRound(data)
      return repository.createRound(data)
    },

    updateRound: (id: string, data: RoundFormData) => {
      if (!id) throw new Error('Rodada não informada.')

      validateRound(data)
      return repository.updateRound(id, data)
    },

    deleteRound: (id: string) => {
      if (!id) throw new Error('Rodada não informada.')

      return repository.deleteRound(id)
    },
  }
}
