
import type {
  GroupFormData,
  RoundFormData,
  StageFormData,
  StagePhaseType,
} from './stages.types'

const phaseTypes: StagePhaseType[] = [
  'league',
  'groups',
  'knockout',
  'final',
  'other',
]

export function validateStage(data: StageFormData): void {
  if (!data.seasonId) {
    throw new Error('Selecione uma temporada.')
  }

  if (!data.name.trim()) {
    throw new Error('Informe o nome da fase.')
  }

  if (!phaseTypes.includes(data.phaseType)) {
    throw new Error('O tipo de fase informado é inválido.')
  }

  if (!Number.isInteger(data.orderNumber) || data.orderNumber < 1) {
    throw new Error('A ordem da fase deve ser um número inteiro maior que zero.')
  }
}

export function validateGroup(data: GroupFormData): void {
  if (!data.phaseId || !data.seasonId) {
    throw new Error('A fase e a temporada são obrigatórias.')
  }

  if (!data.name.trim()) {
    throw new Error('Informe o nome do grupo.')
  }

  if (!Number.isInteger(data.orderNumber) || data.orderNumber < 1) {
    throw new Error('A ordem do grupo deve ser um número inteiro maior que zero.')
  }
}

export function validateRound(data: RoundFormData): void {
  if (!data.phaseId || !data.seasonId) {
    throw new Error('A fase e a temporada são obrigatórias.')
  }

  if (!data.name.trim()) {
    throw new Error('Informe o nome da rodada.')
  }

  if (!Number.isInteger(data.roundNumber) || data.roundNumber < 1) {
    throw new Error('O número da rodada deve ser um inteiro maior que zero.')
  }

  if (data.scheduledDate && Number.isNaN(Date.parse(data.scheduledDate))) {
    throw new Error('A data prevista para a rodada é inválida.')
  }
}
