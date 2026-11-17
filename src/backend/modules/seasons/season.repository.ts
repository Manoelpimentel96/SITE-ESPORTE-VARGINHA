
import type {
  Season,
  SeasonFormData,
  SeasonListFilters,
} from './season.types.js'

export interface SeasonRepository {
  list(filters?: SeasonListFilters): Promise<Season[]>
  getById(id: string): Promise<Season | null>
  create(data: SeasonFormData): Promise<Season>
  update(id: string, data: SeasonFormData): Promise<Season>
  delete(id: string): Promise<void>
}
