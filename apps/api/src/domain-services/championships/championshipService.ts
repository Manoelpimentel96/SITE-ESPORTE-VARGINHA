
import {
  createChampionshipUseCases,
} from '../../../../../src/backend/modules/championships/championship.use-cases'

import {
  SupabaseChampionshipRepository,
} from '../../../../../src/backend/modules/championships/championship.supabase'

import type {
  ChampionshipFormData,
} from '../../../../../src/backend/modules/championships/championship.types'

import type {
  ChampionshipListFilters,
} from '../../../../../src/backend/modules/championships/championship.repository'

export {
  validateChampionship,
} from '../../../../../src/backend/modules/championships/championship.validation'

export {
  ChampionshipValidationError,
} from '../../../../../src/backend/modules/championships/championship.use-cases'

export type {
  Championship,
  ChampionshipFormData,
  ChampionshipStatus,
  ChampionshipValidationErrors,
} from '../../../../../src/backend/modules/championships/championship.types'

export type {
  ChampionshipRepository,
  ChampionshipListFilters,
} from '../../../../../src/backend/modules/championships/championship.repository'

// Instância única do repositório do módulo.
const repository = new SupabaseChampionshipRepository()

// Casos de uso recebem a implementação concreta do repositório.
const championshipUseCases =
  createChampionshipUseCases(repository)

// =========================================================
// LISTAGEM
// =========================================================

export async function listChampionships(
  filters?: ChampionshipListFilters,
) {
  return championshipUseCases.list(filters)
}

// =========================================================
// CONSULTA POR ID
// =========================================================

export async function getChampionshipById(id: string) {
  return championshipUseCases.getById(id)
}

// =========================================================
// CADASTRO
// =========================================================

export async function createChampionship(
  data: ChampionshipFormData,
) {
  return championshipUseCases.create(data)
}

// =========================================================
// ATUALIZAÇÃO
// =========================================================

export async function updateChampionship(
  id: string,
  data: ChampionshipFormData,
) {
  return championshipUseCases.update(id, data)
}

// =========================================================
// EXCLUSÃO
// =========================================================

export async function deleteChampionship(id: string) {
  return championshipUseCases.delete(id)
}
