/**
 * Título de seção da página de estatísticas.
 *
 * Responsabilidades:
 * - Mostrar um ícone, o título e a descrição da seção.
 * - Mostrar, opcionalmente, um destaque à direita (ex.: total da categoria).
 */

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { StatisticsTone } from './statistics.utils'

interface StatisticsSectionHeadingProps {
  title: string
  description: string
  icon?: LucideIcon
  tone?: StatisticsTone
  aside?: ReactNode
}

export default function StatisticsSectionHeading({
  title,
  description,
  icon: Icon,
  tone = 'neutral',
  aside,
}: StatisticsSectionHeadingProps) {
  return (
    <header
      className={`statistics-section-heading statistics-tone--${tone}`}
    >
      {Icon && (
        <span
          className="statistics-section-heading__icon"
          aria-hidden="true"
        >
          <Icon size={20} />
        </span>
      )}

      <div className="statistics-section-heading__text">
        <h2>{title}</h2>

        <p>{description}</p>
      </div>

      {aside && (
        <div className="statistics-section-heading__aside">
          {aside}
        </div>
      )}
    </header>
  )
}
