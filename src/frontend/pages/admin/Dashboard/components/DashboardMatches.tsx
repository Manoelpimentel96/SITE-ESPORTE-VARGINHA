import { CalendarDays, MapPin } from 'lucide-react'

import type { DashboardMatch } from '../../../../../backend/modules/dashboard/dashboard.types'

interface DashboardMatchesProps {
  liveMatches: DashboardMatch[]
  upcomingMatches: DashboardMatch[]
  recentResults: DashboardMatch[]
}

function formatDate(value: string | null): string {
  if (!value) return 'Data não informada'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function MatchCard({
  match,
  showScore = false,
  live = false,
}: {
  match: DashboardMatch
  showScore?: boolean
  live?: boolean
}) {
  return (
    <article className="dashboard-match-card">
      <div className="dashboard-match-top">
        <span className="dashboard-match-date">
          <CalendarDays size={14} />
          {formatDate(match.scheduledAt)}
        </span>

        {live && (
          <span className="dashboard-live-indicator">
            EM ANDAMENTO
          </span>
        )}
      </div>

      <div className="dashboard-match-teams">
        <strong>{match.homeTeam}</strong>

        {showScore ? (
          <span className="dashboard-match-score">
            {match.homeScore ?? 0} x {match.awayScore ?? 0}
          </span>
        ) : (
          <span className="dashboard-match-versus">VS</span>
        )}

        <strong>{match.awayTeam}</strong>
      </div>

      {match.city && (
        <div className="dashboard-match-location">
          <MapPin size={14} />
          {match.city}
        </div>
      )}
    </article>
  )
}

function EmptyMatches({ message }: { message: string }) {
  return (
    <div className="dashboard-empty">
      {message}
    </div>
  )
}

export default function DashboardMatches({
  liveMatches,
  upcomingMatches,
  recentResults,
}: DashboardMatchesProps) {
  return (
    <section className="dashboard-match-sections">
      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <h2>Partidas em andamento</h2>
            <p>Acompanhe os jogos que estão acontecendo.</p>
          </div>
        </div>

        <div className="dashboard-match-list">
          {liveMatches.length > 0 ? (
            liveMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                showScore
                live
              />
            ))
          ) : (
            <EmptyMatches message="Nenhuma partida em andamento." />
          )}
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <h2>Próximas partidas</h2>
            <p>Jogos programados para a temporada.</p>
          </div>
        </div>

        <div className="dashboard-match-list">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <EmptyMatches message="Nenhuma próxima partida encontrada." />
          )}
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <h2>Últimos resultados</h2>
            <p>Resultados das partidas finalizadas.</p>
          </div>
        </div>

        <div className="dashboard-match-list">
          {recentResults.length > 0 ? (
            recentResults.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                showScore
              />
            ))
          ) : (
            <EmptyMatches message="Nenhum resultado registrado." />
          )}
        </div>
      </div>
    </section>
  )
}
