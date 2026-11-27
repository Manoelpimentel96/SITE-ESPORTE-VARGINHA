
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  PublicMatch,
  PublicStanding,
} from '../../../../backend/modules/public/public.types'
import { publicService } from '../../../../services/public/publicService'

import {
  PageHeading,
  PublicEmpty,
  PublicError,
  PublicLoading,
} from '../shared/PublicStates'
import { usePublicContext } from '../shared/usePublicContext'
import { usePublicResource } from '../shared/usePublicResource'

import "../../../../styles/Standings/StandingsPage.css"

function compareHierarchy(
  first: PublicMatch,
  second: PublicMatch,
): number {
  const firstHierarchy = [
    first.phase,
    first.group,
    first.round,
  ]

  const secondHierarchy = [
    second.phase,
    second.group,
    second.round,
  ]

  for (let index = 0; index < firstHierarchy.length; index += 1) {
    const firstValue = firstHierarchy[index] ?? ''
    const secondValue = secondHierarchy[index] ?? ''

    const comparison = firstValue.localeCompare(
      secondValue,
      'pt-BR',
      { numeric: true, sensitivity: 'base' },
    )

    if (comparison !== 0) {
      return comparison
    }
  }

  const firstDate = first.scheduledAt
    ? new Date(first.scheduledAt).getTime()
    : null

  const secondDate = second.scheduledAt
    ? new Date(second.scheduledAt).getTime()
    : null

  if (firstDate === null && secondDate === null) return 0
  if (firstDate === null) return 1
  if (secondDate === null) return -1

  return firstDate - secondDate
}

function formatMatchDate(date: string | null): string {
  if (!date) return 'Data a definir'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data a definir'
  }

  return parsedDate.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getMatchStatusLabel(status: PublicMatch['status']): string {
  switch (status) {
    case 'live':
      return 'AO VIVO'
    case 'scheduled':
      return 'AGENDADA'
    case 'postponed':
      return 'ADIADA'
    case 'finished':
      return 'ENCERRADA'
    default:
      return status
  }
}

function MatchCarouselCard({ match }: { match: PublicMatch }) {
  const hasScore =
    match.status === 'live' ||
    match.status === 'finished'

  return (
    <article
      className={`standings-match-card standings-match-card--${match.status}`}
    >
      <div className="standings-match-card__header">
        <span className="standings-match-card__status">
          {match.status === 'live' && (
            <span className="standings-match-card__live-indicator" />
          )}

          {getMatchStatusLabel(match.status)}
        </span>

        <span className="standings-match-card__hierarchy">
          {[match.phase, match.group, match.round]
            .filter((value): value is string => Boolean(value))
            .join(' · ') || 'Competição'}
        </span>
      </div>

      <div className="standings-match-card__teams">
        <div className="standings-match-card__team">
          {match.homeCrest ? (
            <img
              src={match.homeCrest}
              alt={`Escudo do ${match.homeTeam}`}
              loading="lazy"
            />
          ) : (
            <span className="standings-match-card__crest-empty">
              {match.homeTeam.charAt(0).toUpperCase()}
            </span>
          )}

          <strong>{match.homeTeam}</strong>
        </div>

        <div className="standings-match-card__score">
          {hasScore ? (
            <strong>
              {match.homeScore ?? 0}
              <span>×</span>
              {match.awayScore ?? 0}
            </strong>
          ) : (
            <strong className="standings-match-card__versus">
              VS
            </strong>
          )}
        </div>

        <div className="standings-match-card__team">
          {match.awayCrest ? (
            <img
              src={match.awayCrest}
              alt={`Escudo do ${match.awayTeam}`}
              loading="lazy"
            />
          ) : (
            <span className="standings-match-card__crest-empty">
              {match.awayTeam.charAt(0).toUpperCase()}
            </span>
          )}

          <strong>{match.awayTeam}</strong>
        </div>
      </div>

      <div className="standings-match-card__footer">
        <span>{formatMatchDate(match.scheduledAt)}</span>

        <span>
          {[match.venue, match.city]
            .filter((value): value is string => Boolean(value?.trim()))
            .join(' · ') || 'Local a definir'}
        </span>
      </div>
    </article>
  )
}

type MatchCarouselProps = {
  matches: PublicMatch[]
}

