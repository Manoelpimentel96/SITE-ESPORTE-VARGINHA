export type PublicChampionship = {
  id: string
  name: string
  acronym: string | null
  description: string | null
  logoUrl: string | null
}

export type PublicSeason = {
  id: string
  championshipId: string
  name: string
  edition: number | null
  startDate: string | null
  endDate: string | null
  status: string
}

export type PublicTeam = {
  registrationId: string
  teamId: string
  name: string
  shortName: string | null
  city: string | null
  primaryColor: string | null
  crestUrl: string | null
  foundedYear: number | null
}

export type PublicMatch = {
  id: string
  /** IDs da inscrição, usados internamente para relacionar partidas e classificação. */
  homeRegistrationId: string
  awayRegistrationId: string
  scheduledAt: string | null
  status: string
  homeScore: number | null
  awayScore: number | null
  city: string | null
  venue: string | null
  homeTeam: string
  awayTeam: string
  homeCrest: string | null
  awayCrest: string | null
  phase: string | null
  group: string | null
  round: string | null
}

export type PublicStanding = {
  position: number
  registrationId: string
  teamId: string
  teamName: string
  crestUrl: string | null
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export type PublicPlayer = {
  id: string
  name: string
  position: string | null
  photoUrl: string | null
  shirtNumber: number | null
  teamName: string
  registrationId: string
}

export type PublicTeamDetails = {
  team: PublicTeam
  players: PublicPlayer[]
  matches: PublicMatch[]
  staff: Array<{ name: string; role: string }>
}

export type PublicOverview = {
  teamsCount: number
  matchesCount: number
  finishedCount: number
  upcomingCount: number
  latestResults: PublicMatch[]
  upcomingMatches: PublicMatch[]
  standings: PublicStanding[]
}

export type PublicStatistics = {
  goals: number
  matchesPlayed: number
  teams: number
  players: number
  topScorers: Array<{ playerId: string; name: string; teamName: string; goals: number }>
}
