
import type {
  StageFormData,
  StagePhaseType,
} from '../../../../../backend/modules/stages/stages.types'

interface StageFormProps {
  form: StageFormData
  editing: boolean
  saving: boolean
  onChange: (form: StageFormData) => void
  onSubmit: () => void
  onCancel: () => void
}

const phaseTypeLabels: Record<StagePhaseType, string> = {
  league: 'Pontos corridos',
  groups: 'Fase de grupos',
  knockout: 'Mata-mata',
  final: 'Final',
  other: 'Outro formato',
}

export default function StageForm({
  form,
  editing,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: StageFormProps) {
  function update<K extends keyof StageFormData>(
    field: K,
    value: StageFormData[K],
  ) {
    onChange({ ...form, [field]: value })
  }

  return (
    <form
      className="stages-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="stages-form-heading">
        <div>
          <h3>{editing ? 'Editar fase' : 'Nova fase'}</h3>
          <p>Defina a identificação e a ordem desta fase na temporada.</p>
        </div>
      </div>

      <div className="stages-form-grid">
        <label className="stages-field stages-field-wide">
          <span>Nome da fase</span>
          <input
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Ex.: Primeira fase"
            maxLength={120}
            required
          />
        </label>

        <label className="stages-field">
          <span>Tipo de fase</span>
          <select
            value={form.phaseType}
            onChange={(event) =>
              update('phaseType', event.target.value as StagePhaseType)
            }
          >
            {Object.entries(phaseTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="stages-field">
          <span>Ordem de execução</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.orderNumber}
            onChange={(event) =>
              update('orderNumber', Number(event.target.value))
            }
            required
          />
        </label>
      </div>

      <div className="stages-form-actions">
        <button type="button" className="stages-button secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="stages-button primary" disabled={saving}>
          {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar fase'}
        </button>
      </div>
    </form>
  )
}
