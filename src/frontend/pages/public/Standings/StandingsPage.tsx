
import { useEffect, useState } from 'react'

import { publicService } from '../../../../services/public/publicService'
import type { PublicStanding } from '../../../../backend/modules/public/public.types'

import { usePublicContext } from '../shared/usePublicContext'
import {
  PageHeading,
  PublicEmpty,
  PublicError,
  PublicLoading,
} from '../shared/PublicStates'

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

  const loading =
    standings?.seasonId !== seasonId &&
    error?.seasonId !== seasonId

  useEffect(() => {
    let active = true
    let timeout: ReturnType<typeof setTimeout> | undefined

    async function loadStandings() {
      try {
        // Cada consulta busca novamente os dados do banco.
        const rows = await publicService.getStandings(seasonId)

        if (!active) return

        // Só atualiza o estado quando os dados realmente mudarem.
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
        // Aguarda a consulta terminar antes de iniciar a próxima.
        // Assim, não existem consultas sobrepostas.
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
    </>
  )
}
