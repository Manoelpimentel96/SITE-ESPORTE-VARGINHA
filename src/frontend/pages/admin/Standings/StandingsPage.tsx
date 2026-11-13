
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import StandingsFilters from './components/StandingsFilters'
import StandingsTable from './components/StandingsTable'

import {
  getStandings,
  listStandingsChampionships,
  listStandingsGroups,
  listStandingsPhases,
  listStandingsSeasons,
  subscribeToStandings,
} from '../../../../services/standings/standingsService'

import type {
  StandingsChampionshipOption,
  StandingsGroupOption,
  StandingsMode,
  StandingsPhaseOption,
  StandingsRow,
  StandingsSeasonOption,
} from '../../../../backend/modules/standings/standings.types'

import '../../../../styles/admin/StandingsPage.css'

export default function StandingsPage() {
  const [championships, setChampionships] = useState<StandingsChampionshipOption[]>([])
  const [seasons, setSeasons] = useState<StandingsSeasonOption[]>([])
  const [phases, setPhases] = useState<StandingsPhaseOption[]>([])
  const [groups, setGroups] = useState<StandingsGroupOption[]>([])
  const [rows, setRows] = useState<StandingsRow[]>([])

  const [championshipId, setChampionshipId] = useState('')
  const [seasonId, setSeasonId] = useState('')
  const [phaseId, setPhaseId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [mode, setMode] = useState<StandingsMode>('official')

  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [error, setError] = useState('')

  const loadStandings = useCallback(async () => {
    if (!championshipId || !seasonId) {
      setRows([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await getStandings({
        championshipId,
        seasonId,
        phaseId: phaseId || undefined,
        groupId: groupId || undefined,
        mode,
      })

      setRows(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a classificação.',
      )
    } finally {
      setLoading(false)
    }
  }, [championshipId, seasonId, phaseId, groupId, mode])

  // Carrega os campeonatos disponíveis.
  useEffect(() => {
    let active = true

    async function loadChampionships() {
      setLoadingOptions(true)

      try {
        const result = await listStandingsChampionships()

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
        }
      } finally {
        if (active) {
          setLoadingOptions(false)
        }
      }
    }

    void loadChampionships()

    return () => {
      active = false
    }
  }, [])

  // Carrega as temporadas do campeonato selecionado.
  useEffect(() => {
    if (!championshipId) return

    let active = true

    async function loadSeasons() {
      setLoadingOptions(true)

      try {
        const result = await listStandingsSeasons(championshipId)

        if (active) {
          setSeasons(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar temporadas.',
          )
        }
      } finally {
        if (active) {
          setLoadingOptions(false)
        }
      }
    }

    void loadSeasons()

    return () => {
      active = false
    }
  }, [championshipId])

  // Carrega as fases da temporada selecionada.
  useEffect(() => {
    if (!seasonId) return

    let active = true

    async function loadPhases() {
      setLoadingOptions(true)

      try {
        const result = await listStandingsPhases(seasonId)

        if (active) {
          setPhases(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar fases.',
          )
        }
      } finally {
        if (active) {
          setLoadingOptions(false)
        }
      }
    }

    void loadPhases()

    return () => {
      active = false
    }
  }, [seasonId])

  // Carrega os grupos da fase selecionada.
  useEffect(() => {
    if (!phaseId) return

    let active = true

    async function loadGroups() {
      try {
        const result = await listStandingsGroups(phaseId)

        if (active) {
          setGroups(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar grupos.',
          )
        }
      }
    }

    void loadGroups()

    return () => {
      active = false
    }
  }, [phaseId])

  // Carrega a classificação quando os filtros mudam.
  useEffect(() => {
    let active = true

    if (!championshipId || !seasonId) {
      Promise.resolve().then(() => {
        if (active) {
          setRows([])
          setLoading(false)
        }
      })

      return () => {
        active = false
      }
    }

    async function load() {
      setLoading(true)
      setError('')

      try {
        const result = await getStandings({
          championshipId,
          seasonId,
          phaseId: phaseId || undefined,
          groupId: groupId || undefined,
          mode,
        })

        if (active) {
          setRows(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar a classificação.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [championshipId, seasonId, phaseId, groupId, mode])

  // Atualiza a classificação quando houver alterações nos dados.
  useEffect(() => {
    if (!seasonId) return

    const unsubscribe = subscribeToStandings(seasonId, () => {
      void loadStandings()
    })

    return unsubscribe
  }, [seasonId, loadStandings])

  function handleChampionshipChange(value: string) {
    setChampionshipId(value)
    setSeasonId('')
    setPhaseId('')
    setGroupId('')

    setSeasons([])
    setPhases([])
    setGroups([])
    setRows([])
    setError('')
  }

  function handleSeasonChange(value: string) {
    setSeasonId(value)
    setPhaseId('')
    setGroupId('')

    setPhases([])
    setGroups([])
    setRows([])
    setError('')
  }

  function handlePhaseChange(value: string) {
    setPhaseId(value)
    setGroupId('')

    setGroups([])
  }

  return (
    <div className="admin-module-page standings-page">
      <AdminPageHeader
        title="Classificação"
        description="Classificação e desempenho das equipes na temporada."
      />

      <StandingsFilters
        championships={championships}
        seasons={seasons}
        phases={phases}
        groups={groups}
        championshipId={championshipId}
        seasonId={seasonId}
        phaseId={phaseId}
        groupId={groupId}
        mode={mode}
        loading={loadingOptions}
        onChampionshipChange={handleChampionshipChange}
        onSeasonChange={handleSeasonChange}
        onPhaseChange={handlePhaseChange}
        onGroupChange={setGroupId}
        onModeChange={setMode}
      />

      <div className="standings-toolbar">
        <div>
          <span className="standings-live-indicator" />
          <span>
            {mode === 'official'
              ? 'Classificação oficial'
              : 'Classificação provisória'}
          </span>
          <small>Atualização automática</small>
        </div>

        <button
          type="button"
          className="standings-refresh-button"
          onClick={() => void loadStandings()}
          disabled={loading || !seasonId}
        >
          <RefreshCw
            size={16}
            className={loading ? 'is-spinning' : ''}
          />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="standings-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!championshipId || !seasonId ? (
        <div className="standings-feedback">
          Selecione um campeonato e uma temporada para visualizar a classificação.
        </div>
      ) : (
        <StandingsTable rows={rows} loading={loading} />
      )}

      <div className="standings-legend">
        <span>PJ: partidas jogadas</span>
        <span>GP: gols pró</span>
        <span>GC: gols contra</span>
        <span>SG: saldo de gols</span>
        <span>PTS: pontos</span>
        <span>CA: cartões amarelos</span>
        <span>CV: cartões vermelhos</span>
      </div>
    </div>
  )
}
