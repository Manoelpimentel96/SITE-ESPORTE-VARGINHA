
import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'

import { publicService } from '../../../../services/public/publicService'
import type { PublicTeamDetails } from '../../../../backend/modules/public/public.types'

import { usePublicContext } from '../shared/usePublicContext'
import { usePublicResource } from '../shared/usePublicResource'
import {
  PageHeading,
  PublicEmpty,
  PublicError,
  PublicLoading,
} from '../shared/PublicStates'

export default function TeamDetailsPage() {
  const { seasonId } = usePublicContext()
  const { teamId = '' } = useParams()

  const resourceKey = `${seasonId}:${teamId}`

  const loadTeamDetails = useCallback(
    () => publicService.getTeamDetails(seasonId, teamId),
    [seasonId, teamId],
  )

  const {
    data,
    loading,
    error,
  } = usePublicResource<PublicTeamDetails>(
    resourceKey,
    loadTeamDetails,
  )

  if (loading) return <PublicLoading />
  if (error) return <PublicError message={error} />

  if (!data) {
    return <PublicEmpty message="Equipe não encontrada." />
  }

  return (
    <>
      <Link className="public-back-link" to="/portal/equipes">
        ← Voltar para equipes
      </Link>

      <section className="public-team-profile">
        <div className="public-crest public-crest-large">
          {data.team.crestUrl ? (
            <img
              src={data.team.crestUrl}
              alt={`Escudo ${data.team.name}`}
            />
          ) : (
            <span>{data.team.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div>
          <span className="public-eyebrow">
            EQUIPE PARTICIPANTE
          </span>

          <h1>{data.team.name}</h1>

          <p>
            {data.team.city ?? 'Comunidade não informada'}
            {data.team.foundedYear
              ? ` · Fundada em ${data.team.foundedYear}`
              : ''}
          </p>
        </div>
      </section>

      <PageHeading
        title="Elenco"
        description="Jogadores registrados e liberados para exibição pública."
      />

      {data.players.length > 0 ? (
        <div className="public-player-grid">
          {data.players.map((player) => (
            <article
              className="public-player-card"
              key={player.id}
            >
              <div className="public-player-photo">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                  />
                ) : (
                  <span>{player.shirtNumber ?? '—'}</span>
                )}
              </div>

              <strong>{player.name}</strong>

              <small>
                {player.position ?? 'Posição não informada'}
                {player.shirtNumber
                  ? ` · Camisa ${player.shirtNumber}`
                  : ''}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <PublicEmpty message="Nenhum jogador público cadastrado para esta equipe." />
      )}

      <PageHeading
        title="Comissão técnica"
        description="Integrantes autorizados para divulgação."
      />

      {data.staff.length > 0 ? (
        <div className="public-staff-list">
          {data.staff.map((person, index) => (
            <div key={`${person.role}-${index}`}>
              <strong>{person.name}</strong>
              <span>{person.role}</span>
            </div>
          ))}
        </div>
      ) : (
        <PublicEmpty message="Nenhuma informação pública de comissão técnica." />
      )}

      <PageHeading
        title="Partidas da equipe"
        description="Confrontos desta temporada."
      />

      {data.matches.length > 0 ? (
        data.matches.map((match) => (
          <div className="public-fixture" key={match.id}>
            <span>{match.homeTeam}</span>

            <strong>
              {match.status === 'finished'
                ? `${match.homeScore} × ${match.awayScore}`
                : '×'}
            </strong>

            <span>{match.awayTeam}</span>
          </div>
        ))
      ) : (
        <PublicEmpty message="Nenhuma partida cadastrada." />
      )}
    </>
  )
}
