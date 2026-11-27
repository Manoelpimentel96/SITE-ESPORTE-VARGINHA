
/**
 * Página pública de estatísticas.
 *
 * Responsabilidades:
 * - Carregar as estatísticas da temporada.
 * - Controlar a navegação entre as abas.
 * - Exibir os estados de carregamento, erro e vazio.
 *
 * A consulta é realizada pelo publicService.
 */

import { useCallback, useState } from 'react'

import { Handshake, Square } from 'lucide-react'

import { publicService } from '../../../../services/public/publicService'

import type {
  PublicStatistics,
} from '../../../../backend/modules/public/statistics/statistics.types'

import { usePublicContext } from '../shared/usePublicContext'
import { usePublicResource } from '../shared/usePublicResource'

import StatisticsNavigation, {
  type StatisticsTab,
} from './components/StatisticsNavigation'

import StatisticsCategory from './components/StatisticsCategory'
import StatisticsOverview from './components/StatisticsOverview'
import StatisticsPlayers from './components/StatisticsPlayers'

import '../../../../styles/public/Statistics/StatisticsPage.css'

export default function StatisticsPage() {
  const { seasonId } = usePublicContext()

  const [activeTab, setActiveTab] =
    useState<StatisticsTab>('general')

  const loadStatistics = useCallback(
    () => publicService.getStatistics(seasonId),
    [seasonId],
  )

  const {
    data: statistics,
    loading,
    error,
  } = usePublicResource<PublicStatistics>(
    seasonId,
    loadStatistics,
  )

  if (loading) {
    return (
      <section className="statistics-page">
        <div className="statistics-state" role="status">
          <span className="statistics-loading-spinner" />

          <p>Carregando estatísticas...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="statistics-page">
        <div
          className="statistics-state statistics-state--error"
          role="alert"
        >
          <h2>
            Não foi possível carregar as estatísticas
          </h2>

          <p>{error}</p>
        </div>
      </section>
    )
  }

  if (!statistics) {
    return (
      <section className="statistics-page">
        <div className="statistics-state">
          <p>
            Nenhuma estatística disponível para esta
            temporada.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="statistics-page">
      <StatisticsNavigation
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="statistics-content">
        {activeTab === 'general' && (
          <StatisticsOverview
            statistics={statistics}
          />
        )}

        {activeTab === 'scorers' && (
          <StatisticsPlayers
            statistics={statistics}
          />
        )}

        {activeTab === 'assists' && (
          <StatisticsCategory
            title="Líderes em assistências"
            description="Jogadores com mais assistências na temporada."
            category={statistics.assists}
            tone="assist"
            icon={Handshake}
            singularLabel="assistência"
            pluralLabel="assistências"
            emptyMessage="Nenhuma assistência registrada."
          />
        )}

        {activeTab === 'yellow' && (
          <StatisticsCategory
            title="Cartões amarelos"
            description="Jogadores com maior número de cartões amarelos."
            category={statistics.yellowCards}
            tone="yellow"
            icon={Square}
            singularLabel="cartão"
            pluralLabel="cartões"
            emptyMessage="Nenhum cartão amarelo registrado."
          />
        )}

        {activeTab === 'red' && (
          <StatisticsCategory
            title="Cartões vermelhos"
            description="Jogadores com maior número de cartões vermelhos."
            category={statistics.redCards}
            tone="red"
            icon={Square}
            singularLabel="cartão"
            pluralLabel="cartões"
            emptyMessage="Nenhum cartão vermelho registrado."
          />
        )}
      </div>
    </section>
  )
}
