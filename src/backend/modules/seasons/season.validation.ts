
import type {
  SeasonFormData,
  SeasonValidationErrors,
} from './season.types'

const validStatuses = [
  'draft',
  'published',
  'active',
  'in_progress',
  'completed',
  'archived',
] as const

export function validateSeason(
  data: SeasonFormData,
): SeasonValidationErrors {
  const errors: SeasonValidationErrors = {}

  if (!data.championshipId.trim()) {
    errors.championshipId = 'Selecione o campeonato.'
  }

  if (!data.name.trim()) {
    errors.name = 'Informe o nome da temporada.'
  } else if (data.name.trim().length > 100) {
    errors.name = 'O nome deve ter no máximo 100 caracteres.'
  }

  if (
    !Number.isInteger(data.year) ||
    data.year < 1900 ||
    data.year > 2200
  ) {
    errors.year = 'Informe um ano entre 1900 e 2200.'
  }

  if (data.startDate && data.endDate) {
    if (data.endDate < data.startDate) {
      errors.endDate =
        'A data de encerramento não pode ser anterior à data de início.'
    }
  }

  if (!validStatuses.includes(data.status)) {
    errors.status = 'A situação informada é inválida.'
  }

  return errors
}
