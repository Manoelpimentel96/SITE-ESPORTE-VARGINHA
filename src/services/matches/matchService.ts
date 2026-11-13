
import { domainCall } from '../../lib/domainApi'

import type {
  Match,
  MatchFilters,
  MatchFormData,
  MatchEvent,
  MatchEventFormData,
  ChampionshipOption,
  SeasonOption,
  PhaseOption,
  GroupOption,
  RoundOption,
  MatchTeamOption,
} from '../../backend/modules/matches/matches.types'

export const listMatches = (filters: MatchFilters) =>
  domainCall<Match[]>('matches', 'listMatches', filters)

export const createMatch = (data: MatchFormData) =>
  domainCall<Match>('matches', 'createMatch', data)

export const updateMatch = (id: string, data: MatchFormData) =>
  domainCall<Match>('matches', 'updateMatch', id, data)

export const deleteMatch = (id: string) =>
  domainCall<void>('matches', 'deleteMatch', id)

export const findMatchById = (id: string) =>
  domainCall<Match | null>('matches', 'findMatchById', id)

export const startMatch = (matchId: string) =>
  domainCall<Match>('matches', 'startMatch', matchId)

export const finishMatch = (matchId: string) =>
  domainCall<Match>('matches', 'finishMatch', matchId)

export const listMatchEvents = (matchId: string) =>
  domainCall<MatchEvent[]>('matches', 'listMatchEvents', matchId)

export const createMatchEvent = (
  matchId: string,
  data: MatchEventFormData,
) =>
  domainCall<MatchEvent>(
    'matches',
    'createMatchEvent',
    matchId,
    data,
  )

export const updateMatchEvent = (
  matchId: string,
  eventId: string,
  data: MatchEventFormData,
) =>
  domainCall<MatchEvent>(
    'matches',
    'updateMatchEvent',
    matchId,
    eventId,
    data,
  )

export const deleteMatchEvent = (
  matchId: string,
  eventId: string,
) =>
  domainCall<void>(
    'matches',
    'deleteMatchEvent',
    matchId,
    eventId,
  )

export const listMatchChampionships = () =>
  domainCall<ChampionshipOption[]>(
    'matches',
    'listMatchChampionships',
  )

export const listMatchSeasons = (id: string) =>
  domainCall<SeasonOption[]>(
    'matches',
    'listMatchSeasons',
    id,
  )

export const listMatchPhases = (id: string) =>
  domainCall<PhaseOption[]>(
    'matches',
    'listMatchPhases',
    id,
  )

export const listMatchGroups = (id: string) =>
  domainCall<GroupOption[]>(
    'matches',
    'listMatchGroups',
    id,
  )

export const listMatchRounds = (
  phaseId: string,
  groupId: string,
) =>
  domainCall<RoundOption[]>(
    'matches',
    'listMatchRounds',
    phaseId,
    groupId,
  )

export const listMatchTeams = (id: string) =>
  domainCall<MatchTeamOption[]>(
    'matches',
    'listMatchTeams',
    id,
  )
