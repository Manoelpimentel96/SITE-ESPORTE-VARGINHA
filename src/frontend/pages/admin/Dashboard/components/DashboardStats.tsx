import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  Users,
  UserRound,
  Trophy,
  Radio,
} from 'lucide-react'

import type { DashboardStats as DashboardStatsType } from '../../../../../backend/modules/dashboard/dashboard.types'

interface DashboardStatsProps {
  stats: DashboardStatsType
}

export default function DashboardStats({
  stats,
}: DashboardStatsProps) {
  const cards = [
    {
      label: 'Campeonatos',
      value: stats.championships,
      icon: Trophy,
    },
    {
      label: 'Temporadas',
      value: stats.seasons,
      icon: CalendarDays,
    },
    {
      label: 'Equipes',
      value: stats.teams,
      icon: Flag,
    },
    {
      label: 'Jogadores',
      value: stats.players,
      icon: Users,
    },
    {
      label: 'Partidas',
      value: stats.matches,
      icon: Radio,
    },
    {
      label: 'Finalizadas',
      value: stats.completedMatches,
      icon: CheckCircle2,
    },
    {
      label: 'Próximas',
      value: stats.upcomingMatches,
      icon: Clock3,
    },
    {
      label: 'Em andamento',
      value: stats.liveMatches,
      icon: UserRound,
    },
  ]

  return (
    <section className="dashboard-stats">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article className="dashboard-stat-card" key={card.label}>
            <div className="dashboard-stat-icon">
              <Icon size={21} />
            </div>

            <div className="dashboard-stat-content">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          </article>
        )
      })}
    </section>
  )
}
