import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function GeneralSettingsForm({ form, onChange }: Props) {
  const settings = form.generalSettings

  function update<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    onChange({
      ...form,
      generalSettings: {
        ...settings,
        [key]: value,
      },
    })
  }

  return (
    <section className="regulation-section">
      <h2>Disposições gerais</h2>

      <label>
        Requisitos de participação
        <textarea
          rows={4}
          value={settings.participationRequirements}
          onChange={(event) =>
            update('participationRequirements', event.target.value)
          }
        />
      </label>

      <label>
        Procedimentos administrativos
        <textarea
          rows={4}
          value={settings.administrativeProcedures}
          onChange={(event) =>
            update('administrativeProcedures', event.target.value)
          }
        />
      </label>

      <label>
        Disposições adicionais
        <textarea
          rows={4}
          value={settings.additionalProvisions}
          onChange={(event) =>
            update('additionalProvisions', event.target.value)
          }
        />
      </label>

      <label>
        Texto oficial do regulamento
        <textarea
          rows={10}
          value={settings.officialText}
          onChange={(event) => update('officialText', event.target.value)}
        />
      </label>
    </section>
  )
}
