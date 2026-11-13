
import { useCallback, useMemo } from 'react'

import type { PublicMatch } from '../../../../backend/modules/public/public.types'
import { publicService } from '../../../../services/public/publicService'

import {
  PageHeading,
  PublicEmpty,
  PublicError,
  PublicLoading,
} from '../shared/PublicStates'
import { usePublicContext } from '../shared/usePublicContext'
import { usePublicResource } from '../shared/usePublicResource'

import "../../../../styles/public/MatchesPage/MatchesPage.css";

type MatchSection = {
  status: string
  title: string
  description: string
  matches: PublicMatch[]
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

function formatMatchLocation(match: PublicMatch): string {
  const location = [match.venue, match.city]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' · ')

  return location || 'Local a definir'
}

function getCompetitionDescription(match: PublicMatch): string {
  return [
    match.phase,
    match.group,
    match.round,
  ]
    .filter((value): value is string => Boolean(value))
    .join(' · ') || 'Competição'
}

function compareMatchDates(
  first: PublicMatch,
  second: PublicMatch,
  newestFirst = false,
): number {
  const firstDate = first.scheduledAt
    ? new Date(first.scheduledAt).getTime()
    : null

  const secondDate = second.scheduledAt
    ? new Date(second.scheduledAt).getTime()
    : null

  if (firstDate === null && secondDate === null) return 0
  if (firstDate === null) return 1
  if (secondDate === null) return -1

  return newestFirst
    ? secondDate - firstDate
    : firstDate - secondDate
}

function MatchCard({ match }: { match: PublicMatch }) {
  const isFinished = match.status === 'finished'
  const hasScore = isFinished || match.status === 'live'

  return (
    <article
      className={`public-match-card public-match-card--${match.status}`}
    >
      <div className="public-match-card__header">
        <span
          className={`public-match-status public-match-status--${match.status}`}
        >
          {match.status === 'live' && (
            <span className="public-match-status__indicator" />
          )}

          {match.status === 'live'
            ? 'AO VIVO'
            : match.status === 'scheduled'
              ? 'AGENDADA'
              : match.status === 'postponed'
                ? 'ADIADA'
                : 'ENCERRADA'}
        </span>

        <span className="public-match-competition">
          {getCompetitionDescription(match)}
        </span>
      </div>

      <div className="public-match-card__teams">
        <div className="public-match-team public-match-team--home">
          {match.homeCrest ? (
            <img
              src={match.homeCrest}
              alt={`Escudo do ${match.homeTeam}`}
              className="public-match-team__crest"
              loading="lazy"
            />
          ) : (
            <span
              className="public-match-team__crest public-match-team__crest--empty"
              aria-hidden="true"
            >
              {match.homeTeam.charAt(0).toUpperCase()}
            </span>
          )}

          <strong className="public-match-team__name">
            {match.homeTeam}
          </strong>

          <span className="public-match-team__role">
            Mandante
          </span>
        </div>

        <div className="public-match-score">
          {hasScore ? (
            <strong>
              {match.homeScore ?? 0}
              <span>×</span>
              {match.awayScore ?? 0}
            </strong>
          ) : (
            <strong className="public-match-score__versus">
              VS
            </strong>
          )}
        </div>

        <div className="public-match-team public-match-team--away">
          {match.awayCrest ? (
            <img
              src={match.awayCrest}
              alt={`Escudo do ${match.awayTeam}`}
              className="public-match-team__crest"
              loading="lazy"
            />
          ) : (
            <span
              className="public-match-team__crest public-match-team__crest--empty"
              aria-hidden="true"
            >
              {match.awayTeam.charAt(0).toUpperCase()}
            </span>
          )}

          <strong className="public-match-team__name">
            {match.awayTeam}
          </strong>

          <span className="public-match-team__role">
            Visitante
          </span>
        </div>
      </div>

      <div className="public-match-card__details">
        <div className="public-match-detail">
          <span className="public-match-detail__label">
            Data e horário
          </span>

          <strong>
            {formatMatchDate(match.scheduledAt)}
          </strong>
        </div>

        <div className="public-match-detail">
          <span className="public-match-detail__label">
            Local da partida
          </span>

          <strong>
            {formatMatchLocation(match)}
          </strong>
        </div>
      </div>
    </article>
  )
}

export default function MatchesPage() {
  const { seasonId } = usePublicContext()

  const loadMatches = useCallback(
    () => publicService.listMatches(seasonId),
    [seasonId],
  )

  const {
    data: matches,
    loading,
    error,
  } = usePublicResource<PublicMatch[]>(
    seasonId,
    loadMatches,
  )

  const sections = useMemo<MatchSection[]>(() => {
    if (!matches) return []

    const definitions = [
      {
        status: 'live',
        title: 'Partidas ao vivo',
        description: 'Acompanhe os confrontos em andamento.',
      },
      {
        status: 'scheduled',
        title: 'Partidas agendadas',
        description: 'Confira os próximos confrontos da temporada.',
      },
      {
        status: 'postponed',
        title: 'Partidas adiadas',
        description: 'Confrontos que aguardam nova programação.',
      },
      {
        status: 'finished',
        title: 'Partidas encerradas',
        description: 'Confira os resultados dos jogos realizados.',
      },
    ]

    return definitions
      .map((definition) => {
        const sectionMatches = matches
          .filter((match) => match.status === definition.status)
          .sort((first, second) =>
            compareMatchDates(
              first,
              second,
              definition.status === 'finished',
            ),
          )

        return {
          ...definition,
          matches: sectionMatches,
        }
      })
      .filter((section) => section.matches.length > 0)
  }, [matches])

  return (
    <div className="public-matches-page">
      <PageHeading
        title="Partidas"
        description="Calendário, confrontos e resultados oficiais."
      />

      {loading ? (
        <PublicLoading />
      ) : error ? (
        <PublicError message={error} />
      ) : sections.length > 0 ? (
        <div className="public-matches-sections">
          {sections.map((section) => (
            <section
              className={`public-match-section public-match-section--${section.status}`}
              key={section.status}
            >
              <header className="public-match-section__header">
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>

                <span className="public-match-section__count">
                  {section.matches.length}
                  {' '}
                  {section.matches.length === 1
                    ? 'partida'
                    : 'partidas'}
                </span>
              </header>

              <div className="public-match-section__list">
                {section.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <PublicEmpty message="Nenhuma partida cadastrada nesta temporada." />
      )}
    </div>
  )
}
