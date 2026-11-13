
import type {
  Championship,
  ChampionshipFormData,
  ChampionshipStatus,
} from './championship.types'

export interface ChampionshipListFilters {
  search?: string
  status?: ChampionshipStatus | 'all'
}

export interface ChampionshipRepository {
  list(filters?: ChampionshipListFilters): Promise<Championship[]>

  getById(id: string): Promise<Championship | null>

  create(data: ChampionshipFormData): Promise<Championship>

  update(
    id: string,
    data: ChampionshipFormData,
  ): Promise<Championship>

  delete(id: string): Promise<void>
}
