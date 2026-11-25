import type { MatchesRepository } from '../matches/matches.repository.js'
import type { TeamsRepository } from '../teams/teams.repository.js'

/** A classificação é calculada a partir das equipes e das partidas da temporada. */
export interface StandingsRepository
  extends Pick<TeamsRepository, 'listTeams'>,
    Pick<MatchesRepository, 'listMatches'> {}
