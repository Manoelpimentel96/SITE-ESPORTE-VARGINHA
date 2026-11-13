import { AlertCircle, Plus, RefreshCw, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import TitleForm from './components/TitleForm'
import TitlesFilters from './components/TitlesFilters'
import TitlesList from './components/TitlesList'

import {
  createTitle,
  deleteTitle,
  listTitleChampionships,
  listTitleSeasons,
  listTitleTeams,
  listTitles,
  updateTitle,
} from '../../../../services/titles/titlesService'

import type {
  Title,
  TitleChampionshipOption,
  TitleFormData,
  TitleSeasonOption,
  TitleTeamOption,
} from '../../../../backend/modules/titles/titles.types'

import '../../../../styles/admin/TitlesPage.css'

const initialForm = (seasonId: string): TitleFormData => ({
  seasonId,
  seasonTeamRegistrationId: '',
  awardedAt: '',
  notes: '',
})

export default function TitlesPage() {
  const [championships, setChampionships] = useState<
    TitleChampionshipOption[]
  >([])

  const [seasons, setSeasons] = useState<TitleSeasonOption[]>([])
  const [teams, setTeams] = useState<TitleTeamOption[]>([])
  const [titles, setTitles] = useState<Title[]>([])

  const [championshipId, setChampionshipId] = useState('')
  const [seasonId, setSeasonId] = useState('')

  const [form, setForm] = useState<TitleFormData>(initialForm(''))
  const [editingTitleId, setEditingTitleId] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [loadingOptions, setLoadingOptions] = useState(false)
  const [loadingTitles, setLoadingTitles] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    async function loadChampionships() {
      setLoadingOptions(true)

      try {
        const result = await listTitleChampionships()

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

  useEffect(() => {
    if (!championshipId) return

    let active = true

    async function loadSeasons() {
      setLoadingOptions(true)

      try {
        const result = await listTitleSeasons(championshipId)

        if (active) {
          setSeasons(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as temporadas.',
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

  async function loadSeasonData(
    targetChampionshipId: string,
    targetSeasonId: string,
  ) {
    if (!targetChampionshipId || !targetSeasonId) {
      setTeams([])
      setTitles([])
      return
    }

    setLoadingTitles(true)
    setError('')

    try {
      const [teamResult, titleResult] = await Promise.all([
        listTitleTeams(targetSeasonId),
        listTitles({
          championshipId: targetChampionshipId,
          seasonId: targetSeasonId,
        }),
      ])

      setTeams(teamResult)
      setTitles(titleResult)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o histórico de títulos.',
      )
    } finally {
      setLoadingTitles(false)
    }
  }

  function handleChampionshipChange(value: string) {
    setChampionshipId(value)
    setSeasonId('')
    setSeasons([])
    setTeams([])
    setTitles([])
    setShowForm(false)
    setEditingTitleId('')
    setForm(initialForm(''))
    setError('')
    setSuccess('')
  }

  async function handleSeasonChange(value: string) {
    setSeasonId(value)
    setTeams([])
    setTitles([])
    setShowForm(false)
    setEditingTitleId('')
    setForm(initialForm(value))
    setError('')
    setSuccess('')

    await loadSeasonData(championshipId, value)
  }

  function startNewTitle() {
    setEditingTitleId('')
    setForm(initialForm(seasonId))
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function startEditTitle(title: Title) {
    setEditingTitleId(title.id)

    setForm({
      seasonId: title.seasonId,
      seasonTeamRegistrationId: title.seasonTeamRegistrationId,
      awardedAt: title.awardedAt ?? '',
      notes: title.notes ?? '',
    })

    setShowForm(true)
    setError('')
    setSuccess('')
  }

  async function handleSubmit() {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editingTitleId) {
        await updateTitle(editingTitleId, form)
        setSuccess('Registro de campeão atualizado com sucesso.')
      } else {
        await createTitle(form)
        setSuccess('Campeão registrado com sucesso.')
      }

      setShowForm(false)
      setEditingTitleId('')

      await loadSeasonData(championshipId, seasonId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o registro.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(title: Title) {
    const confirmed = window.confirm(
      `Deseja excluir o registro de campeão da equipe "${title.teamName}" na temporada "${title.seasonName}"?`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await deleteTitle(title.id)

      setSuccess('Registro de campeão excluído com sucesso.')

      await loadSeasonData(championshipId, seasonId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir o registro.',
      )
    }
  }

  return (
    <div className="admin-module-page titles-page">
      <AdminPageHeader
        title="Histórico de títulos"
        description="Histórico dos campeões das temporadas."
      />

      <TitlesFilters
        championships={championships}
        seasons={seasons}
        championshipId={championshipId}
        seasonId={seasonId}
        loading={loadingOptions}
        onChampionshipChange={handleChampionshipChange}
        onSeasonChange={(value) => void handleSeasonChange(value)}
      />

      {error && (
        <div className="titles-message error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="titles-message success">
          <span>{success}</span>
        </div>
      )}

      {!seasonId ? (
        <div className="titles-empty titles-page-empty">
          <Trophy size={32} />

          <strong>Selecione uma temporada</strong>

          <span>
            Escolha um campeonato e uma temporada para consultar o histórico
            de campeões.
          </span>
        </div>
      ) : (
        <>
          <div className="titles-toolbar">
            <div>
              <strong>Campeões da temporada</strong>

              <small>
                {titles.length === 1
                  ? '1 campeão registrado'
                  : `${titles.length} registros encontrados`}
              </small>
            </div>

            <div className="titles-toolbar-actions">
              <button
                type="button"
                className="titles-button secondary"
                onClick={() =>
                  void loadSeasonData(championshipId, seasonId)
                }
                disabled={loadingTitles}
              >
                <RefreshCw
                  size={16}
                  className={loadingTitles ? 'is-spinning' : ''}
                />
                Atualizar
              </button>

              <button
                type="button"
                className="titles-button primary"
                onClick={startNewTitle}
                disabled={teams.length === 0 || titles.length > 0}
              >
                <Plus size={17} />
                Registrar campeão
              </button>
            </div>
          </div>

          {showForm && (
            <TitleForm
              form={form}
              teams={teams}
              editing={Boolean(editingTitleId)}
              saving={saving}
              onChange={setForm}
              onSubmit={() => void handleSubmit()}
              onCancel={() => setShowForm(false)}
            />
          )}

          <section className="titles-panel">
            <div className="titles-panel-header">
              <div>
                <h2>Histórico de campeões</h2>
                <p>Registros oficiais de conquistas por temporada.</p>
              </div>
            </div>

            <TitlesList
              titles={titles}
              loading={loadingTitles}
              onEdit={startEditTitle}
              onDelete={(title) => void handleDelete(title)}
            />
          </section>
        </>
      )}
    </div>
  )
}
