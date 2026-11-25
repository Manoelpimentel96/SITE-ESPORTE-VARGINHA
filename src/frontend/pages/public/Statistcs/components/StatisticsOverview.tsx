
/**
 * Aba de visão geral das estatísticas.
 *
 * Responsabilidades:
 * - Exibir os indicadores gerais da temporada.
 * - Apresentar os destaques estatísticos das equipes.
 *
 * Os dados são recebidos da página principal.
 * Este componente não realiza consultas ao backend.
 */

import type {
  PublicStatistics,
} from '../../../../../backend/modules/public/statistics/statistics.types'

import StatisticsTeams from './StatisticsTeams'

import '../../../../../styles/public/Statistics/StatisticsOverview.css'

interface StatisticsOverviewProps {
  statistics: PublicStatistics
}

export default function StatisticsOverview({
  statistics,
}: StatisticsOverviewProps) {
  const summaryCards = [
    {
      label: 'Gols marcados',
      value: statistics.goals,
    },
    {
      label: 'Partidas disputadas',
      value: statistics.matchesPlayed,
    },
    {
      label: 'Equipes participantes',
      value: statistics.teams,
    },
    {
      label: 'Jogadores inscritos',
      value: statistics.players,
    },
  ]

  return (
    <div className="statistics-overview">
      <section
        className="statistics-overview__cards"
        aria-label="Resumo geral da temporada"
      >
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="statistics-overview__card"
          >
            <span>{card.label}</span>

            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <StatisticsTeams statistics={statistics} />
    </div>
  )
}
