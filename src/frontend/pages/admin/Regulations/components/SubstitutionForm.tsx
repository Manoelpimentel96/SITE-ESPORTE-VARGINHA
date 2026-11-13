import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function SubstitutionForm({ form, onChange }: Props) {
  const settings = form.substitutionSettings

  function update<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    onChange({
      ...form,
      substitutionSettings: {
        ...settings,
        [key]: value,
      },
    })
  }

  return (
    <section className="regulation-section">
      <h2>Substituições</h2>

      <label>
        Limite de substituições
        <input
          type="number"
          value={settings.limit}
          onChange={(event) => update('limit', Number(event.target.value))}
        />
      </label>

      <label>
        Janelas de substituição
        <input
          type="number"
          value={settings.windows ?? ''}
          onChange={(event) =>
            update('windows', event.target.value ? Number(event.target.value) : null)
          }
        />
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={settings.halftimeDoesNotCountAsWindow}
          onChange={(event) =>
            update('halftimeDoesNotCountAsWindow', event.target.checked)
          }
        />
        Informar se o intervalo não conta como janela
      </label>

      <label>
        Regras especiais de substituição
        <textarea
          rows={4}
          value={settings.specialRules}
          onChange={(event) => update('specialRules', event.target.value)}
        />
      </label>
    </section>
  )
}
