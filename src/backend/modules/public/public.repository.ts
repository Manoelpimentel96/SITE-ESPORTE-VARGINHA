import type { MatchesRepository } from './matches/matches.repository.js'
import type { OverviewRepository } from './overview/overview.repository.js'
import type { PlayersRepository } from './players/players.repository.js'
import type { SeasonsRepository } from './seasons/seasons.repository.js'
import type { StandingsRepository } from './standings/standings.repository.js'
import type { StatisticsRepository } from './statistics/statistics.repository.js'
import type { TeamsRepository } from './teams/teams.repository.js'

/**
 * Repositório completo do portal público.
 * É a união dos repositórios de cada página (veja a pasta de cada página).
 */
export interface PublicRepository
  extends SeasonsRepository,
    TeamsRepository,
    MatchesRepository,
    PlayersRepository,
    StandingsRepository,
    OverviewRepository,
    StatisticsRepository {}
