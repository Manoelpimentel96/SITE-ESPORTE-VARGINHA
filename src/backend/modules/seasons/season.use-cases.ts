
import type {
  Season,
  SeasonFormData,
  SeasonListFilters,
} from './season.types'

import type { SeasonRepository } from './season.repository'

import { validateSeason } from './season.validation'

export class SeasonValidationError extends Error {
  public readonly errors: ReturnType<typeof validateSeason>

  constructor(errors: ReturnType<typeof validateSeason>) {
    super('Os dados da temporada são inválidos.')

    this.name = 'SeasonValidationError'
    this.errors = errors

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function normalizeData(data: SeasonFormData): SeasonFormData {
  return {
    championshipId: data.championshipId.trim(),
    name: data.name.trim(),
    year: Number(data.year),
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    status: data.status,
  }
}

function validateOrThrow(data: SeasonFormData): void {
  const errors = validateSeason(data)

  if (Object.keys(errors).length > 0) {
    throw new SeasonValidationError(errors)
  }
}

export function createSeasonUseCases(repository: SeasonRepository) {
  return {
    async list(filters?: SeasonListFilters): Promise<Season[]> {
      return repository.list(filters)
    },

    async getById(id: string): Promise<Season | null> {
      if (!id.trim()) {
        throw new Error('Identificador da temporada não informado.')
      }

      return repository.getById(id)
    },

    async create(data: SeasonFormData): Promise<Season> {
      const normalized = normalizeData(data)
      validateOrThrow(normalized)

      return repository.create(normalized)
    },

    async update(
      id: string,
      data: SeasonFormData,
    ): Promise<Season> {
      if (!id.trim()) {
        throw new Error('Identificador da temporada não informado.')
      }

      const normalized = normalizeData(data)
      validateOrThrow(normalized)

      return repository.update(id, normalized)
    },

    async delete(id: string): Promise<void> {
      if (!id.trim()) {
        throw new Error('Identificador da temporada não informado.')
      }

      return repository.delete(id)
    },
  }
}
