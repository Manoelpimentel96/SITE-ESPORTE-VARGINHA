import type { MatchFormData } from './matches.types.js'

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateMatch(
  data: MatchFormData,
): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.seasonId) {
    errors.seasonId = 'Selecione a temporada.'
  }

  if (!data.phaseId) {
    errors.phaseId = 'Selecione a fase.'
  }

  if (!data.homeRegistrationId) {
    errors.homeRegistrationId = 'Selecione a equipe mandante.'
  }

  if (!data.awayRegistrationId) {
    errors.awayRegistrationId = 'Selecione a equipe visitante.'
  }

  if (
    data.homeRegistrationId &&
    data.awayRegistrationId &&
    data.homeRegistrationId === data.awayRegistrationId
  ) {
    errors.awayRegistrationId =
      'As equipes mandante e visitante devem ser diferentes.'
  }

  if (!data.scheduledAt) {
    errors.scheduledAt = 'Informe a data e o horário da partida.'
  } else {
    const scheduledDate = new Date(data.scheduledAt)

    if (Number.isNaN(scheduledDate.getTime())) {
      errors.scheduledAt = 'Informe uma data e horário válidos.'
    } else if (scheduledDate.getTime() <= Date.now()) {
      errors.scheduledAt =
        'A data agendada deve ser posterior ao momento atual.'
    }
  }

  if (data.city.trim().length > 120) {
    errors.city = 'A cidade deve ter no máximo 120 caracteres.'
  }

  if (data.venue.trim().length > 160) {
    errors.venue = 'O local deve ter no máximo 160 caracteres.'
  }

  if (data.notes.trim().length > 2000) {
    errors.notes = 'As observações devem ter no máximo 2.000 caracteres.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function normalizeMatchData(
  data: MatchFormData,
): MatchFormData {
  return {
    ...data,
    seasonId: data.seasonId.trim(),
    phaseId: data.phaseId.trim(),
    groupId: data.groupId.trim(),
    roundId: data.roundId.trim(),
    homeRegistrationId: data.homeRegistrationId.trim(),
    awayRegistrationId: data.awayRegistrationId.trim(),
    city: data.city.trim(),
    venue: data.venue.trim(),
    notes: data.notes.trim(),
  }
}
