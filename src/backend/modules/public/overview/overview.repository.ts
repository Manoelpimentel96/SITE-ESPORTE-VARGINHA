import type { MatchesRepository } from '../matches/matches.repository.js'
import type { TeamsRepository } from '../teams/teams.repository.js'

/** A visão geral usa as equipes e as partidas da temporada. */
export interface OverviewRepository
  extends Pick<TeamsRepository, 'listTeams'>,
    Pick<MatchesRepository, 'listMatches'> {}
