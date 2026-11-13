
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Edit2, Plus, Trash2, X } from 'lucide-react'

import type {
  GroupFormData,
  StageGroup,
} from '../../../../../backend/modules/stages/stages.types'

interface GroupsManagerProps {
  phaseId: string
  seasonId: string
  groups: StageGroup[]
  loading: boolean
  onCreate: (data: GroupFormData) => Promise<void>
  onUpdate: (id: string, data: GroupFormData) => Promise<void>
  onDelete: (group: StageGroup) => Promise<void>
}

const emptyForm = (phaseId: string, seasonId: string): GroupFormData => ({
  phaseId,
  seasonId,
  name: '',
  orderNumber: 1,
})

export default function GroupsManager({
  phaseId,
  seasonId,
  groups,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: GroupsManagerProps) {
  const [form, setForm] = useState<GroupFormData>(() =>
    emptyForm(phaseId, seasonId),
  )
  const [editingId, setEditingId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startEditing(group: StageGroup) {
    setEditingId(group.id)
    setForm({
      phaseId,
      seasonId,
      name: group.name,
      orderNumber: group.orderNumber,
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
        err instanceof Error ? err.message : 'Não foi possível salvar o grupo.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!phaseId) {
    return (
      <section className="stages-panel">
        <div className="stages-empty">
          Selecione uma fase para gerenciar os grupos.
        </div>
      </section>
    )
  }

  return (
    <section className="stages-panel">
      <div className="stages-panel-header">
        <div>
          <h3>Grupos</h3>
          <p>Grupos vinculados à fase selecionada.</p>
        </div>
      </div>

      <form className="stages-inline-form" onSubmit={submit}>
        <label className="stages-field">
          <span>Nome do grupo</span>
          <input
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            placeholder="Ex.: Grupo A"
            maxLength={100}
            required
          />
        </label>

        <label className="stages-field stages-order-field">
          <span>Ordem</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.orderNumber}
            onChange={(event) =>
              setForm({ ...form, orderNumber: Number(event.target.value) })
            }
            required
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
        <div className="stages-empty compact">Carregando grupos...</div>
      ) : groups.length === 0 ? (
        <div className="stages-empty compact">
          Nenhum grupo cadastrado nesta fase.
        </div>
      ) : (
        <div className="stages-record-list">
          {groups.map((group) => (
            <div className="stages-record" key={group.id}>
              <span className="stages-order">{group.orderNumber}</span>
              <strong>{group.name}</strong>

              <div className="stages-item-actions">
                <button
                  type="button"
                  title="Editar grupo"
                  aria-label={`Editar grupo ${group.name}`}
                  onClick={() => startEditing(group)}
                >
                  <Edit2 size={15} />
                </button>

                <button
                  type="button"
                  title="Excluir grupo"
                  aria-label={`Excluir grupo ${group.name}`}
                  onClick={() => void onDelete(group)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
