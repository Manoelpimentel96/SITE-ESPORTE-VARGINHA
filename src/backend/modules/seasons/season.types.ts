
export type SeasonStatus =
  | 'draft'
  | 'published'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'archived'

export interface Season {
  id: string
  championshipId: string
  name: string
  year: number
  startDate: string | null
  endDate: string | null
  status: SeasonStatus
  createdAt: string
  updatedAt: string
}

export interface SeasonFormData {
  championshipId: string
  name: string
  year: number
  startDate: string
  endDate: string
  status: SeasonStatus
}

export interface SeasonListFilters {
  search?: string
  status?: SeasonStatus | 'all'
  championshipId?: string | 'all'
}

export type SeasonValidationErrors = Partial<
  Record<keyof SeasonFormData, string>
>


