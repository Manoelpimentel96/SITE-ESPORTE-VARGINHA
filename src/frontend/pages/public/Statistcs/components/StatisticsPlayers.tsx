
/**
 * Aba de artilharia.
 *
 * Responsabilidades:
 * - Exibir a artilharia geral.
 * - Agrupar os jogadores do ranking por equipe.
 */

import type {
  PublicStatistics,
  PublicStatLeader,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import StatisticsRankList from './StatisticsRankList'

import '../../../../../styles/public/Statistics/StatisticsPlayers.css'

interface StatisticsPlayersProps {
  statistics: PublicStatistics
}

interface TeamScorerGroup {
  teamName: string
  leaders: PublicStatLeader[]
}

function groupScorersByTeam(
  leaders: PublicStatLeader[],
): TeamScorerGroup[] {
  const groups = new Map<string, PublicStatLeader[]>()

  for (const leader of leaders) {
    const teamName =
      leader.teamName || 'Equipe não identificada'

    const teamLeaders = groups.get(teamName) ?? []

    teamLeaders.push(leader)

    groups.set(teamName, teamLeaders)
  }

  return Array.from(groups.entries())
    .map(([teamName, teamLeaders]) => ({
      teamName,
      leaders: [...teamLeaders].sort(
        (a, b) => b.total - a.total,
      ),
    }))
    .sort((a, b) =>
      a.teamName.localeCompare(b.teamName),
    )
}

export default function StatisticsPlayers({
  statistics,
}: StatisticsPlayersProps) {
  const generalRanking = statistics.topScorers

  const teamRankings =
    groupScorersByTeam(generalRanking)

  return (
    <div className="statistics-players">
      <section className="statistics-players__general">
        <div className="statistics-section-heading">
          <h2>Artilharia geral</h2>

          <p>
            Jogadores com maior número de gols na temporada.
          </p>
        </div>

        <StatisticsRankList
          leaders={generalRanking}
          valueLabel="gols"
          emptyMessage="Nenhum gol registrado na temporada."
        />
      </section>

      <section className="statistics-players__teams">
        <div className="statistics-section-heading">
          <h2>Artilharia por equipe</h2>

          <p>
            Confira os jogadores que mais marcaram gols
            em cada equipe.
          </p>
        </div>

        {!teamRankings.length ? (
          <div className="statistics-players__empty">
            Nenhum gol registrado por equipe.
          </div>
        ) : (
          <div className="statistics-players__team-grid">
            {teamRankings.map((team) => (
              <article
                key={team.teamName}
                className="statistics-players__team-card"
              >
                <header>
                  <h3>{team.teamName}</h3>

                  <span>
                    {team.leaders.length} jogadores
                  </span>
                </header>

                <StatisticsRankList
                  leaders={team.leaders}
                  valueLabel="gols"
                  emptyMessage="Nenhum gol registrado."
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
