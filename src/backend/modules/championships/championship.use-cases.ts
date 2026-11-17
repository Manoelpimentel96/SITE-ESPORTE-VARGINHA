
import type {
  Championship,
  ChampionshipFormData,
} from './championship.types.js'

import type {
  ChampionshipListFilters,
  ChampionshipRepository,
} from './championship.repository.js'

import { validateChampionship } from './championship.validation.js'

export class ChampionshipValidationError extends Error {
  public readonly errors: ReturnType<typeof validateChampionship>

  constructor(errors: ReturnType<typeof validateChampionship>) {
    super('Os dados do campeonato são inválidos.')

    this.name = 'ChampionshipValidationError'
    this.errors = errors

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function validateOrThrow(data: ChampionshipFormData): void {
  const errors = validateChampionship(data)

  if (Object.keys(errors).length > 0) {
    throw new ChampionshipValidationError(errors)
  }
}

function normalizeData(
  data: ChampionshipFormData,
): ChampionshipFormData {
  return {
    name: data.name.trim(),
    acronym: data.acronym.trim().toUpperCase(),
    description: data.description.trim(),
    status: data.status,
  }
}

export function createChampionshipUseCases(
  repository: ChampionshipRepository,
) {
  return {
    async list(
      filters?: ChampionshipListFilters,
    ): Promise<Championship[]> {
      return repository.list(filters)
    },

    async getById(id: string): Promise<Championship | null> {
      if (!id.trim()) {
        throw new Error('Identificador do campeonato não informado.')
      }

      return repository.getById(id)
    },

    async create(data: ChampionshipFormData): Promise<Championship> {
      validateOrThrow(data)

      return repository.create(normalizeData(data))
    },

    async update(
      id: string,
      data: ChampionshipFormData,
    ): Promise<Championship> {
      if (!id.trim()) {
        throw new Error('Identificador do campeonato não informado.')
      }

      validateOrThrow(data)

      return repository.update(id, normalizeData(data))
    },

    async delete(id: string): Promise<void> {
      if (!id.trim()) {
        throw new Error('Identificador do campeonato não informado.')
      }

      return repository.delete(id)
    },
  }
}
