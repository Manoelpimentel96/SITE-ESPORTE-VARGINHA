import { requireId } from '../public.validation.js'
import { calculateStandings } from '../standings/standings.use-cases.js'
import type { OverviewRepository } from './overview.repository.js'
import type { PublicOverview } from './overview.types.js'

// Regras da página pública: Visão geral.
export function createOverviewUseCases(
  repository: OverviewRepository,
) {
  return {
    async getOverview(
      seasonId: string,
    ): Promise<PublicOverview> {
      const id = requireId(seasonId, 'Temporada')

      const [teams, matches] = await Promise.all([
        repository.listTeams(id),
        repository.listMatches(id),
      ])

      const finished = matches.filter(
        (match) => match.status === 'finished',
      )

      const upcoming = matches.filter(
        (match) => match.status === 'scheduled',
      )

      return {
        teamsCount: teams.length,
        matchesCount: matches.length,
        finishedCount: finished.length,
        upcomingCount: upcoming.length,

        latestResults: [...finished]
          .sort((a, b) =>
            (b.scheduledAt ?? '').localeCompare(
              a.scheduledAt ?? '',
            ),
          )
          .slice(0, 4),

        upcomingMatches: upcoming.slice(0, 4),

        standings: calculateStandings(
          teams,
          matches,
        ).slice(0, 8),
      }
    },
  }
}
