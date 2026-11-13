import { titlesSupabaseRepository } from '../../../../../src/backend/modules/titles/titles.supabase'
import { createTitlesUseCases } from '../../../../../src/backend/modules/titles/titles.use-cases'

import type {
  TitleFilters,
  TitleFormData,
} from '../../../../../src/backend/modules/titles/titles.types'

const titles = createTitlesUseCases(titlesSupabaseRepository)

export const listTitleChampionships = () =>
  titles.listChampionships()

export const listTitleSeasons = (championshipId: string) =>
  titles.listSeasons(championshipId)

export const listTitleTeams = (seasonId: string) =>
  titles.listTeams(seasonId)

export const listTitles = (filters: TitleFilters) =>
  titles.listTitles(filters)

export const createTitle = (data: TitleFormData) =>
  titles.createTitle(data)

export const updateTitle = (id: string, data: TitleFormData) =>
  titles.updateTitle(id, data)

export const deleteTitle = (id: string) =>
  titles.deleteTitle(id)
