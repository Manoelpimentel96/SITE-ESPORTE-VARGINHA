import { SupabaseRegulationRepository } from '../../../../../src/backend/modules/regulations/regulation.supabase.js'

import { RegulationUseCases } from '../../../../../src/backend/modules/regulations/regulation.use-cases.js'

const repository = new SupabaseRegulationRepository()
const useCases = new RegulationUseCases(repository)

export const listRegulations =
  useCases.list.bind(useCases)

export const getRegulationById =
  useCases.getById.bind(useCases)

export const getRegulationBySeasonId =
  useCases.getBySeasonId.bind(useCases)

export const saveRegulation =
  useCases.save.bind(useCases)

export const validateRegulation =
  useCases.validate.bind(useCases)

export const publishRegulation =
  useCases.publish.bind(useCases)

export const unpublishRegulation =
  useCases.unpublish.bind(useCases)

export const deleteRegulation =
  useCases.delete.bind(useCases)

export type {
  Regulation,
  RegulationFormData,
  RegulationFormat,
  RegulationStatus,
  TieBreaker,
  CompetitionPhase,
  PhaseType,
} from '../../../../../src/backend/modules/regulations/regulation.types'
