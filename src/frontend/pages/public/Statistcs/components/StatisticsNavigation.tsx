
/**
 * Navegação horizontal das estatísticas.
 *
 * Responsabilidades:
 * - Exibir as categorias disponíveis.
 * - Identificar visualmente a aba selecionada.
 * - Informar à página principal quando a aba mudar.
 */

import {
  ChartNoAxesColumn,
  Goal,
  Handshake,
  Square,
  SquareX,
} from 'lucide-react'

import '../../../../../styles/public/Statistics/StatisticsNavigation.css'

export type StatisticsTab =
  | 'general'
  | 'scorers'
  | 'assists'
  | 'yellow'
  | 'red'

interface StatisticsNavigationProps {
  activeTab: StatisticsTab
  onChange: (tab: StatisticsTab) => void
}

const tabs = [
  {
    id: 'general',
    label: 'Geral',
    icon: ChartNoAxesColumn,
  },
  {
    id: 'scorers',
    label: 'Gols e artilharia',
    icon: Goal,
  },
  {
    id: 'assists',
    label: 'Assistências',
    icon: Handshake,
  },
  {
    id: 'yellow',
    label: 'Cartões amarelos',
    icon: Square,
  },
  {
    id: 'red',
    label: 'Cartões vermelhos',
    icon: SquareX,
  },
] as const

export default function StatisticsNavigation({
  activeTab,
  onChange,
}: StatisticsNavigationProps) {
  return (
    <nav
      className="statistics-navigation"
      aria-label="Categorias de estatísticas"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            className={`statistics-navigation__item ${
              isActive
                ? 'statistics-navigation__item--active'
                : ''
            }`}
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
          >
            <Icon size={18} aria-hidden="true" />

            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
