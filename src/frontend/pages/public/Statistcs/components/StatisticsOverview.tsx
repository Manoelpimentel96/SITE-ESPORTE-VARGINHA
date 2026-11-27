/**
 * Aba de visão geral das estatísticas.
 *
 * Responsabilidades:
 * - Exibir os indicadores gerais da temporada, cada um com ícone e legenda.
 * - Apresentar os destaques e os números das equipes.
 *
 * Os dados são recebidos da página principal.
 * Este componente não realiza consultas ao backend.
 */

import {
  CalendarCheck,
  ChartNoAxesColumn,
  Gauge,
  Goal,
  Shield,
  Shirt,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type {
  PublicStatistics,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import StatisticsSectionHeading from './StatisticsSectionHeading'
import StatisticsTeams from './StatisticsTeams'
import { formatDecimal } from './statistics.utils'
import type { StatisticsTone } from './statistics.utils'

import '../../../../../styles/public/Statistics/StatisticsOverview.css'

interface StatisticsOverviewProps {
  statistics: PublicStatistics
}

interface SummaryCard {
  label: string
  value: string | number
  hint: string
  icon: LucideIcon
  tone: StatisticsTone
}

export default function StatisticsOverview({
  statistics,
}: StatisticsOverviewProps) {
  const summaryCards: SummaryCard[] = [
    {
      label: 'Partidas disputadas',
      value: statistics.matchesPlayed,
      hint: 'Jogos finalizados',
      icon: CalendarCheck,
      tone: 'neutral',
    },
    {
      label: 'Gols marcados',
      value: statistics.goals,
      hint: 'Soma dos placares',
      icon: Goal,
      tone: 'goal',
    },
    {
      label: 'Média de gols por jogo',
      value: formatDecimal(statistics.goalsPerMatch),
      hint: 'Nos jogos finalizados',
      icon: Gauge,
      tone: 'assist',
    },
    {
      label: 'Equipes participantes',
      value: statistics.teams,
      hint: 'Na temporada',
      icon: Shield,
      tone: 'neutral',
    },
    {
      label: 'Jogadores inscritos',
      value: statistics.players,
      hint: 'Na temporada',
      icon: Shirt,
      tone: 'neutral',
    },
  ]

  return (
    <div className="statistics-overview">
      <section className="statistics-overview__summary">
        <StatisticsSectionHeading
          title="Resumo da temporada"
          description="Os principais números da competição em um só lugar."
          icon={ChartNoAxesColumn}
        />

        <div
          className="statistics-overview__cards"
          role="list"
          aria-label="Resumo geral da temporada"
        >
          {summaryCards.map((card) => {
            const Icon = card.icon

            return (
              <article
                key={card.label}
                role="listitem"
                className={`statistics-overview__card statistics-tone--${card.tone}`}
              >
                <span
                  className="statistics-overview__icon"
                  aria-hidden="true"
                >
                  <Icon size={20} />
                </span>

                <strong className="statistics-overview__value">
                  {card.value}
                </strong>

                <div className="statistics-overview__text">
                  <span>{card.label}</span>

                  <small>{card.hint}</small>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <StatisticsTeams statistics={statistics} />
    </div>
  )
}