function MatchCarousel({ matches }: MatchCarouselProps) {
  const orderedMatches = useMemo(
    () => [...matches].sort(compareHierarchy),
    [matches],
  )

  if (orderedMatches.length === 0) {
    return (
      <section className="standings-match-carousel">
        <header className="standings-match-carousel__heading">
          <p>Todos os confrontos cadastrados.</p>
        </header>

        <PublicEmpty message="Nenhuma partida cadastrada nesta temporada." />
      </section>
    )
  }

  return (
    <section className="standings-match-carousel">
      <header className="standings-match-carousel__heading">
        <div>
          <p>
            Confrontos organizados por fase, grupo e rodada.
          </p>
        </div>

        <span className="standings-match-carousel__count">
          {orderedMatches.length}{' '}
          {orderedMatches.length === 1 ? 'partida' : 'partidas'}
        </span>
      </header>

      <div className="standings-match-carousel__viewport">
        <div className="standings-match-carousel__track">
          {[...orderedMatches, ...orderedMatches].map(
            (match, index) => (
              <MatchCarouselCard
                key={`${match.id}-${index}`}
                match={match}
              />
            ),
          )}
        </div>
      </div>
    </section>
  )
}

type LoadedStandings = {
  seasonId: string
  rows: PublicStanding[]
}

type StandingsError = {
  seasonId: string
  message: string
}

const REFRESH_INTERVAL = 5000

export default function StandingsPage() {
  const { seasonId } = usePublicContext()

  const [standings, setStandings] = useState<LoadedStandings | null>(null)
  const [error, setError] = useState<StandingsError | null>(null)

  const loadMatches = useCallback(
    () => publicService.listMatches(seasonId),
    [seasonId],
  )

  const {
    data: matches,
    loading: matchesLoading,
    error: matchesError,
  } = usePublicResource<PublicMatch[]>(
    seasonId,
    loadMatches,
  )

  const loading =
    standings?.seasonId !== seasonId &&
    error?.seasonId !== seasonId

  useEffect(() => {
    let active = true
    let timeout: ReturnType<typeof setTimeout> | undefined

    async function loadStandings() {
      try {
        const rows = await publicService.getStandings(seasonId)

        if (!active) return

        setStandings((previous) => {
          if (
            previous?.seasonId === seasonId &&
            JSON.stringify(previous.rows) === JSON.stringify(rows)
          ) {
            return previous
          }

          return {
            seasonId,
            rows,
          }
        })

        setError(null)
      } catch (reason: unknown) {
        if (!active) return

        setError({
          seasonId,
          message:
            reason instanceof Error
              ? reason.message
              : 'Falha ao atualizar a classificação.',
        })
      } finally {
        if (active) {
          timeout = setTimeout(() => {
            void loadStandings()
          }, REFRESH_INTERVAL)
        }
      }
    }

    void loadStandings()

    return () => {
      active = false

      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [seasonId])

  const currentStandings =
    standings?.seasonId === seasonId ? standings.rows : []

  const currentError =
    error?.seasonId === seasonId ? error.message : ''

  return (
    <>
      <PageHeading
        title="Classificação"
        description="Acompanhe o desempenho das equipes nesta temporada."
      />

      {currentStandings.length > 0 ? (
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
              {currentStandings.map((team) => (
                <tr key={team.registrationId}>
                  <td>{team.position}</td>

                  <td>
                    <div className="public-player-name">
                      {team.crestUrl && (
                        <img
                          src={team.crestUrl}
                          alt=""
                          className="public-player-photo"
                        />
                      )}

                      <strong>{team.teamName}</strong>
                    </div>
                  </td>

                  <td>
                    <strong>{team.points}</strong>
                  </td>

                  <td>{team.played}</td>
                  <td>{team.wins}</td>
                  <td>{team.draws}</td>
                  <td>{team.losses}</td>
                  <td>{team.goalsFor}</td>
                  <td>{team.goalsAgainst}</td>
                  <td>{team.goalDifference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : loading ? (
        <PublicLoading />
      ) : currentError ? (
        <PublicError message={currentError} />
      ) : (
        <PublicEmpty message="A classificação ainda não possui equipes ou resultados disponíveis." />
      )}

      <div className="standings-match-carousel-area">
        {matchesLoading ? (
          <PublicLoading />
        ) : matchesError ? (
          <PublicError message={matchesError} />
        ) : (
          <MatchCarousel matches={matches ?? []} />
        )}
      </div>
    </>
  )
}
