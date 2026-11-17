import type { TeamFormData } from './team.types.js'

export function validateTeam(data: TeamFormData): string[] {
  const errors: string[] = []

  if (!data.championshipId) {
    errors.push('Selecione o campeonato.')
  }

  if (!data.name.trim()) {
    errors.push('Informe o nome da equipe.')
  }

  if (data.shortName.trim().length > 8) {
    errors.push('O nome abreviado deve ter no máximo 8 caracteres.')
  }

  if (data.foundedYear.trim()) {
    const year = Number(data.foundedYear)
    const currentYear = new Date().getFullYear()

    if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
      errors.push('Informe um ano de fundação válido.')
    }
  }

  if (data.crest) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(data.crest.type)) {
      errors.push('O escudo deve estar no formato PNG, JPEG ou WEBP.')
    }

    if (data.crest.size > maxSize) {
      errors.push('O escudo deve ter no máximo 5 MB.')
    }
  }

  if (data.seasonId && !data.championshipId) {
    errors.push('Selecione um campeonato antes de vincular uma temporada.')
  }

  return errors
}
