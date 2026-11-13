import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function MatchSettingsForm({ form, onChange }: Props) {
  const settings = form.matchSettings

  function update<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    onChange({
      ...form,
      matchSettings: {
        ...settings,
        [key]: value,
      },
    })
  }

  return (
    <section className="regulation-section">
      <h2>Configurações das partidas</h2>

      <label>
        Duração total da partida em minutos
        <input
          type="number"
          value={settings.matchDurationMinutes}
          onChange={(event) =>
            update('matchDurationMinutes', Number(event.target.value))
          }
        />
      </label>

      <label>
        Duração de cada tempo em minutos
        <input
          type="number"
          value={settings.halfDurationMinutes}
          onChange={(event) =>
            update('halfDurationMinutes', Number(event.target.value))
          }
        />
      </label>

      <label>
        Intervalo em minutos
        <input
          type="number"
          value={settings.intervalMinutes}
          onChange={(event) =>
            update('intervalMinutes', Number(event.target.value))
          }
        />
      </label>

      <label>
        Descanso mínimo entre partidas em horas
        <input
          type="number"
          value={settings.minimumRestHours}
          onChange={(event) =>
            update('minimumRestHours', Number(event.target.value))
          }
        />
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={settings.homeAdvantage}
          onChange={(event) => update('homeAdvantage', event.target.checked)}
        />
        Informar vantagem do mando de campo
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={settings.allowSameDayMatches}
          onChange={(event) =>
            update('allowSameDayMatches', event.target.checked)
          }
        />
        Informar possibilidade de partidas no mesmo dia
      </label>
    </section>
  )
}
