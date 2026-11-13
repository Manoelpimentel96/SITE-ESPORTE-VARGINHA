import type { Regulation, RegulationFormData, RegulationListFilters } from '../../backend/modules/regulations/regulation.types'
import { domainCall } from '../../lib/domainApi'
export const listRegulations = (filters?: RegulationListFilters) => domainCall<Regulation[]>('regulations', 'listRegulations', filters)
export const getRegulationById = (id: string) => domainCall<Regulation | null>('regulations', 'getRegulationById', id)
export const getRegulationBySeasonId = (id: string) => domainCall<Regulation | null>('regulations', 'getRegulationBySeasonId', id)
export const saveRegulation = (data: RegulationFormData, id?: string) => domainCall<Regulation>('regulations', 'saveRegulation', data, id)
export const validateRegulation = (data: RegulationFormData & { seasonId: string }) => domainCall<{ valid: true }>('regulations', 'validateRegulation', data)
export const publishRegulation = (id: string) => domainCall<Regulation>('regulations', 'publishRegulation', id)
export const unpublishRegulation = (id: string) => domainCall<Regulation>('regulations', 'unpublishRegulation', id)
export const deleteRegulation = (id: string) => domainCall<void>('regulations', 'deleteRegulation', id)
export type { Regulation, RegulationFormData, RegulationFormat, RegulationStatus, TieBreaker, CompetitionPhase, PhaseType } from '../../backend/modules/regulations/regulation.types'
