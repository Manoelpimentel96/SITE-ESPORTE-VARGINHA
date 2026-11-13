
import { useCallback } from 'react'

import { publicService } from '../../../../services/public/publicService'
import type { PublicStatistics } from '../../../../backend/modules/public/public.types'

import { usePublicContext } from '../shared/usePublicContext'
import { usePublicResource } from '../shared/usePublicResource'
import {
  PageHeading,
  PublicEmpty,
  PublicError,
  PublicLoading,
} from '../shared/PublicStates'

export default function StatisticsPage() {
  const { seasonId } = usePublicContext()

  const loadStatistics = useCallback(
    () => publicService.getStatistics(seasonId),
    [seasonId],
  )

  const {
    data,
    loading,
    error,
  } = usePublicResource<PublicStatistics>(
    seasonId,
    loadStatistics,
  )

  if (loading) return <PublicLoading />
  if (error) return <PublicError message={error} />

  if (!data) {
    return <PublicEmpty message="Estatísticas indisponíveis." />
  }

  return (
    <>
      <PageHeading
        title="Estatísticas"
        description="Números oficiais registrados nesta temporada."
      />

      <div className="public-stat-grid">
        <article className="public-stat-card">
          <span>Gols registrados</span>
          <strong>{data.goals}</strong>
        </article>

        <article className="public-stat-card">
          <span>Partidas finalizadas</span>
          <strong>{data.matchesPlayed}</strong>
        </article>

        <article className="public-stat-card">
          <span>Equipes</span>
          <strong>{data.teams}</strong>
        </article>

        <article className="public-stat-card">
          <span>Jogadores inscritos</span>
          <strong>{data.players}</strong>
        </article>
      </div>

      <section className="public-panel">
        <h2>Artilharia</h2>

        {data.topScorers.length > 0 ? (
          <div className="public-scorer-list">
            {data.topScorers.map((player, index) => (
              <div key={player.playerId}>
                <span>{index + 1}</span>
                <strong>{player.name}</strong>
                <small>{player.teamName}</small>
                <b>{player.goals} gols</b>
              </div>
            ))}
          </div>
        ) : (
          <PublicEmpty message="Ainda não há gols registrados por jogador." />
        )}
      </section>
    </>
  )
}
