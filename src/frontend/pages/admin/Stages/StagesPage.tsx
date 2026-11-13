import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import GroupsManager from './components/GroupsManager'
import RoundsManager from './components/RoundsManager'
import StageForm from './components/StageForm'
import StagesFilters from './components/StagesFilters'
import StagesList from './components/StagesList'

import {
  createStage,
  createStageGroup,
  createStageRound,
  deleteStage,
  deleteStageGroup,
  deleteStageRound,
  listStageChampionships,
  listStageGroups,
  listStageRounds,
  listStageSeasons,
  listStages,
  updateStage,
  updateStageGroup,
  updateStageRound,
} from '../../../../services/stages/stagesService'

import type {
  GroupFormData,
  RoundFormData,
  Stage,
  StageChampionshipOption,
  StageFormData,
  StageGroup,
  StageRound,
  StageSeasonOption,
} from '../../../../backend/modules/stages/stages.types'

import '../../../../styles/admin/StagesPage.css'

const initialStageForm = (seasonId: string): StageFormData => ({
  seasonId,
  name: '',
  phaseType: 'groups',
  orderNumber: 1,
  settings: {},
})

export default function StagesPage() {
  const [championships, setChampionships] = useState<StageChampionshipOption[]>([])
  const [seasons, setSeasons] = useState<StageSeasonOption[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [groups, setGroups] = useState<StageGroup[]>([])
  const [rounds, setRounds] = useState<StageRound[]>([])

  const [championshipId, setChampionshipId] = useState('')
  const [seasonId, setSeasonId] = useState('')
  const [selectedStageId, setSelectedStageId] = useState('')

  const [stageForm, setStageForm] = useState<StageFormData>(
    initialStageForm(''),
  )

  const [editingStageId, setEditingStageId] = useState('')
  const [showStageForm, setShowStageForm] = useState(false)

  const [loadingOptions, setLoadingOptions] = useState(false)
  const [loadingStages, setLoadingStages] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [loadingRounds, setLoadingRounds] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedStage =
    stages.find((stage) => stage.id === selectedStageId) ?? null

  async function loadGroups(phaseId: string) {
    if (!phaseId) {
      setGroups([])
      return
    }

    setLoadingGroups(true)

    try {
      const result = await listStageGroups(phaseId)
      setGroups(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os grupos.',
      )
    } finally {
      setLoadingGroups(false)
    }
  }

  async function loadRounds(phaseId: string) {
    if (!phaseId) {
      setRounds([])
      return
    }

    setLoadingRounds(true)

    try {
      const result = await listStageRounds(phaseId)
      setRounds(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as rodadas.',
      )
    } finally {
      setLoadingRounds(false)
    }
  }

  async function loadStageDetails(phaseId: string) {
    if (!phaseId) {
      setGroups([])
      setRounds([])
      return
    }

    await Promise.all([
      loadGroups(phaseId),
      loadRounds(phaseId),
    ])
  }

  async function loadStages(targetSeasonId: string) {
    if (!targetSeasonId) {
      setStages([])
      setSelectedStageId('')
      setGroups([])
      setRounds([])
      return
    }

    setLoadingStages(true)
    setError('')

    try {
      const result = await listStages(targetSeasonId)

      setStages(result)

      const nextSelectedStageId = result.some(
        (stage) => stage.id === selectedStageId,
      )
        ? selectedStageId
        : result[0]?.id ?? ''

      setSelectedStageId(nextSelectedStageId)

      await loadStageDetails(nextSelectedStageId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as fases.',
      )
    } finally {
      setLoadingStages(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadChampionships() {
      setLoadingOptions(true)

      try {
        const result = await listStageChampionships()

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
        const result = await listStageSeasons(championshipId)

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

  function handleChampionshipChange(value: string) {
    setChampionshipId(value)
    setSeasonId('')
    setSeasons([])
    setStages([])
    setGroups([])
    setRounds([])
    setSelectedStageId('')
    setShowStageForm(false)
    setEditingStageId('')
    setStageForm(initialStageForm(''))
    setError('')
    setSuccess('')
  }

  async function handleSeasonChange(value: string) {
    setSeasonId(value)
    setStages([])
    setGroups([])
    setRounds([])
    setSelectedStageId('')
    setShowStageForm(false)
    setEditingStageId('')
    setStageForm(initialStageForm(value))
    setError('')
    setSuccess('')

    await loadStages(value)
  }

  async function handleSelectStage(stage: Stage) {
    setSelectedStageId(stage.id)
    setShowStageForm(false)
    setError('')
    setSuccess('')

    await loadStageDetails(stage.id)
  }

  function startNewStage() {
    setEditingStageId('')
    setStageForm(initialStageForm(seasonId))
    setShowStageForm(true)
    setError('')
    setSuccess('')
  }

  function startEditStage(stage: Stage) {
    setEditingStageId(stage.id)

    setStageForm({
      seasonId: stage.seasonId,
      name: stage.name,
      phaseType: stage.phaseType,
      orderNumber: stage.orderNumber,
      settings: stage.settings,
    })

    setShowStageForm(true)
    setError('')
    setSuccess('')
  }

  async function handleStageSubmit() {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editingStageId) {
        await updateStage(editingStageId, stageForm)
        setSuccess('Fase atualizada com sucesso.')
      } else {
        await createStage(stageForm)
        setSuccess('Fase cadastrada com sucesso.')
      }

      setShowStageForm(false)
      setEditingStageId('')

      await loadStages(seasonId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a fase.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteStage(stage: Stage) {
    const confirmed = window.confirm(
      `Deseja excluir a fase "${stage.name}"? O banco poderá impedir a exclusão caso existam grupos, rodadas ou partidas vinculadas.`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await deleteStage(stage.id)

      setSuccess('Fase excluída com sucesso.')

      await loadStages(seasonId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a fase.',
      )
    }
  }

  async function handleCreateGroup(data: GroupFormData) {
    setError('')
    setSuccess('')

    await createStageGroup(data)

    setSuccess('Grupo cadastrado com sucesso.')
    await loadGroups(selectedStageId)
  }

  async function handleUpdateGroup(id: string, data: GroupFormData) {
    setError('')
    setSuccess('')

    await updateStageGroup(id, data)

    setSuccess('Grupo atualizado com sucesso.')
    await loadGroups(selectedStageId)
  }

  async function handleDeleteGroup(group: StageGroup) {
    const confirmed = window.confirm(
      `Deseja excluir o grupo "${group.name}"? O banco poderá impedir a exclusão caso existam rodadas ou partidas vinculadas.`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await deleteStageGroup(group.id)

      setSuccess('Grupo excluído com sucesso.')

      await loadGroups(selectedStageId)
      await loadRounds(selectedStageId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir o grupo.',
      )
    }
  }

  async function handleCreateRound(data: RoundFormData) {
    setError('')
    setSuccess('')

    await createStageRound(data)

    setSuccess('Rodada cadastrada com sucesso.')
    await loadRounds(selectedStageId)
  }

  async function handleUpdateRound(id: string, data: RoundFormData) {
    setError('')
    setSuccess('')

    await updateStageRound(id, data)

    setSuccess('Rodada atualizada com sucesso.')
    await loadRounds(selectedStageId)
  }

  async function handleDeleteRound(round: StageRound) {
    const confirmed = window.confirm(
      `Deseja excluir a rodada "${round.name}"? O banco poderá impedir a exclusão caso existam partidas vinculadas.`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await deleteStageRound(round.id)

      setSuccess('Rodada excluída com sucesso.')

      await loadRounds(selectedStageId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a rodada.',
      )
    }
  }

  return (
    <div className="admin-module-page stages-page">
      <AdminPageHeader
        title="Fases e grupos"
        description="Organização das fases, grupos e confrontos."
      />

      <StagesFilters
        championships={championships}
        seasons={seasons}
        championshipId={championshipId}
        seasonId={seasonId}
        loading={loadingOptions}
        onChampionshipChange={handleChampionshipChange}
        onSeasonChange={(value) => void handleSeasonChange(value)}
      />

      {error && (
        <div className="stages-message error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="stages-message success">
          <span>{success}</span>
        </div>
      )}

      {!seasonId ? (
        <div className="stages-empty stages-page-feedback">
          Selecione um campeonato e uma temporada para organizar as fases.
        </div>
      ) : (
        <>
          <div className="stages-toolbar">
            <div>
              <strong>Estrutura da competição</strong>

              <small>
                {selectedStage
                  ? `Fase selecionada: ${selectedStage.name}`
                  : 'Selecione uma fase ou cadastre uma nova.'}
              </small>
            </div>

            <button
              type="button"
              className="stages-button secondary"
              onClick={() => void loadStages(seasonId)}
              disabled={loadingStages || loadingGroups || loadingRounds}
            >
              <RefreshCw
                size={16}
                className={
                  loadingStages || loadingGroups || loadingRounds
                    ? 'is-spinning'
                    : ''
                }
              />

              Atualizar
            </button>
          </div>

          <div className="stages-main-grid">
            <StagesList
              stages={stages}
              selectedStageId={selectedStageId}
              loading={loadingStages}
              onSelect={(stage) => void handleSelectStage(stage)}
              onEdit={startEditStage}
              onDelete={(stage) => void handleDeleteStage(stage)}
              onCreate={startNewStage}
            />

            <div className="stages-detail-column">
              {showStageForm ? (
                <StageForm
                  form={stageForm}
                  editing={Boolean(editingStageId)}
                  saving={saving}
                  onChange={setStageForm}
                  onSubmit={() => void handleStageSubmit()}
                  onCancel={() => setShowStageForm(false)}
                />
              ) : selectedStage ? (
                <>
                  <GroupsManager
                    key={`${selectedStage.id}-${seasonId}`}
                    phaseId={selectedStage.id}
                    seasonId={seasonId}
                    groups={groups}
                    loading={loadingGroups}
                    onCreate={handleCreateGroup}
                    onUpdate={handleUpdateGroup}
                    onDelete={handleDeleteGroup}
                  />

                  <RoundsManager
                    key={`${selectedStage.id}-${seasonId}`}
                    phaseId={selectedStage.id}
                    seasonId={seasonId}
                    groups={groups}
                    rounds={rounds}
                    loading={loadingRounds}
                    onCreate={handleCreateRound}
                    onUpdate={handleUpdateRound}
                    onDelete={handleDeleteRound}
                  />
                </>
              ) : (
                <div className="stages-empty">
                  <strong>Nenhuma fase selecionada</strong>
                  <span>
                    Cadastre uma fase ou selecione uma fase existente.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="stages-information">
            <strong>Organização dos confrontos</strong>

            <p>
              As fases, grupos e rodadas definem a estrutura da competição.
              O cadastro e a edição dos confrontos, datas, locais e resultados
              continuam no módulo Partidas.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

