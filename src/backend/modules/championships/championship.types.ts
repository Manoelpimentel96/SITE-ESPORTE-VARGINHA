
export type ChampionshipStatus =
  | 'draft'
  | 'published'
  | 'completed'
  | 'archived'

export interface Championship {
  id: string
  name: string
  acronym: string | null
  description: string | null
  status: ChampionshipStatus
  createdAt: string
  updatedAt: string
}

export interface ChampionshipFormData {
  name: string
  acronym: string
  description: string
  status: ChampionshipStatus
}

export type ChampionshipValidationErrors = Partial<
  Record<keyof ChampionshipFormData, string>
>
