
import type {
  ChampionshipFormData,
  ChampionshipValidationErrors,
  ChampionshipStatus,
} from './championship.types.js'

export function validateChampionship(
  data: ChampionshipFormData,
): ChampionshipValidationErrors {
  const errors: ChampionshipValidationErrors = {}

  const name = data.name.trim()
  const acronym = data.acronym.trim()
  const description = data.description.trim()

  if (!name) {
    errors.name = 'Informe o nome do campeonato.'
  } else if (name.length < 3) {
    errors.name = 'O nome deve ter pelo menos 3 caracteres.'
  } else if (name.length > 120) {
    errors.name = 'O nome deve ter no máximo 120 caracteres.'
  }

  if (acronym.length > 12) {
    errors.acronym = 'A sigla deve ter no máximo 12 caracteres.'
  }

  if (description.length > 1000) {
    errors.description = 'A descrição deve ter no máximo 1000 caracteres.'
  }

  const validStatuses: ChampionshipStatus[] = [
    'draft',
    'published',
    'completed',
    'archived',
  ]

  if (!validStatuses.includes(data.status)) {
    errors.status = 'Selecione uma situação válida.'
  }

  return errors
}
