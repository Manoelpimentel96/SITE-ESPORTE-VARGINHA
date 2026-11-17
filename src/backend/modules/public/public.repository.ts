import type {
  PublicChampionship,
  PublicMatch,
  PublicPlayer,
  PublicSeason,
  PublicTeam,
} from './public.types.js'

export interface PublicRepository {
  listChampionships(): Promise<PublicChampionship[]>
  listSeasons(championshipId: string): Promise<PublicSeason[]>
  getSeason(seasonId: string): Promise<PublicSeason>
  listTeams(seasonId: string, search?: string): Promise<PublicTeam[]>
  listMatches(seasonId: string): Promise<PublicMatch[]>
  listPlayers(seasonId: string, search?: string): Promise<PublicPlayer[]>
  getTeamDetails(seasonId: string, teamId: string): Promise<{
    team: PublicTeam
    players: PublicPlayer[]
    matches: PublicMatch[]
    staff: Array<{ name: string; role: string }>
  }>
  listPreviousSeasons(championshipId: string): Promise<PublicSeason[]>
  countPlayers(seasonId: string): Promise<number>
  listScorerEvents(seasonId: string): Promise<Array<{
    playerId: string
    playerName: string
    teamName: string
  }>>
}
