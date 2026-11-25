import type { PublicMatch } from './matches.types.js'

/** Dados de que a página Partidas usa. */
export interface MatchesRepository {
  listMatches(seasonId: string): Promise<PublicMatch[]>
}
