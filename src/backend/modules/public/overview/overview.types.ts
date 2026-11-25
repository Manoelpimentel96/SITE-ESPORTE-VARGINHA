// Tipos da página pública: Visão geral.

import type { PublicMatch } from '../matches/matches.types.js'
import type { PublicStanding } from '../standings/standings.types.js'

export type PublicOverview = {
  teamsCount: number
  matchesCount: number
  finishedCount: number
  upcomingCount: number
  latestResults: PublicMatch[]
  upcomingMatches: PublicMatch[]
  standings: PublicStanding[]
}
