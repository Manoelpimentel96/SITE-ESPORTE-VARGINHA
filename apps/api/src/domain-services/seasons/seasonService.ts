
import { createSeasonUseCases } from '../../../../../src/backend/modules/seasons/season.use-cases.js'

import { SupabaseSeasonRepository } from '../../../../../src/backend/modules/seasons/season.supabase.js'

export {
  SeasonValidationError,
} from '../../../../../src/backend/modules/seasons/season.use-cases'

export { validateSeason } from '../../../../../src/backend/modules/seasons/season.validation'

export type {
  Season,
  SeasonFormData,
  SeasonStatus,
  SeasonListFilters,
  SeasonValidationErrors,
} from '../../../../../src/backend/modules/seasons/season.types'

const repository = new SupabaseSeasonRepository()
const useCases = createSeasonUseCases(repository)

export const listSeasons = useCases.list
export const getSeasonById = useCases.getById
export const createSeason = useCases.create
export const updateSeason = useCases.update
export const deleteSeason = useCases.delete
