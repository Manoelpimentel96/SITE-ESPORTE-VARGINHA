
import { useEffect, useState } from 'react'

import { publicService } from '../../../../services/public/publicService'
import type { PublicSeason } from '../../../../backend/modules/public/public.types'

import { usePublicContext } from '../shared/usePublicContext'
import {
  PageHeading,
  PublicEmpty,
  PublicError,
  PublicLoading,
} from '../shared/PublicStates'

type LoadedEditions = {
  championshipId: string
  seasons: PublicSeason[]
}

type EditionsError = {
  championshipId: string
  message: string
}

export default function PreviousEditionsPage() {
  const { championshipId } = usePublicContext()

  const [editions, setEditions] = useState<LoadedEditions | null>(null)
  const [error, setError] = useState<EditionsError | null>(null)

  const loading =
    editions?.championshipId !== championshipId &&
    error?.championshipId !== championshipId

  useEffect(() => {
    let active = true

    publicService
      .listPreviousSeasons(championshipId)
      .then((seasons) => {
        if (active) {
          setEditions({
            championshipId,
            seasons,
          })
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError({
            championshipId,
            message:
              reason instanceof Error
                ? reason.message
                : 'Falha ao carregar as edições anteriores.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [championshipId])

  const currentEditions =
    editions?.championshipId === championshipId
      ? editions.seasons
      : []

  const currentError =
    error?.championshipId === championshipId
      ? error.message
      : ''

  return (
    <>
      <PageHeading
        title="Edições anteriores"
        description="Consulte o histórico das temporadas deste campeonato."
      />

      {loading ? (
        <PublicLoading />
      ) : currentError ? (
        <PublicError message={currentError} />
      ) : currentEditions.length ? (
        <div className="public-team-grid">
          {currentEditions.map((season) => (
            <article className="public-team-card" key={season.id}>
              <span>EDIÇÃO {season.edition ?? '—'}</span>

              <h2>{season.name}</h2>

              <p>
                {season.startDate
                  ? new Date(`${season.startDate}T00:00:00`).toLocaleDateString('pt-BR')
                  : 'Início não informado'}
                {' — '}
                {season.endDate
                  ? new Date(`${season.endDate}T00:00:00`).toLocaleDateString('pt-BR')
                  : 'Término não informado'}
              </p>

              <span>
                Situação: {season.status}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <PublicEmpty message="Nenhuma edição anterior disponível para este campeonato." />
      )}
    </>
  )
}
