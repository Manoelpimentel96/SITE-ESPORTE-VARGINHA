
/**
 * Lista reutilizável de jogadores em rankings.
 *
 * Responsabilidades:
 * - Mostrar a posição do jogador.
 * - Identificar o jogador e sua equipe.
 * - Destacar a quantidade registrada.
 * - Exibir mensagem quando a lista estiver vazia.
 */

import type {
  PublicStatLeader,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import '../../../../../styles/public/Statistics/StatisticsRankList.css'

interface StatisticsRankListProps {
  leaders: PublicStatLeader[]
  valueLabel: string
  emptyMessage: string
}

export default function StatisticsRankList({
  leaders,
  valueLabel,
  emptyMessage,
}: StatisticsRankListProps) {
  if (!leaders.length) {
    return (
      <div className="statistics-rank-list__empty">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="statistics-rank-list">
      {leaders.map((leader, index) => (
        <article
          key={`${leader.playerId}-${leader.teamName}`}
          className="statistics-rank-list__item"
        >
          <span className="statistics-rank-list__position">
            {index + 1}
          </span>

          <div className="statistics-rank-list__player">
            <strong>{leader.name}</strong>

            <span>{leader.teamName}</span>
          </div>

          <div className="statistics-rank-list__value">
            <strong>{leader.total}</strong>

            <span>{valueLabel}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
