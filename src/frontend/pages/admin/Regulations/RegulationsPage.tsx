import { AlertCircle, CheckCircle2, RefreshCw, Save, Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Regulation, RegulationFormData } from '../../../../services/regulations/regulationService'

import {
  getRegulationBySeasonId,
  publishRegulation,
  saveRegulation,
  validateRegulation,
} from '../../../../services/regulations/regulationService'

import { listChampionships } from '../../../../services/championships/championshipService'
import { listSeasons } from '../../../../services/seasons/seasonService'

import RegulationForm from './components/RegulationForm'

import '../../../../styles/admin/RegulationsPage.css'

type ChampionshipList = Awaited<ReturnType<typeof listChampionships>>
type SeasonList = Awaited<ReturnType<typeof listSeasons>>

function initialForm(seasonId: string): RegulationFormData {
  const tieBreakers: RegulationFormData['tieBreakers'] = [
    'wins',
    'goal_difference',
    'goals_for',
    'head_to_head',
  ]

  return {
    seasonId,
    status: 'draft',
    format: 'league_home_away',
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    tieBreakers,

    groupSettings: {
      groupCount: 2,
      teamsPerGroup: null,
      matchesPerPairing: 'single',
      qualifiedPerGroup: 2,
      bestThirdPlaceCount: 0,
      distribution: 'balanced',
    },

    classificationSettings: {
      totalQualified: null,
      orderBy: tieBreakers,
      headToHeadMiniTable: true,
    },

    knockoutSettings: {
      firstRound: 'Quartas de final',
      legs: 'single',
      aggregateEnabled: false,
      awayGoalsRule: false,
      extraTimeEnabled: false,
      penaltyShootoutEnabled: true,
      finalSingleMatch: true,
    },

    matchSettings: {
      legs: 'home_away',
      homeAdvantage: true,
      matchDurationMinutes: 90,
      halfDurationMinutes: 45,
      intervalMinutes: 15,
      allowSameDayMatches: false,
      minimumRestHours: 48,
    },

    phases: [
      {
        key: 'fase_inicial',
        name: 'Fase inicial',
        type: 'league',
        order: 1,
        legs: 'home_away',
      },
    ],

    disciplineSettings: {
      yellowCardSuspensionAfter: 3,
      yellowCardsResetAtStage: false,
      yellowCardsResetAtKnockout: true,
      redCardAutomaticSuspension: true,
      redCardSuspensionMatches: 1,
      disciplinaryReview: true,
      notes: '',
    },

    substitutionSettings: {
      limit: 5,
      windows: 3,
      halftimeDoesNotCountAsWindow: true,
      specialRules: '',
    },

    generalSettings: {
      participationRequirements: '',
      administrativeProcedures: '',
      additionalProvisions: '',
      officialText: '',
    },
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação.'
}

export default function RegulationsPage() {
  const [championships, setChampionships] = useState<ChampionshipList>([])
  const [seasons, setSeasons] = useState<SeasonList>([])

  const [championshipId, setChampionshipId] = useState('')
  const [seasonId, setSeasonId] = useState('')

  const [form, setForm] = useState<RegulationFormData | null>(null)
  const [regulation, setRegulation] = useState<Regulation | null>(null)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const selectedSeason = useMemo(
    () => seasons.find((season) => season.id === seasonId),
    [seasons, seasonId],
  )

  const loadChampionships = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await listChampionships()
      setChampionships(result)
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(loadChampionships)
  }, [loadChampionships])

  useEffect(() => {
    if (!championshipId) return

    let active = true

    void Promise.resolve().then(async () => {
      setLoading(true)
      setError('')

      try {
        const result = await listSeasons({ championshipId })

        if (active) {
          setSeasons(result)
        }
      } catch (cause) {
        if (active) setError(getErrorMessage(cause))
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [championshipId])

  useEffect(() => {
    if (!seasonId) return

    let active = true

    void Promise.resolve().then(async () => {
      setLoading(true)
      setError('')

      try {
        const result = await getRegulationBySeasonId(seasonId)

        if (!active) return

        if (result) {
          setRegulation(result)
          setForm(result)
        } else {
          setRegulation(null)
          setForm(initialForm(seasonId))
        }
      } catch (cause) {
        if (active) {
          setError(getErrorMessage(cause))
          setRegulation(null)
          setForm(initialForm(seasonId))
        }
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [seasonId])

  function handleChampionshipChange(value: string) {
    setChampionshipId(value)
    setSeasonId('')
    setSeasons([])
    setRegulation(null)
    setForm(null)
    setError('')
    setMessage('')
    setLoading(Boolean(value))
  }

  function handleSeasonChange(value: string) {
    setSeasonId(value)
    setRegulation(null)
    setForm(value ? initialForm(value) : null)
    setError('')
    setMessage('')
    setLoading(Boolean(value))
  }

  async function handleValidate() {
    if (!form || !seasonId) return

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await validateRegulation({
        ...form,
        seasonId,
      })

      setMessage('Os dados foram encaminhados e o backend confirmou a validação.')
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSave() {
    if (!form || !seasonId) return

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const saved = await saveRegulation(
        {
          ...form,
          seasonId,
        },
        regulation?.id,
      )

      setRegulation(saved)
      setForm(saved)
      setMessage('Regulamento salvo com sucesso.')
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish() {
    if (!form || !seasonId) return

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const saved = await saveRegulation(
        {
          ...form,
          seasonId,
        },
        regulation?.id,
      )

      const published = await publishRegulation(saved.id)

      setRegulation(published)
      setForm(published)
      setMessage('Regulamento publicado com sucesso.')
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="regulations-page">
      <header className="page-header">
        <div>
          <h1>Regulamentos</h1>
          <p>Cadastro e gerenciamento dos regulamentos das temporadas.</p>
        </div>

        <button
          type="button"
          onClick={loadChampionships}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </header>

      {error && (
        <div className="regulation-message error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div className="regulation-message success">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <section className="regulation-selection">
        <label>
          Campeonato
          <select
            value={championshipId}
            onChange={(event) => handleChampionshipChange(event.target.value)}
          >
            <option value="">Selecione um campeonato</option>

            {championships.map((championship) => (
              <option key={championship.id} value={championship.id}>
                {championship.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Temporada
          <select
            value={seasonId}
            onChange={(event) => handleSeasonChange(event.target.value)}
            disabled={!championshipId || seasons.length === 0}
          >
            <option value="">Selecione uma temporada</option>

            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {loading && (
        <p className="regulation-loading">Carregando informações...</p>
      )}

      {selectedSeason && form && (
        <>
          <div className="selected-season">
            <h2>{selectedSeason.name}</h2>
            <p>
              Situação do regulamento:{' '}
              {regulation?.status === 'published' ? 'Publicado' : 'Rascunho'}
            </p>
          </div>

          <RegulationForm
            form={form}
            onChange={setForm}
          />

          <footer className="regulation-actions">
            <button
              type="button"
              onClick={handleValidate}
              disabled={submitting}
            >
              <CheckCircle2 size={17} />
              Validar informações
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
            >
              <Save size={17} />
              Salvar regulamento
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={submitting || regulation?.status === 'published'}
            >
              <Send size={17} />
              Publicar regulamento
            </button>
          </footer>
        </>
      )}
    </main>
  )
}
