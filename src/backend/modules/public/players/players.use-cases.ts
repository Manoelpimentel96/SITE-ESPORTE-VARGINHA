import { normalizeSearch, requireId } from '../public.validation.js'
import type { PlayersRepository } from './players.repository.js'

// Regras da página pública: Jogadores.
export function createPlayersUseCases(
  repository: PlayersRepository,
) {
  return {
    listPlayers: (seasonId: string, search?: string) =>
      repository.listPlayers(
        requireId(seasonId, 'Temporada'),
        normalizeSearch(search),
      ),
  }
}
