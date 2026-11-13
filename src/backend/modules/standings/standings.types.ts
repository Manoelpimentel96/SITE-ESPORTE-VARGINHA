
export type StandingsMode = 'official' | 'provisional'

export type StandingsTieBreaker =
  | 'points'
  | 'wins'
  | 'goal_difference'
  | 'goals_for'
  | 'head_to_head'
  | 'fewest_goals_against'
  | 'fewest_losses'
  | 'fair_play'

export interface StandingsRules {
  pointsPerWin: number
  pointsPerDraw: number
  pointsPerLoss: number
  tieBreakers: StandingsTieBreaker[]
}

export interface StandingsFilters {
  championshipId: string
  seasonId: string
  phaseId?: string
  groupId?: string
  mode: StandingsMode
}

export interface StandingsTeam {
  id: string
  name: string
  shortName: string | null
}

export interface StandingsRow {
  position: number
  team: StandingsTeam
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  yellowCards: number
  redCards: number
}

export interface StandingsMatch {
  id: string
  seasonId: string
  phaseId: string
  groupId: string | null
  homeRegistrationId: string
  awayRegistrationId: string
  homeScore: number
  awayScore: number
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
}

export interface StandingsRegistration {
  id: string
  teamId: string
  team: StandingsTeam
}

export interface StandingsMatchEvent {
  matchId: string
  registrationId: string
  type: string
}

export interface StandingsChampionshipOption {
  id: string
  name: string
}

export interface StandingsSeasonOption {
  id: string
  championshipId: string
  name: string
}

export interface StandingsPhaseOption {
  id: string
  name: string
}

export interface StandingsGroupOption {
  id: string
  name: string
}

export interface StandingsRepository {
  listChampionships(): Promise<StandingsChampionshipOption[]>
  listSeasons(championshipId: string): Promise<StandingsSeasonOption[]>
  listPhases(seasonId: string): Promise<StandingsPhaseOption[]>
  listGroups(phaseId: string): Promise<StandingsGroupOption[]>
  listMatches(seasonId: string): Promise<StandingsMatch[]>
  listRegistrations(seasonId: string): Promise<StandingsRegistration[]>
  listMatchEvents(seasonId: string): Promise<StandingsMatchEvent[]>
  getRules(seasonId: string): Promise<StandingsRules>
  subscribeToSeason(
    seasonId: string,
    onChange: () => void,
  ): () => void
}
