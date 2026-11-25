
/**
 * Estatísticas de gols por equipe.
 *
 * Responsabilidades:
 * - Exibir os destaques de ataque e defesa.
 * - Apresentar os números completos de cada equipe.
 *
 * Os dados são recebidos do backend.
 */

import type {
  PublicStatistics,
  PublicTeamGoals,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import '../../../../../styles/public/Statistics/StatisticsTeams.css'

interface StatisticsTeamsProps {
  statistics: PublicStatistics
}

interface TeamHighlightCardProps {
  title: string
  team: PublicTeamGoals | null
  metric: 'attack' | 'defense'
}

function TeamHighlightCard({
  title,
  team,
  metric,
}: TeamHighlightCardProps) {
  if (!team) {
    return null
  }

  const average =
    metric === 'attack'
      ? team.goalsForPerMatch
      : team.goalsAgainstPerMatch

  return (
    <article className="statistics-teams__highlight">
      <span>{title}</span>

      <strong>{team.teamName}</strong>

      <p>
        Média de {average.toFixed(2)} gols por partida
      </p>
    </article>
  )
}

export default function StatisticsTeams({
  statistics,
}: StatisticsTeamsProps) {
  const teams = statistics.teamGoals

  return (
    <section className="statistics-teams">
      <div className="statistics-section-heading">
        <h2>Gols por equipe</h2>

        <p>
          Confira os números ofensivos e defensivos
          das equipes.
        </p>
      </div>

      <div className="statistics-teams__highlights">
        <TeamHighlightCard
          title="Melhor ataque"
          team={statistics.teamHighlights.bestAttack}
          metric="attack"
        />

        <TeamHighlightCard
          title="Melhor defesa"
          team={statistics.teamHighlights.bestDefense}
          metric="defense"
        />

        <TeamHighlightCard
          title="Ataque menos eficiente"
          team={statistics.teamHighlights.worstAttack}
          metric="attack"
        />

        <TeamHighlightCard
          title="Defesa mais vazada"
          team={statistics.teamHighlights.worstDefense}
          metric="defense"
        />
      </div>

      {!teams.length ? (
        <div className="statistics-teams__empty">
          Nenhum dado de equipe disponível.
        </div>
      ) : (
        <div className="statistics-teams__list">
          {teams.map((team) => (
            <article
              key={team.registrationId}
              className="statistics-teams__item"
            >
              <h3>{team.teamName}</h3>

              <div className="statistics-teams__numbers">
                <div>
                  <span>Partidas</span>
                  <strong>{team.matches}</strong>
                </div>

                <div>
                  <span>Gols marcados</span>
                  <strong>{team.goalsFor}</strong>
                </div>

                <div>
                  <span>Gols sofridos</span>
                  <strong>{team.goalsAgainst}</strong>
                </div>

                <div>
                  <span>Média de gols</span>
                  <strong>
                    {team.goalsForPerMatch.toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Média sofrida</span>
                  <strong>
                    {team.goalsAgainstPerMatch.toFixed(2)}
                  </strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
