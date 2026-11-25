
/**
 * Componente compartilhado para assistências e cartões.
 *
 * Responsabilidades:
 * - Apresentar o título e a descrição da categoria.
 * - Exibir o ranking recebido da página principal.
 * - Mostrar uma mensagem quando não houver registros.
 */

import type {
  PublicStatLeader,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import StatisticsRankList from './StatisticsRankList'

import '../../../../../styles/public/Statistics/StatisticsCategory.css'

interface StatisticsCategoryProps {
  title: string
  description: string
  leaders: PublicStatLeader[]
  emptyMessage: string
}

export default function StatisticsCategory({
  title,
  description,
  leaders,
  emptyMessage,
}: StatisticsCategoryProps) {
  return (
    <section className="statistics-category">
      <div className="statistics-section-heading">
        <h2>{title}</h2>

        <p>{description}</p>
      </div>

      <StatisticsRankList
        leaders={leaders}
        valueLabel="registros"
        emptyMessage={emptyMessage}
      />
    </section>
  )
}
