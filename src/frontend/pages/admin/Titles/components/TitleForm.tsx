import type {
  TitleFormData,
  TitleTeamOption,
} from '../../../../../backend/modules/titles/titles.types'

interface TitleFormProps {
  form: TitleFormData
  teams: TitleTeamOption[]
  editing: boolean
  saving: boolean
  onChange: (form: TitleFormData) => void
  onSubmit: () => void
  onCancel: () => void
}

export default function TitleForm({
  form,
  teams,
  editing,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: TitleFormProps) {
  function updateField<K extends keyof TitleFormData>(
    field: K,
    value: TitleFormData[K],
  ) {
    onChange({
      ...form,
      [field]: value,
    })
  }

  return (
    <section className="titles-panel">
      <div className="titles-panel-header">
        <div>
          <h2>{editing ? 'Editar campeão' : 'Registrar campeão'}</h2>
          <p>Informe a equipe vencedora da temporada selecionada.</p>
        </div>
      </div>

      <div className="titles-form">
        <div className="titles-field">
          <label htmlFor="title-team">Equipe campeã</label>

          <select
            id="title-team"
            value={form.seasonTeamRegistrationId}
            onChange={(event) =>
              updateField('seasonTeamRegistrationId', event.target.value)
            }
            disabled={saving}
          >
            <option value="">Selecione a equipe</option>

            {teams.map((team) => (
              <option key={team.registrationId} value={team.registrationId}>
                {team.name}
                {team.shortName ? ` (${team.shortName})` : ''}
              </option>
            ))}
          </select>

          {teams.length === 0 && (
            <small>Não há equipes inscritas nesta temporada.</small>
          )}
        </div>

        <div className="titles-field">
          <label htmlFor="title-awarded-at">Data da conquista</label>

          <input
            id="title-awarded-at"
            type="date"
            value={form.awardedAt}
            onChange={(event) =>
              updateField('awardedAt', event.target.value)
            }
            disabled={saving}
          />
        </div>

        <div className="titles-field full-width">
          <label htmlFor="title-notes">Observações</label>

          <textarea
            id="title-notes"
            rows={4}
            maxLength={2000}
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Informações adicionais sobre a conquista..."
            disabled={saving}
          />
        </div>
      </div>

      <div className="titles-form-actions">
        <button
          type="button"
          className="titles-button secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="titles-button primary"
          onClick={onSubmit}
          disabled={saving || teams.length === 0}
        >
          {saving
            ? 'Salvando...'
            : editing
              ? 'Salvar alterações'
              : 'Registrar campeão'}
        </button>
      </div>
    </section>
  )
}
