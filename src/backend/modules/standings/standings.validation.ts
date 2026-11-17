
import type { StandingsFilters } from './standings.types.js'

export function validateStandingsFilters(
  filters: StandingsFilters,
): string | null {
  if (!filters.championshipId) {
    return 'Selecione um campeonato.'
  }

  if (!filters.seasonId) {
    return 'Selecione uma temporada.'
  }

  if (
    filters.phaseId &&
    filters.phaseId.trim().length === 0
  ) {
    return 'A fase selecionada é inválida.'
  }

  if (
    filters.groupId &&
    filters.groupId.trim().length === 0
  ) {
    return 'O grupo selecionado é inválido.'
  }

  return null
}
