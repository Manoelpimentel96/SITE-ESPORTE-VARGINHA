import { normalizeSearch, requireId } from '../public.validation.js'
import type { TeamsRepository } from './teams.repository.js'

// Regras das páginas públicas: Equipes e detalhe da equipe.
export function createTeamsUseCases(
  repository: TeamsRepository,
) {
  return {
    listTeams: (seasonId: string, search?: string) =>
      repository.listTeams(
        requireId(seasonId, 'Temporada'),
        normalizeSearch(search),
      ),

    getTeamDetails: (
      seasonId: string,
      teamId: string,
    ) =>
      repository.getTeamDetails(
        requireId(seasonId, 'Temporada'),
        requireId(teamId, 'Equipe'),
      ),
  }
}
