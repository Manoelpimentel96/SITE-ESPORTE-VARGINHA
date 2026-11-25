import { requireId } from '../public.validation.js'
import type { SeasonsRepository } from './seasons.repository.js'

// Regras da página pública: seletor de campeonato/temporada e "Edições anteriores".
export function createSeasonsUseCases(
  repository: SeasonsRepository,
) {
  return {
    listChampionships: () =>
      repository.listChampionships(),

    listSeasons: (championshipId: string) =>
      repository.listSeasons(
        requireId(championshipId, 'Campeonato'),
      ),

    getSeason: (seasonId: string) =>
      repository.getSeason(
        requireId(seasonId, 'Temporada'),
      ),

    listPreviousSeasons: (championshipId: string) =>
      repository.listPreviousSeasons(
        requireId(championshipId, 'Campeonato'),
      ),
  }
}
