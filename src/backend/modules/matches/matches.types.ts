
export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'finished'
  | 'postponed'
  | 'cancelled'

export type MatchEventType =
  | 'goal'
  | 'own_goal'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'penalty_goal'
  | 'penalty_miss'
  | 'other'

export interface Match {
  id: string
  seasonId: string
  phaseId: string
  groupId: string | null
  roundId: string | null
  homeRegistrationId: string
  awayRegistrationId: string
  city: string | null
  venue: string | null
  scheduledAt: string | null
  startedAt: string | null
  finishedAt: string | null
  homeScore: number
  awayScore: number
  status: MatchStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  homeTeamName: string
  awayTeamName: string
  phaseName: string
}

export interface MatchFormData {
  seasonId: string
  phaseId: string
  groupId: string
  roundId: string
  homeRegistrationId: string
  awayRegistrationId: string
  city: string
  venue: string
  scheduledAt: string
  notes: string
}

export interface MatchFilters {
  seasonId: string
  status: MatchStatus | 'all'
  search: string
}

export interface MatchEvent {
  id: string
  matchId: string
  teamRegistrationId: string
  playerRegistrationId: string | null
  relatedPlayerRegistrationId: string | null
  eventType: MatchEventType
  minute: number
  addedTime: number
  description: string | null
  createdAt: string
}

export interface MatchEventFormData {
  teamRegistrationId: string
  playerRegistrationId: string
  relatedPlayerRegistrationId: string
  eventType: MatchEventType
  minute: number
  addedTime: number
  description: string
}

export interface MatchStatusUpdate {
  status: MatchStatus
  startedAt?: string | null
  finishedAt?: string | null
}

export interface ChampionshipOption {
  id: string
  name: string
}

export interface SeasonOption {
  id: string
  championshipId: string
  name: string
}

export interface PhaseOption {
  id: string
  name: string
  seasonId: string
}

export interface GroupOption {
  id: string
  name: string
  phaseId: string
}

export interface RoundOption {
  id: string
  name: string
  phaseId: string
  groupId: string | null
}

export interface MatchTeamOption {
  registrationId: string
  teamId: string
  teamName: string
}

export interface MatchRepository {
  list(filters: MatchFilters): Promise<Match[]>
  findById(id: string): Promise<Match | null>
  create(data: MatchFormData): Promise<Match>
  update(id: string, data: MatchFormData): Promise<Match>
  delete(id: string): Promise<void>

  listEvents(matchId: string): Promise<MatchEvent[]>
  createEvent(
    matchId: string,
    data: MatchEventFormData,
  ): Promise<MatchEvent>
  updateEvent(
    matchId: string,
    eventId: string,
    data: MatchEventFormData,
  ): Promise<MatchEvent>
  deleteEvent(matchId: string, eventId: string): Promise<void>

  updateStatus(
    matchId: string,
    data: MatchStatusUpdate,
  ): Promise<Match>
  recalculateScore(matchId: string): Promise<Match>

  listChampionships(): Promise<ChampionshipOption[]>
  listSeasons(championshipId: string): Promise<SeasonOption[]>
  listPhases(seasonId: string): Promise<PhaseOption[]>
  listGroups(phaseId: string): Promise<GroupOption[]>
  listRounds(phaseId: string, groupId: string): Promise<RoundOption[]>
  listTeams(seasonId: string): Promise<MatchTeamOption[]>
}
