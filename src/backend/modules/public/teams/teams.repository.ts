import type { PublicTeam, PublicTeamDetails } from './teams.types.js'

/** Dados de que as páginas Equipes e detalhe da equipe usam. */
export interface TeamsRepository {
  listTeams(seasonId: string, search?: string): Promise<PublicTeam[]>
  getTeamDetails(seasonId: string, teamId: string): Promise<PublicTeamDetails>
}
