/**
 * Lista reutilizável de jogadores em rankings.
 *
 * Responsabilidades:
 * - Mostrar a posição do jogador (ouro, prata e bronze nas três primeiras).
 * - Identificar o jogador e sua equipe.
 * - Destacar a quantidade registrada, com uma barra que compara com o líder.
 * - Exibir mensagem quando a lista estiver vazia.
 */

import type {
  PublicStatLeader,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import { pluralize } from './statistics.utils'
import type { StatisticsTone } from './statistics.utils'

import '../../../../../styles/public/Statistics/StatisticsRankList.css'

interface StatisticsRankListProps {
  leaders: PublicStatLeader[]
  /** Unidade no plural (gols, assistências, cartões). */
  valueLabel: string
  /** Unidade no singular, usada quando o total é 1. */
  singularLabel?: string
  emptyMessage: string
  tone?: StatisticsTone
  /** Posição do primeiro item da lista (use 4 para continuar após um pódio). */
  startAt?: number
  /** Valor que representa 100% da barra. Por padrão, o maior da lista. */
  maxValue?: number
}

export default function StatisticsRankList({
  leaders,
  valueLabel,
  singularLabel,
  emptyMessage,
  tone = 'neutral',
  startAt = 1,
  maxValue,
}: StatisticsRankListProps) {
  if (!leaders.length) {
    return (
      <div className="statistics-rank-list__empty">
        {emptyMessage}
      </div>
    )
  }

  const highest = Math.max(
    maxValue ?? 0,
    ...leaders.map((leader) => leader.total),
    1,
  )

  return (
    <ol
      className={`statistics-rank-list statistics-tone--${tone}`}
    >
      {leaders.map((leader, index) => {
        const position = startAt + index

        const medal =
          position <= 3
            ? ` statistics-rank-list__position--${position}`
            : ''

        return (
          <li
            key={`${leader.playerId}-${leader.teamName}`}
            className="statistics-rank-list__item"
          >
            <span
              className={`statistics-rank-list__position${medal}`}
            >
              {position}
            </span>

            <div className="statistics-rank-list__player">
              <strong>{leader.name}</strong>

              {leader.teamName && <span>{leader.teamName}</span>}

              <div
                className="statistics-rank-list__bar"
                aria-hidden="true"
              >
                <span
                  style={{
                    width: `${(leader.total / highest) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="statistics-rank-list__value">
              <strong>{leader.total}</strong>

              <span>
                {pluralize(
                  leader.total,
                  singularLabel ?? valueLabel,
                  valueLabel,
                )}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
