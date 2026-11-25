
import { useEffect, useState } from 'react'

import type { PublicPlayer } from '../../../../backend/modules/public/public.types'
import { publicService } from '../../../../services/public/publicService'

import {
    PageHeading,
    PublicEmpty,
    PublicError,
    PublicLoading,
} from '../shared/PublicStates'
import { usePublicContext } from '../shared/usePublicContext'

type LoadedPlayers = {
  key: string
  rows: PublicPlayer[]
}

type PlayersError = {
  key: string
  message: string
}

function formatPlayerPosition(position: string | null): string {
  const positions: Record<string, string> = {
    goalkeeper: 'Goleiro',
    defender: 'Defensor',
    midfielder: 'Meio-campista',
    forward: 'Atacante',
    other: 'Outro',
  }

  if (!position) return 'Não informada'

  return positions[position] ?? position
}

export default function PlayersPage() {
  const { seasonId } = usePublicContext()

  const [players, setPlayers] = useState<LoadedPlayers | null>(null)
  const [error, setError] = useState<PlayersError | null>(null)
  const [search, setSearch] = useState('')

  const requestKey = `${seasonId}:${search.trim()}`
  const loading = players?.key !== requestKey && error?.key !== requestKey

  useEffect(() => {
    let active = true

    publicService
      .listPlayers(seasonId, search)
      .then((rows) => {
        if (active) {
          setPlayers({
            key: requestKey,
            rows,
          })
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError({
            key: requestKey,
            message:
              reason instanceof Error
                ? reason.message
                : 'Falha ao carregar jogadores.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [seasonId, search, requestKey])

  const currentPlayers =
    players?.key === requestKey ? players.rows : []

  const currentError =
    error?.key === requestKey ? error.message : ''

  return (
    <>
      <PageHeading
        title="Jogadores"
        description="Consulte os atletas inscritos nesta temporada."
      />

      <input
        className="public-search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar jogador..."
        aria-label="Buscar jogador"
      />

      {loading ? (
        <PublicLoading />
      ) : currentError ? (
        <PublicError message={currentError} />
      ) : currentPlayers.length ? (
        <div className="public-table-wrap">
          <table className="public-table">
            <thead>
              <tr>
                <th>Jogador</th>
                <th>Equipe</th>
                <th>Posição</th>
                <th>Camisa</th>
              </tr>
            </thead>

            <tbody>
              {currentPlayers.map((player) => (
                <tr key={`${player.registrationId}-${player.id}`}>
                  <td>
                    <div className="public-player-name">
                      {player.photoUrl && (
                        <img
                          src={player.photoUrl}
                          alt=""
                          className="public-player-photo"
                        />
                      )}

                      <strong>{player.name}</strong>
                    </div>
                  </td>

                  <td>{player.teamName}</td>
                  <td>{formatPlayerPosition(player.position)}</td>
                  <td>{player.shirtNumber ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <PublicEmpty message="Nenhum jogador encontrado nesta temporada." />
      )}
    </>
  )
}
