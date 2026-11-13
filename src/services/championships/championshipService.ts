import { domainCall } from '../../lib/domainApi'
import type { ChampionshipFormData, Championship, ChampionshipValidationErrors } from '../../backend/modules/championships/championship.types'
import type { ChampionshipListFilters } from '../../backend/modules/championships/championship.repository'
export type { Championship, ChampionshipFormData, ChampionshipStatus, ChampionshipValidationErrors } from '../../backend/modules/championships/championship.types'

export type { ChampionshipListFilters } from '../../backend/modules/championships/championship.repository'

export const validateChampionship = (data: ChampionshipFormData) => domainCall<ChampionshipValidationErrors>('championships', 'validateChampionship', data)


export const listChampionships = (filters?: ChampionshipListFilters) =>
  filters === undefined
    ? domainCall<Championship[]>('championships', 'listChampionships')
    : domainCall<Championship[]>('championships', 'listChampionships', filters)

export const getChampionshipById = (id: string) => domainCall<Championship | null>('championships', 'getChampionshipById', id)
export const createChampionship = (data: ChampionshipFormData) => domainCall<Championship>('championships', 'createChampionship', data)
export const updateChampionship = (id: string, data: ChampionshipFormData) => domainCall<Championship>('championships', 'updateChampionship', id, data)
export const deleteChampionship = (id: string) => domainCall<void>('championships', 'deleteChampionship', id)
