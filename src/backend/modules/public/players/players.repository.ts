import type { PublicPlayer } from './players.types.js'

/** Dados de que a página Jogadores usa. */
export interface PlayersRepository {
  listPlayers(seasonId: string, search?: string): Promise<PublicPlayer[]>
}
