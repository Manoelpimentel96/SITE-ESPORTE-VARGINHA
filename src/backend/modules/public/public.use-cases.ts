import type { PublicRepository } from './public.repository.js'
import { createMatchesUseCases } from './matches/matches.use-cases.js'
import { createOverviewUseCases } from './overview/overview.use-cases.js'
import { createPlayersUseCases } from './players/players.use-cases.js'
import { createSeasonsUseCases } from './seasons/seasons.use-cases.js'
import { createStandingsUseCases } from './standings/standings.use-cases.js'
import { createStatisticsUseCases } from './statistics/statistics.use-cases.js'
import { createTeamsUseCases } from './teams/teams.use-cases.js'

/**
 * Casos de uso do portal público.
 *
 * A regra de cada página fica na pasta dela (ex.: statistics/statistics.use-cases.ts).
 * Este arquivo apenas reúne as páginas em um único objeto, mantendo a mesma
 * interface usada pela API (apps/api/src/domain-services/public/publicService.ts).
 */
export function createPublicUseCases(
  repository: PublicRepository,
) {
  return {
    ...createSeasonsUseCases(repository),
    ...createTeamsUseCases(repository),
    ...createMatchesUseCases(repository),
    ...createPlayersUseCases(repository),
    ...createStandingsUseCases(repository),
    ...createOverviewUseCases(repository),
    ...createStatisticsUseCases(repository),
  }
}
