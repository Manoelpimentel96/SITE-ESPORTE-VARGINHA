import type { TitleFormData } from './titles.types.js'

export function validateTitle(data: TitleFormData): void {
  if (!data.seasonId) {
    throw new Error('Selecione uma temporada.')
  }

  if (!data.seasonTeamRegistrationId) {
    throw new Error('Selecione a equipe campeã.')
  }

  if (data.awardedAt && Number.isNaN(Date.parse(data.awardedAt))) {
    throw new Error('A data de conquista informada é inválida.')
  }

  if (data.notes.length > 2000) {
    throw new Error('As observações devem ter no máximo 2.000 caracteres.')
  }
}
