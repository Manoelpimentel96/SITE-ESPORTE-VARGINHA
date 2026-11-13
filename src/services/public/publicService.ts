import type { PublicChampionship, PublicSeason, PublicOverview, PublicTeam, PublicTeamDetails, PublicMatch, PublicStanding, PublicPlayer, PublicStatistics } from '../../backend/modules/public/public.types'
import { domainCall } from '../../lib/domainApi'

export const publicService = {
  listChampionships: () => 
    domainCall<PublicChampionship[]>('public', 'listChampionships'),
  listSeasons: (championshipId: string) => 
    domainCall<PublicSeason[]>('public', 'listSeasons', championshipId),
  getSeason: (seasonId: string) => 
    domainCall<PublicSeason>('public', 'getSeason', seasonId),
  getOverview: (seasonId: string) =>
     domainCall<PublicOverview>('public', 'getOverview', seasonId),
  listTeams: (seasonId: string, search?: string) =>
     domainCall<PublicTeam[]>('public', 'listTeams', seasonId, search),
  getTeamDetails: (seasonId: string, teamId: string) => 
    domainCall<PublicTeamDetails>('public', 'getTeamDetails', seasonId, teamId),
  listMatches: (seasonId: string, filters?: unknown) =>
     domainCall<PublicMatch[]>('public', 'listMatches', seasonId, filters),
  getStandings: (seasonId: string, phaseId?: string, groupId?: string) => domainCall<PublicStanding[]>('public', 'getStandings', seasonId, phaseId, groupId),
  listPlayers: (seasonId: string, search?: string) =>
     domainCall<PublicPlayer[]>('public', 'listPlayers', seasonId, search),
  getStatistics: (seasonId: string) => 
    domainCall<PublicStatistics>('public', 'getStatistics', seasonId),
  listPreviousSeasons: (championshipId: string, currentSeasonId?: string) => domainCall<PublicSeason[]>('public', 'listPreviousSeasons', championshipId, currentSeasonId),
}
