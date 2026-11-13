import { domainCall } from '../../lib/domainApi'
import type { Season, SeasonFormData, SeasonListFilters } from '../../backend/modules/seasons/season.types'

export type { Season, SeasonFormData, SeasonStatus, SeasonListFilters, SeasonValidationErrors } from '../../backend/modules/seasons/season.types'


export const listSeasons = (filters?: SeasonListFilters) =>
  filters === undefined
    ? domainCall<Season[]>('seasons', 'listSeasons')
    : domainCall<Season[]>('seasons', 'listSeasons', filters)


export const getSeasonById = (id: string) => 
    domainCall<Season | null>('seasons', 'getSeasonById', id)

export const createSeason = (data: SeasonFormData) => 
    domainCall<Season>('seasons', 'createSeason', data)

export const updateSeason = (id: string, data: SeasonFormData) => domainCall<Season>('seasons', 'updateSeason', id, data)

export const validateSeason = (data: SeasonFormData) => 
    domainCall<import('../../backend/modules/seasons/season.types').SeasonValidationErrors>('seasons', 'validateSeason', data)

export const deleteSeason = (id: string) => 
    domainCall<void>('seasons', 'deleteSeason', id)
