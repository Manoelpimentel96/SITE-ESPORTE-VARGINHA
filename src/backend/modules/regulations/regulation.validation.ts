import type {
  RegulationFormData,
  RegulationValidationErrors,
} from './regulation.types.js'

const formats = [
  'league_home_away',
  'league_single',
  'groups',
  'knockout',
  'groups_knockout',
  'league_knockout',
  'custom',
]

const tieBreakers = [
  'wins',
  'goal_difference',
  'goals_for',
  'head_to_head',
  'fewest_goals_against',
  'fair_play',
  'draw',
]

export function validateRegulation(
  data: RegulationFormData,
): RegulationValidationErrors {
  const errors: RegulationValidationErrors = {}

  if (!data.seasonId?.trim()) {
    errors.seasonId = 'Selecione uma temporada.'
  }

  if (!formats.includes(data.format)) {
    errors.format = 'Formato de disputa inválido.'
  }

  const pointFields = [
    ['pointsWin', data.pointsWin],
    ['pointsDraw', data.pointsDraw],
    ['pointsLoss', data.pointsLoss],
  ] as const

  for (const [field, value] of pointFields) {
    if (!Number.isInteger(value) || value < 0) {
      errors[field] =
        'Informe uma pontuação inteira igual ou maior que zero.'
    }
  }

  if (
    !Array.isArray(data.tieBreakers) ||
    data.tieBreakers.length === 0
  ) {
    errors.tieBreakers =
      'Defina ao menos um critério de desempate.'
  } else if (
    new Set(data.tieBreakers).size !== data.tieBreakers.length ||
    data.tieBreakers.some((item) => !tieBreakers.includes(item))
  ) {
    errors.tieBreakers =
      'Os critérios de desempate são inválidos ou repetidos.'
  }

  const match = data.matchSettings

  if (
    !Number.isInteger(match.matchDurationMinutes) ||
    match.matchDurationMinutes < 1
  ) {
    errors['matchSettings.matchDurationMinutes'] =
      'Informe a duração total da partida.'
  }

  if (
    !Number.isInteger(match.halfDurationMinutes) ||
    match.halfDurationMinutes < 1 ||
    match.halfDurationMinutes * 2 > match.matchDurationMinutes
  ) {
    errors['matchSettings.halfDurationMinutes'] =
      'A duração de cada tempo deve ser válida e não ultrapassar a duração total.'
  }

  if (
    !Number.isInteger(match.intervalMinutes) ||
    match.intervalMinutes < 0
  ) {
    errors['matchSettings.intervalMinutes'] =
      'O intervalo não pode ser negativo.'
  }

  if (
    !Number.isInteger(match.minimumRestHours) ||
    match.minimumRestHours < 0
  ) {
    errors['matchSettings.minimumRestHours'] =
      'O descanso mínimo não pode ser negativo.'
  }

  const phases = Array.isArray(data.phases) ? data.phases : []

  const groupsRequired =
    ['groups', 'groups_knockout'].includes(data.format) ||
    phases.some((phase) => phase.type === 'groups')

  if (groupsRequired) {
    if (
      !Number.isInteger(data.groupSettings.groupCount) ||
      data.groupSettings.groupCount < 1
    ) {
      errors['groupSettings.groupCount'] =
        'Informe a quantidade de grupos.'
    }

    if (
      !Number.isInteger(data.groupSettings.qualifiedPerGroup) ||
      data.groupSettings.qualifiedPerGroup < 1
    ) {
      errors['groupSettings.qualifiedPerGroup'] =
        'Informe quantas equipes avançam por grupo.'
    }

    if (
      data.groupSettings.teamsPerGroup !== null &&
      (!Number.isInteger(data.groupSettings.teamsPerGroup) ||
        data.groupSettings.teamsPerGroup < 2)
    ) {
      errors['groupSettings.teamsPerGroup'] =
        'Informe uma quantidade válida de equipes por grupo.'
    }

    if (
      !Number.isInteger(data.groupSettings.bestThirdPlaceCount) ||
      data.groupSettings.bestThirdPlaceCount < 0
    ) {
      errors['groupSettings.bestThirdPlaceCount'] =
        'A quantidade de melhores terceiros deve ser igual ou maior que zero.'
    }
  }

  const knockoutRequired =
    [
      'knockout',
      'groups_knockout',
      'league_knockout',
    ].includes(data.format) ||
    phases.some(
      (phase) =>
        phase.type === 'knockout' || phase.type === 'final',
    )

  if (
    knockoutRequired &&
    !data.knockoutSettings.firstRound.trim()
  ) {
    errors['knockoutSettings.firstRound'] =
      'Informe a primeira fase eliminatória.'
  }

  if (phases.length === 0) {
    errors.phases =
      'Cadastre ao menos uma fase da competição.'
  } else {
    const keys = phases.map((phase) => phase.key)
    const orders = phases.map((phase) => phase.order)

    if (
      phases.some((phase) => !phase.key.trim()) ||
      new Set(keys).size !== keys.length
    ) {
      errors.phases =
        'Cada fase precisa ter uma identificação única.'
    }

    if (
      orders.some(
        (order) => !Number.isInteger(order) || order < 1,
      ) ||
      new Set(orders).size !== orders.length
    ) {
      errors.phases =
        'A ordem das fases deve ser inteira e não pode se repetir.'
    }

    if (phases.some((phase) => !phase.name.trim())) {
      errors.phases =
        'Todas as fases precisam ter um nome.'
    }
  }

  const substitutions = data.substitutionSettings

  if (
    !Number.isInteger(substitutions.limit) ||
    substitutions.limit < 0
  ) {
    errors['substitutionSettings.limit'] =
      'O limite de substituições deve ser igual ou maior que zero.'
  }

  if (
    substitutions.windows !== null &&
    (!Number.isInteger(substitutions.windows) ||
      substitutions.windows < 0)
  ) {
    errors['substitutionSettings.windows'] =
      'Informe uma quantidade válida de janelas.'
  }

  const discipline = data.disciplineSettings

  if (
    !Number.isInteger(discipline.yellowCardSuspensionAfter) ||
    discipline.yellowCardSuspensionAfter < 0
  ) {
    errors['disciplineSettings.yellowCardSuspensionAfter'] =
      'A quantidade de cartões deve ser igual ou maior que zero.'
  }

  if (
    !Number.isInteger(discipline.redCardSuspensionMatches) ||
    discipline.redCardSuspensionMatches < 0
  ) {
    errors['disciplineSettings.redCardSuspensionMatches'] =
      'A suspensão por cartão vermelho deve ser igual ou maior que zero.'
  }

  return errors
}

export function assertValidRegulation(
  data: RegulationFormData,
): void {
  const errors = validateRegulation(data)

  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).join(' '))
  }
}
