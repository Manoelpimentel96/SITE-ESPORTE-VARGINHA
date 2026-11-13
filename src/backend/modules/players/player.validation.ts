
import type { PlayerFormData } from './player.types'

export function validatePlayer(data: PlayerFormData): string[] {
  const errors: string[] = []

  if (!data.championshipId) {
    errors.push('Selecione o campeonato.')
  }

  if (!data.seasonId) {
    errors.push('Selecione a temporada.')
  }

  if (!data.teamId) {
    errors.push('Selecione a equipe.')
  }

  if (!data.fullName.trim()) {
    errors.push('Informe o nome do jogador.')
  }

  if (data.shirtNumber.trim()) {
    const number = Number(data.shirtNumber)

    if (!Number.isInteger(number) || number < 0 || number > 99) {
      errors.push('Informe um número de camisa entre 0 e 99.')
    }
  }

  if (data.birthDate) {
    const date = new Date(`${data.birthDate}T00:00:00`)

    if (Number.isNaN(date.getTime()) || date > new Date()) {
      errors.push('Informe uma data de nascimento válida.')
    }
  }

  if (data.photo) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(data.photo.type)) {
      errors.push('A foto deve estar no formato PNG, JPEG ou WEBP.')
    }

    if (data.photo.size > maxSize) {
      errors.push('A foto deve ter no máximo 5 MB.')
    }
  }

  return errors
}
