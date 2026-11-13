
import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { publicService } from '../../../../services/public/publicService'
import type { PublicOverview } from '../../../../backend/modules/public/public.types'

import { usePublicContext } from '../shared/usePublicContext'
import { usePublicResource } from '../shared/usePublicResource'
import {
  PageHeading,
  PublicEmpty,
  PublicError,
  PublicLoading,
} from '../shared/PublicStates'

export default function OverviewPage() {
  const { seasonId } = usePublicContext()

  const loadOverview = useCallback(
    () => publicService.getOverview(seasonId),
    [seasonId],
  )

  const {
    data,
    loading,
    error,
  } = usePublicResource<PublicOverview>(
    seasonId,
    loadOverview,
  )

  if (loading) return <PublicLoading />
  if (error) return <PublicError message={error} />

  if (!data) {
    return <PublicEmpty message="Não há informações disponíveis." />
  }

  return (
    <>
      <section className="public-hero">
        <span>ESPORTE · COMUNIDADE · TRADIÇÃO</span>

        <h1>Campeonato Vila de Varginha</h1>

        <p>
          Acompanhe os números e os últimos acontecimentos da competição.
        </p>

        <Link
          to="/portal/partidas"
          className="public-primary-link"
        >
          Ver calendário de jogos
        </Link>
      </section>

      <PageHeading
        title="Visão geral"
        description="Acompanhe os números e os últimos acontecimentos do campeonato."
      />

      <section className="public-stat-grid">
        <article className="public-stat-card">
          <span>Equipes inscritas</span>
          <strong>{data.teamsCount}</strong>
          <small>Clubes participantes</small>
        </article>

        <article className="public-stat-card">
          <span>Partidas cadastradas</span>
          <strong>{data.matchesCount}</strong>
          <small>Calendário da competição</small>
        </article>

        <article className="public-stat-card">
          <span>Jogos finalizados</span>
          <strong>{data.finishedCount}</strong>
          <small>Resultados registrados</small>
        </article>

        <article className="public-stat-card">
          <span>A realizar</span>
          <strong>{data.upcomingCount}</strong>
          <small>Próximos confrontos</small>
        </article>
      </section>

      <div className="public-content-grid">
        <section className="public-panel">
          <div className="public-panel-heading">
            <div>
              <h2>Últimos resultados</h2>
              <p>Confira os jogos já disputados</p>
            </div>

            <Link to="/portal/partidas">Ver todas</Link>
          </div>

          {data.latestResults.length > 0 ? (
            data.latestResults.map((match) => (
              <div
                className="public-result-row"
                key={match.id}
              >
                <span>{match.homeTeam}</span>

                <strong>
                  {match.homeScore} × {match.awayScore}
                </strong>

                <span>{match.awayTeam}</span>
              </div>
            ))
          ) : (
            <PublicEmpty message="Nenhum resultado registrado. Os resultados aparecerão aqui depois que as partidas forem encerradas." />
          )}
        </section>

        <section className="public-panel">
          <div className="public-panel-heading">
            <div>
              <h2>Próximas partidas</h2>
              <p>Prepare-se para os próximos jogos</p>
            </div>

            <Link to="/portal/partidas">Calendário</Link>
          </div>

          {data.upcomingMatches.length > 0 ? (
            data.upcomingMatches.map((match) => (
              <div
                className="public-upcoming-row"
                key={match.id}
              >
                <time>
                  {match.scheduledAt
                    ? new Date(
                        match.scheduledAt,
                      ).toLocaleDateString('pt-BR')
                    : 'Data a definir'}
                </time>

                <div>
                  <strong>
                    {match.homeTeam} × {match.awayTeam}
                  </strong>

                  <small>
                    {match.scheduledAt
                      ? new Date(
                          match.scheduledAt,
                        ).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Horário a definir'}
                    {' · '}
                    {match.round ?? match.phase ?? 'Competição'}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <PublicEmpty message="Não há próximas partidas cadastradas." />
          )}
        </section>
      </div>

      <section className="public-panel">
        <div className="public-panel-heading">
          <div>
            <h2>Classificação do campeonato</h2>
            <p>Desempenho geral das equipes</p>
          </div>

          <Link to="/portal/classificacao">
            Tabela completa
          </Link>
        </div>

        <StandingsPreview rows={data.standings} />
      </section>
    </>
  )
}

function StandingsPreview({
  rows,
}: {
  rows: PublicOverview['standings']
}) {
  if (rows.length === 0) {
    return (
      <PublicEmpty message="A classificação será exibida quando houver equipes inscritas." />
    )
  }

  return (
    <div className="public-table-wrap">
      <table className="public-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipe</th>
            <th>PTS</th>
            <th>PJ</th>
            <th>V</th>
            <th>E</th>
            <th>D</th>
            <th>GP</th>
            <th>GC</th>
            <th>SG</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.registrationId}>
              <td>{row.position}</td>
              <td>{row.teamName}</td>
              <td>{row.points}</td>
              <td>{row.played}</td>
              <td>{row.wins}</td>
              <td>{row.draws}</td>
              <td>{row.losses}</td>
              <td>{row.goalsFor}</td>
              <td>{row.goalsAgainst}</td>
              <td>{row.goalDifference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
