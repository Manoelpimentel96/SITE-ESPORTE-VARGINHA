
import { matchSupabaseRepository } from '../../../../../src/backend/modules/matches/matches.supabase.js'
import { createMatchUseCases } from '../../../../../src/backend/modules/matches/matches.use-cases.js'

import type {
  MatchEventFormData,
  MatchFilters,
  MatchFormData,
} from '../../../../../src/backend/modules/matches/matches.types'

const matches = createMatchUseCases(matchSupabaseRepository)

export const listMatches = (filters: MatchFilters) =>
  matches.list(filters)

export const createMatch = (data: MatchFormData) =>
  matches.create(data)

export const updateMatch = (id: string, data: MatchFormData) =>
  matches.update(id, data)

export const deleteMatch = (id: string) =>
  matches.delete(id)

export const findMatchById = (id: string) =>
  matches.findById(id)

export const startMatch = (id: string) =>
  matches.start(id)

export const finishMatch = (id: string) =>
  matches.finish(id)

export const listMatchEvents = (matchId: string) =>
  matches.listEvents(matchId)

export const createMatchEvent = (
  matchId: string,
  data: MatchEventFormData,
) => matches.createEvent(matchId, data)

export const updateMatchEvent = (
  matchId: string,
  eventId: string,
  data: MatchEventFormData,
) => matches.updateEvent(matchId, eventId, data)

export const deleteMatchEvent = (
  matchId: string,
  eventId: string,
) => matches.deleteEvent(matchId, eventId)

export const listMatchChampionships = () =>
  matches.listChampionships()

export const listMatchSeasons = (championshipId: string) =>
  matches.listSeasons(championshipId)

export const listMatchPhases = (seasonId: string) =>
  matches.listPhases(seasonId)

export const listMatchGroups = (phaseId: string) =>
  matches.listGroups(phaseId)

export const listMatchRounds = (phaseId: string, groupId: string) =>
  matches.listRounds(phaseId, groupId)

export const listMatchTeams = (seasonId: string) =>
  matches.listTeams(seasonId)
