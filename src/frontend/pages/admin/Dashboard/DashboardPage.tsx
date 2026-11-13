import { AlertCircle, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import '../../../../styles/admin/DashboardPage.css'

import { dashboardService } from '../../../../services/dashboard/dashboardService'

import type {
  DashboardActivity as DashboardActivityType,
  DashboardChampionship,
  DashboardData,
  DashboardSeason,
} from '../../../../backend/modules/dashboard/dashboard.types'

import DashboardActivity from './components/DashboardActivity'
import DashboardFilters from './components/DashboardFilters'
import DashboardMatches from './components/DashboardMatches'
import DashboardStats from './components/DashboardStats'

const emptyDashboard: DashboardData = {
  stats: {
    championships: 0,
    seasons: 0,
    teams: 0,
    players: 0,
    matches: 0,
    completedMatches: 0,
    upcomingMatches: 0,
    liveMatches: 0,
  },
  liveMatches: [],
  upcomingMatches: [],
  recentResults: [],
  activities: [],
}

export default function DashboardPage() {
  const [championships, setChampionships] = useState<
    DashboardChampionship[]
  >([])

  const [seasons, setSeasons] = useState<DashboardSeason[]>([])

  const [championshipId, setChampionshipId] = useState('')
  const [seasonId, setSeasonId] = useState('')

  const [dashboard, setDashboard] =
    useState<DashboardData>(emptyDashboard)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await dashboardService.getDashboard({
        championshipId,
        seasonId,
      })

      setDashboard(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o Dashboard.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [championshipId, seasonId])

  useEffect(() => {
    let active = true

    Promise.resolve().then(async () => {
      try {
        const result = await dashboardService.listChampionships()

        if (active) {
          setChampionships(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os campeonatos.',
          )
          setIsLoading(false)
        }
      }
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    Promise.resolve().then(async () => {
      try {
        const result =
          await dashboardService.listSeasons(championshipId)

        if (active) {
          setSeasons(result)
        }
      } catch (err) {
        if (active) {
          setSeasons([])
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as temporadas.',
          )
        }
      }
    })

    return () => {
      active = false
    }
  }, [championshipId])

  useEffect(() => {
    let active = true

    Promise.resolve().then(async () => {
      await loadDashboard()

      if (!active) return
    })

    return () => {
      active = false
    }
  }, [loadDashboard])

  function handleChampionshipChange(value: string) {
    setChampionshipId(value)
    setSeasonId('')
  }

  function handleSeasonChange(value: string) {
    setSeasonId(value)
  }

  return (
    <div className="admin-module-page dashboard-page">
      <AdminPageHeader
        title="Dashboard"
        description="Visão geral dos campeonatos cadastrados."
      />

      <DashboardFilters
        championships={championships}
        seasons={seasons}
        championshipId={championshipId}
        seasonId={seasonId}
        onChampionshipChange={handleChampionshipChange}
        onSeasonChange={handleSeasonChange}
      />

      {error && (
        <div className="dashboard-error">
          <AlertCircle size={19} />
          <span>{error}</span>

          <button type="button" onClick={() => void loadDashboard()}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="dashboard-section-heading">
        <div>
          <h2>Resumo geral</h2>
          <p>Indicadores do campeonato e das competições.</p>
        </div>

        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
        >
          <RefreshCw
            size={16}
            className={isLoading ? 'dashboard-spinning' : ''}
          />
          Atualizar
        </button>
      </div>

      {isLoading ? (
        <div className="dashboard-loading">
          Carregando informações do campeonato...
        </div>
      ) : (
        <>
          <DashboardStats stats={dashboard.stats} />

          <DashboardMatches
            liveMatches={dashboard.liveMatches}
            upcomingMatches={dashboard.upcomingMatches}
            recentResults={dashboard.recentResults}
          />

          <DashboardActivity
            activities={
              dashboard.activities as DashboardActivityType[]
            }
          />
        </>
      )}
    </div>
  )
}
