/**
 * Navegação horizontal das estatísticas.
 *
 * Responsabilidades:
 * - Exibir as categorias disponíveis, cada uma com ícone e cor próprios.
 * - Identificar visualmente a aba selecionada.
 * - Informar à página principal quando a aba mudar.
 * - No celular, manter a aba ativa visível dentro do menu rolável.
 */

import { useEffect, useRef } from 'react'

import {
  ChartNoAxesColumn,
  Goal,
  Handshake,
  Square,
} from 'lucide-react'

import type { StatisticsTone } from './statistics.utils'

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
    tone: 'neutral',
    isCard: false,
  },
  {
    id: 'scorers',
    label: 'Gols e artilharia',
    icon: Goal,
    tone: 'goal',
    isCard: false,
  },
  {
    id: 'assists',
    label: 'Assistências',
    icon: Handshake,
    tone: 'assist',
    isCard: false,
  },
  {
    id: 'yellow',
    label: 'Cartões amarelos',
    icon: Square,
    tone: 'yellow',
    isCard: true,
  },
  {
    id: 'red',
    label: 'Cartões vermelhos',
    icon: Square,
    tone: 'red',
    isCard: true,
  },
] as const satisfies ReadonlyArray<{
  id: StatisticsTab
  label: string
  icon: typeof Square
  tone: StatisticsTone
  isCard: boolean
}>

export default function StatisticsNavigation({
  activeTab,
  onChange,
}: StatisticsNavigationProps) {
  const navigationRef = useRef<HTMLElement | null>(null)

  /**
   * Centraliza a aba ativa dentro do próprio menu.
   * Rola só o menu (nunca a página inteira) e respeita a preferência
   * do sistema por menos animação.
   */
  useEffect(() => {
    const navigation = navigationRef.current

    const active = navigation?.querySelector<HTMLElement>(
      '[aria-pressed="true"]',
    )

    if (!navigation || !active) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    navigation.scrollTo({
      left:
        active.offsetLeft -
        (navigation.clientWidth - active.clientWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [activeTab])

  return (
    <nav
      ref={navigationRef}
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
            className={`statistics-navigation__item statistics-tone--${tab.tone} ${
              isActive
                ? 'statistics-navigation__item--active'
                : ''
            }`}
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
          >
            <Icon
              size={18}
              aria-hidden="true"
              className={
                tab.isCard
                  ? 'statistics-navigation__icon--card'
                  : undefined
              }
            />

            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
