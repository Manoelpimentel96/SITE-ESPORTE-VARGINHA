/**
 * Componente compartilhado para assistências e cartões.
 *
 * Responsabilidades:
 * - Apresentar ícone, título e descrição da categoria.
 * - Mostrar o total da categoria, mesmo quando o jogador não foi informado.
 * - Exibir o ranking recebido da página principal.
 * - Explicar, quando for o caso, por que o ranking está vazio.
 */

import type { LucideIcon } from 'lucide-react'

import type {
  PublicStatCategory,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import StatisticsRankList from './StatisticsRankList'
import StatisticsSectionHeading from './StatisticsSectionHeading'
import { pluralize } from './statistics.utils'
import type { StatisticsTone } from './statistics.utils'

import '../../../../../styles/public/Statistics/StatisticsCategory.css'

interface StatisticsCategoryProps {
  title: string
  description: string
  category: PublicStatCategory
  tone: StatisticsTone
  icon: LucideIcon
  singularLabel: string
  pluralLabel: string
  emptyMessage: string
}

export default function StatisticsCategory({
  title,
  description,
  category,
  tone,
  icon,
  singularLabel,
  pluralLabel,
  emptyMessage,
}: StatisticsCategoryProps) {
  const unit = pluralize(category.total, singularLabel, pluralLabel)

  // Há registros, mas nenhum com jogador informado.
  const withoutPlayers =
    category.total > 0 && category.leaders.length === 0

  return (
    <section
      className={`statistics-category statistics-panel statistics-tone--${tone}`}
    >
      <StatisticsSectionHeading
        title={title}
        description={description}
        icon={icon}
        tone={tone}
        aside={
          <div className="statistics-category__total">
            <strong>{category.total}</strong>

            <span>{unit} no total</span>
          </div>
        }
      />

      <StatisticsRankList
        leaders={category.leaders}
        valueLabel={pluralLabel}
        singularLabel={singularLabel}
        tone={tone}
        emptyMessage={
          withoutPlayers
            ? 'Os registros ainda não informam o jogador, por isso não há ranking.'
            : emptyMessage
        }
      />
    </section>
  )
}
