import type { PublicChampionship, PublicSeason } from './seasons.types.js'

/** Dados de que a página usa: seletor de campeonato/temporada e "Edições anteriores". */
export interface SeasonsRepository {
  listChampionships(): Promise<PublicChampionship[]>
  listSeasons(championshipId: string): Promise<PublicSeason[]>
  getSeason(seasonId: string): Promise<PublicSeason>
  listPreviousSeasons(championshipId: string): Promise<PublicSeason[]>
}
