
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import { publicService } from '../../../../services/public/publicService'
import type { PublicTeam } from '../../../../backend/modules/public/public.types'

import { usePublicContext } from '../shared/usePublicContext'
import { usePublicResource } from '../shared/usePublicResource'
import {
  PageHeading,
  PublicEmpty,
  PublicError,
  PublicLoading,
} from '../shared/PublicStates'

export default function TeamsPage() {
  const { seasonId } = usePublicContext()
  const [search, setSearch] = useState('')

  const resourceKey = `${seasonId}:${search}`

  const loadTeams = useCallback(
    () => publicService.listTeams(seasonId, search),
    [seasonId, search],
  )

  const {
    data: teams,
    loading,
    error,
  } = usePublicResource<PublicTeam[]>(
    resourceKey,
    loadTeams,
  )

  return (
    <>
      <PageHeading
        title="Equipes"
        description="Conheça as equipes participantes desta temporada."
      />

      <input
        className="public-search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar equipe..."
        aria-label="Buscar equipe"
      />

      {loading ? (
        <PublicLoading />
      ) : error ? (
        <PublicError message={error} />
      ) : teams && teams.length > 0 ? (
        <div className="public-team-grid">
          {teams.map((team) => (
            <Link
              className="public-team-card"
              to={`/portal/equipes/${team.teamId}`}
              key={team.registrationId}
            >
              <div className="public-crest">
                {team.crestUrl ? (
                  <img
                    src={team.crestUrl}
                    alt={`Escudo ${team.name}`}
                  />
                ) : (
                  <span>
                    {team.shortName ??
                      team.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <h2>{team.name}</h2>

              <p>
                {team.city ?? 'Comunidade não informada'}
              </p>

              <span>Ver equipe →</span>
            </Link>
          ))}
        </div>
      ) : (
        <PublicEmpty message="Nenhuma equipe inscrita nesta temporada." />
      )}
    </>
  )
}
