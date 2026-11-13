import type {
  Regulation,
  RegulationFormData,
  RegulationListFilters,
  RegulationStatus,
} from './regulation.types'

export interface RegulationRepository {
  list(filters?: RegulationListFilters): Promise<Regulation[]>
  getById(id: string): Promise<Regulation | null>
  getBySeasonId(seasonId: string): Promise<Regulation | null>
  create(data: RegulationFormData): Promise<Regulation>
  update(id: string, data: RegulationFormData): Promise<Regulation>
  updateStatus(id: string, status: RegulationStatus): Promise<Regulation>
  delete(id: string): Promise<void>
  hasCompetitionActivity(seasonId: string): Promise<boolean>
}
