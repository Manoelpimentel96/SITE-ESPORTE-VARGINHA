import { requireId } from '../public.validation.js'
import type { MatchesRepository } from './matches.repository.js'

// Regras da página pública: Partidas.
export function createMatchesUseCases(
  repository: MatchesRepository,
) {
  return {
    listMatches: (seasonId: string) =>
      repository.listMatches(
        requireId(seasonId, 'Temporada'),
      ),
  }
}
