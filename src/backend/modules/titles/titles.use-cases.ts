import type {
  TitleFormData,
  TitlesRepository,
  TitleFilters,
} from './titles.types'

import { validateTitle } from './titles.validation'

export function createTitlesUseCases(repository: TitlesRepository) {
  return {
    listChampionships() {
      return repository.listChampionships()
    },

    listSeasons(championshipId: string) {
      if (!championshipId) {
        throw new Error('Selecione um campeonato.')
      }

      return repository.listSeasons(championshipId)
    },

    listTeams(seasonId: string) {
      if (!seasonId) {
        throw new Error('Selecione uma temporada.')
      }

      return repository.listTeams(seasonId)
    },

    listTitles(filters: TitleFilters) {
      if (!filters.championshipId || !filters.seasonId) {
        throw new Error('Selecione um campeonato e uma temporada.')
      }

      return repository.listTitles(filters)
    },

    async createTitle(data: TitleFormData) {
      validateTitle(data)

      return repository.createTitle(data)
    },

    async updateTitle(id: string, data: TitleFormData) {
      if (!id) {
        throw new Error('Registro de título não informado.')
      }

      validateTitle(data)

      return repository.updateTitle(id, data)
    },

    async deleteTitle(id: string) {
      if (!id) {
        throw new Error('Registro de título não informado.')
      }

      return repository.deleteTitle(id)
    },
  }
}
