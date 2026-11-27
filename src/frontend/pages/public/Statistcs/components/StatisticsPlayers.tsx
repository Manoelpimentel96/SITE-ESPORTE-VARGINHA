/**
 * Aba de gols e artilharia.
 *
 * Responsabilidades:
 * - Exibir o pódio (três primeiros) e o restante da artilharia geral.
 * - Agrupar os jogadores do ranking por equipe.
 */

import { Medal, Shield, Trophy } from 'lucide-react'

import type {
  PublicStatistics,
  PublicStatLeader,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import StatisticsRankList from './StatisticsRankList'
import StatisticsSectionHeading from './StatisticsSectionHeading'
import { pluralize } from './statistics.utils'

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

  // Os três primeiros ficam no pódio; o restante segue em lista.
  const podium = generalRanking.slice(0, 3)
  const remaining = generalRanking.slice(3)
  const topValue = generalRanking[0]?.total ?? 0

  const teamRankings =
    groupScorersByTeam(generalRanking)

  return (
    <div className="statistics-players">
      <section className="statistics-players__general statistics-panel">
        <StatisticsSectionHeading
          title="Artilharia geral"
          description="Jogadores com maior número de gols na temporada."
          icon={Trophy}
          tone="goal"
          aside={
            <div className="statistics-players__season-goals">
              <strong>{statistics.goals}</strong>

              <span>
                {pluralize(
                  statistics.goals,
                  'gol na temporada',
                  'gols na temporada',
                )}
              </span>
            </div>
          }
        />

        {podium.length > 0 && (
          <ol className="statistics-players__podium">
            {podium.map((leader, index) => (
              <li
                key={`${leader.playerId}-${leader.teamName}`}
                className={`statistics-players__podium-item statistics-players__podium-item--${index + 1}`}
              >
                <span
                  className="statistics-players__podium-medal"
                  aria-hidden="true"
                >
                  {index === 0 ? (
                    <Trophy size={20} />
                  ) : (
                    <Medal size={20} />
                  )}
                </span>

                <span className="statistics-players__podium-position">
                  {index + 1}º lugar
                </span>

                <strong className="statistics-players__podium-name">
                  {leader.name}
                </strong>

                <span className="statistics-players__podium-team">
                  {leader.teamName || 'Equipe não identificada'}
                </span>

                <div className="statistics-players__podium-goals">
                  <strong>{leader.total}</strong>

                  <span>
                    {pluralize(leader.total, 'gol', 'gols')}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}

        {generalRanking.length === 0 && (
          <StatisticsRankList
            leaders={[]}
            valueLabel="gols"
            emptyMessage="Nenhum gol registrado na temporada."
          />
        )}

        {remaining.length > 0 && (
          <StatisticsRankList
            leaders={remaining}
            startAt={4}
            maxValue={topValue}
            valueLabel="gols"
            singularLabel="gol"
            tone="goal"
            emptyMessage=""
          />
        )}
      </section>

      <section className="statistics-players__teams">
        <StatisticsSectionHeading
          title="Artilharia por equipe"
          description="Os jogadores que mais marcaram em cada equipe."
          icon={Shield}
        />

        {!teamRankings.length ? (
          <div className="statistics-players__empty">
            Nenhum gol registrado por equipe.
          </div>
        ) : (
          <div className="statistics-players__team-grid">
            {teamRankings.map((team) => (
              <article
                key={team.teamName}
                className="statistics-players__team-card statistics-panel"
              >
                <header>
                  <h3>{team.teamName}</h3>

                  <span>
                    {team.leaders.length}{' '}
                    {pluralize(
                      team.leaders.length,
                      'jogador',
                      'jogadores',
                    )}
                  </span>
                </header>

                <StatisticsRankList
                  leaders={team.leaders}
                  valueLabel="gols"
                  singularLabel="gol"
                  tone="goal"
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
