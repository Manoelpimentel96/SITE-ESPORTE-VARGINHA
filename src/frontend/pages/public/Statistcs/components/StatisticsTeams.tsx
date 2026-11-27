/**
 * Estatísticas de gols por equipe.
 *
 * Responsabilidades:
 * - Exibir os destaques de ataque e defesa (melhor e pior).
 * - Apresentar uma tabela com os números de cada equipe.
 *
 * Os dados são recebidos do backend. Este componente só organiza a apresentação.
 */

import { Flame, ShieldCheck, ShieldX, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type {
  PublicStatistics,
  PublicTeamGoals,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import StatisticsSectionHeading from './StatisticsSectionHeading'
import { formatDecimal, pluralize } from './statistics.utils'

import '../../../../../styles/public/Statistics/StatisticsTeams.css'

interface StatisticsTeamsProps {
  statistics: PublicStatistics
}

interface TeamHighlightCardProps {
  title: string
  hint: string
  team: PublicTeamGoals | null
  metric: 'attack' | 'defense'
  icon: LucideIcon
  /** good = destaque positivo (verde); bad = destaque negativo (vermelho). */
  quality: 'good' | 'bad'
}

function TeamHighlightCard({
  title,
  hint,
  team,
  metric,
  icon: Icon,
  quality,
}: TeamHighlightCardProps) {
  if (!team) {
    return null
  }

  const isAttack = metric === 'attack'

  const average = isAttack
    ? team.goalsForPerMatch
    : team.goalsAgainstPerMatch

  const total = isAttack ? team.goalsFor : team.goalsAgainst

  const goalsLabel = pluralize(total, 'gol', 'gols')

  return (
    <article
      className={`statistics-teams__highlight statistics-tone--${
        quality === 'good' ? 'goal' : 'red'
      }`}
    >
      <span
        className="statistics-teams__highlight-icon"
        aria-hidden="true"
      >
        <Icon size={22} />
      </span>

      <div className="statistics-teams__highlight-body">
        <span className="statistics-teams__highlight-title">
          {title}
        </span>

        <strong className="statistics-teams__highlight-team">
          {team.teamName}
        </strong>

        <small>
          {hint} · {total} {goalsLabel} em {team.matches}{' '}
          {pluralize(team.matches, 'jogo', 'jogos')}
        </small>
      </div>

      <div className="statistics-teams__highlight-value">
        <strong>{formatDecimal(average)}</strong>

        <span>gols por jogo</span>
      </div>
    </article>
  )
}

export default function StatisticsTeams({
  statistics,
}: StatisticsTeamsProps) {
  const teams = statistics.teamGoals
  const highlights = statistics.teamHighlights

  const hasHighlights = Boolean(
    highlights.bestAttack ||
      highlights.worstAttack ||
      highlights.bestDefense ||
      highlights.worstDefense,
  )

  // Maiores valores da tabela: 100% das barras de comparação.
  const maxGoalsFor = Math.max(
    ...teams.map((team) => team.goalsFor),
    1,
  )

  const maxGoalsAgainst = Math.max(
    ...teams.map((team) => team.goalsAgainst),
    1,
  )

  return (
    <section className="statistics-teams">
      <div className="statistics-teams__highlights-section">
        <StatisticsSectionHeading
          title="Ataque e defesa"
          description="Destaques da temporada, comparados pela média de gols por jogo."
          icon={Flame}
        />

        {hasHighlights ? (
          <div className="statistics-teams__highlights">
            <TeamHighlightCard
              title="Melhor ataque"
              hint="Maior média de gols marcados"
              team={highlights.bestAttack}
              metric="attack"
              icon={Flame}
              quality="good"
            />

            <TeamHighlightCard
              title="Ataque menos eficiente"
              hint="Menor média de gols marcados"
              team={highlights.worstAttack}
              metric="attack"
              icon={TrendingDown}
              quality="bad"
            />

            <TeamHighlightCard
              title="Melhor defesa"
              hint="Menor média de gols sofridos"
              team={highlights.bestDefense}
              metric="defense"
              icon={ShieldCheck}
              quality="good"
            />

            <TeamHighlightCard
              title="Defesa mais vazada"
              hint="Maior média de gols sofridos"
              team={highlights.worstDefense}
              metric="defense"
              icon={ShieldX}
              quality="bad"
            />
          </div>
        ) : (
          <div className="statistics-teams__empty">
            Os destaques aparecem quando pelo menos duas equipes
            tiverem partidas disputadas.
          </div>
        )}
      </div>

      <div className="statistics-teams__table-section">
        <StatisticsSectionHeading
          title="Gols por equipe"
          description="Gols marcados e sofridos por cada equipe, em ordem de gols marcados."
          icon={Flame}
        />

        {!teams.length ? (
          <div className="statistics-teams__empty">
            Nenhum dado de equipe disponível.
          </div>
        ) : (
          <>
            <div className="statistics-teams__table-wrap">
              <table className="statistics-teams__table">
                <caption className="statistics-visually-hidden">
                  Gols marcados e sofridos por equipe
                </caption>

                <thead>
                  <tr>
                    <th scope="col">#</th>

                    <th
                      scope="col"
                      className="statistics-teams__col-team"
                    >
                      Equipe
                    </th>

                    <th scope="col">
                      <span className="statistics-teams__long">
                        Jogos
                      </span>

                      <abbr
                        className="statistics-teams__short"
                        title="Jogos"
                      >
                        J
                      </abbr>
                    </th>

                    <th scope="col">
                      <span className="statistics-teams__long">
                        Marcados
                      </span>

                      <abbr
                        className="statistics-teams__short"
                        title="Gols marcados"
                      >
                        GP
                      </abbr>
                    </th>

                    <th scope="col">
                      <span className="statistics-teams__long">
                        Sofridos
                      </span>

                      <abbr
                        className="statistics-teams__short"
                        title="Gols sofridos"
                      >
                        GC
                      </abbr>
                    </th>

                    <th
                      scope="col"
                      className="statistics-teams__col-average"
                    >
                      Média marcados
                    </th>

                    <th
                      scope="col"
                      className="statistics-teams__col-average"
                    >
                      Média sofridos
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {teams.map((team, index) => (
                    <tr key={team.registrationId}>
                      <td>
                        <span className="statistics-teams__position">
                          {index + 1}
                        </span>
                      </td>

                      <th
                        scope="row"
                        className="statistics-teams__col-team"
                      >
                        <strong>{team.teamName}</strong>

                        <small className="statistics-teams__mobile-average">
                          {formatDecimal(team.goalsForPerMatch)} marcados ·{' '}
                          {formatDecimal(team.goalsAgainstPerMatch)} sofridos
                          por jogo
                        </small>
                      </th>

                      <td>{team.matches}</td>

                      <td className="statistics-teams__goals statistics-teams__goals--for">
                        <strong>{team.goalsFor}</strong>

                        <span
                          className="statistics-teams__bar"
                          aria-hidden="true"
                        >
                          <i
                            style={{
                              width: `${(team.goalsFor / maxGoalsFor) * 100}%`,
                            }}
                          />
                        </span>
                      </td>

                      <td className="statistics-teams__goals statistics-teams__goals--against">
                        <strong>{team.goalsAgainst}</strong>

                        <span
                          className="statistics-teams__bar"
                          aria-hidden="true"
                        >
                          <i
                            style={{
                              width: `${(team.goalsAgainst / maxGoalsAgainst) * 100}%`,
                            }}
                          />
                        </span>
                      </td>

                      <td className="statistics-teams__col-average">
                        {formatDecimal(team.goalsForPerMatch)}
                      </td>

                      <td className="statistics-teams__col-average">
                        {formatDecimal(team.goalsAgainstPerMatch)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="statistics-teams__legend">
              As barras comparam cada equipe com a que mais marcou (verde)
              e com a que mais sofreu gols (vermelho).
            </p>
          </>
        )}
      </div>
    </section>
  )
}
