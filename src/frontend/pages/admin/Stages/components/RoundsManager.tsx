
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Edit2, Plus, Trash2, X } from 'lucide-react'

import type {
  StageGroup,
  StageRound,
  RoundFormData,
} from '../../../../../backend/modules/stages/stages.types'

interface RoundsManagerProps {
  phaseId: string
  seasonId: string
  groups: StageGroup[]
  rounds: StageRound[]
  loading: boolean
  onCreate: (data: RoundFormData) => Promise<void>
  onUpdate: (id: string, data: RoundFormData) => Promise<void>
  onDelete: (round: StageRound) => Promise<void>
}

function emptyForm(phaseId: string, seasonId: string): RoundFormData {
  return {
    phaseId,
    seasonId,
    groupId: null,
    name: '',
    roundNumber: 1,
    scheduledDate: null,
  }
}

export default function RoundsManager({
  phaseId,
  seasonId,
  groups,
  rounds,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: RoundsManagerProps) {
  const [form, setForm] = useState<RoundFormData>(() =>
    emptyForm(phaseId, seasonId),
  )
  const [editingId, setEditingId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startEditing(round: StageRound) {
    setEditingId(round.id)
    setForm({
      phaseId,
      seasonId,
      groupId: round.groupId,
      name: round.name,
      roundNumber: round.roundNumber,
      scheduledDate: round.scheduledDate,
    })
    setError('')
  }

  function cancelEditing() {
    setEditingId('')
    setForm(emptyForm(phaseId, seasonId))
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingId) {
        await onUpdate(editingId, form)
      } else {
        await onCreate(form)
      }

      cancelEditing()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível salvar a rodada.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!phaseId) {
    return (
      <section className="stages-panel">
        <div className="stages-empty">
          Selecione uma fase para gerenciar as rodadas.
        </div>
      </section>
    )
  }

  return (
    <section className="stages-panel">
      <div className="stages-panel-header">
        <div>
          <h3>Rodadas</h3>
          <p>Organização das rodadas da fase selecionada.</p>
        </div>
      </div>

      <form className="stages-round-form" onSubmit={submit}>
        <label className="stages-field">
          <span>Nome da rodada</span>
          <input
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            placeholder="Ex.: 1ª rodada"
            maxLength={100}
            required
          />
        </label>

        <label className="stages-field">
          <span>Número</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.roundNumber}
            onChange={(event) =>
              setForm({ ...form, roundNumber: Number(event.target.value) })
            }
            required
          />
        </label>

        <label className="stages-field">
          <span>Grupo</span>
          <select
            value={form.groupId ?? ''}
            onChange={(event) =>
              setForm({ ...form, groupId: event.target.value || null })
            }
          >
            <option value="">Fase inteira / sem grupo</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <label className="stages-field">
          <span>Data prevista</span>
          <input
            type="date"
            value={form.scheduledDate ?? ''}
            onChange={(event) =>
              setForm({
                ...form,
                scheduledDate: event.target.value || null,
              })
            }
          />
        </label>

        <div className="stages-inline-actions">
          <button
            type="submit"
            className="stages-button primary"
            disabled={saving}
          >
            <Plus size={15} />
            {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
          </button>

          {editingId && (
            <button
              type="button"
              className="stages-icon-button"
              onClick={cancelEditing}
              title="Cancelar edição"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </form>

      {error && <p className="stages-inline-error">{error}</p>}

      {loading ? (
        <div className="stages-empty compact">Carregando rodadas...</div>
      ) : rounds.length === 0 ? (
        <div className="stages-empty compact">
          Nenhuma rodada cadastrada nesta fase.
        </div>
      ) : (
        <div className="stages-record-list">
          {rounds.map((round) => {
            const groupName =
              groups.find((group) => group.id === round.groupId)?.name ??
              'Sem grupo'

            return (
              <div className="stages-record" key={round.id}>
                <span className="stages-order">{round.roundNumber}</span>

                <div className="stages-round-info">
                  <strong>{round.name}</strong>
                  <small>
                    {groupName}
                    {round.scheduledDate
                      ? ` · ${new Date(
                          `${round.scheduledDate}T00:00:00`,
                        ).toLocaleDateString('pt-BR')}`
                      : ''}
                  </small>
                </div>

                <div className="stages-item-actions">
                  <button
                    type="button"
                    title="Editar rodada"
                    aria-label={`Editar rodada ${round.name}`}
                    onClick={() => startEditing(round)}
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    title="Excluir rodada"
                    aria-label={`Excluir rodada ${round.name}`}
                    onClick={() => void onDelete(round)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
