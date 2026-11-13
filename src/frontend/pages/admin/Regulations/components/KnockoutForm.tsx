import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function KnockoutForm({ form, onChange }: Props) {
  const settings = form.knockoutSettings

  function update<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    onChange({
      ...form,
      knockoutSettings: {
        ...settings,
        [key]: value,
      },
    })
  }

  return (
    <section className="regulation-section">
      <h2>Fases eliminatórias</h2>

      <label>
        Primeira rodada
        <input
          value={settings.firstRound}
          onChange={(event) => update('firstRound', event.target.value)}
        />
      </label>

      <label>
        Formato dos confrontos
        <select
          value={settings.legs}
          onChange={(event) =>
            update('legs', event.target.value as 'single' | 'home_away')
          }
        >
          <option value="single">Jogo único</option>
          <option value="home_away">Ida e volta</option>
        </select>
      </label>

      {([
        ['aggregateEnabled', 'Registrar placar agregado'],
        ['awayGoalsRule', 'Informar regra de gols fora de casa'],
        ['extraTimeEnabled', 'Informar possibilidade de prorrogação'],
        ['penaltyShootoutEnabled', 'Informar possibilidade de disputa de pênaltis'],
        ['finalSingleMatch', 'Informar final em jogo único'],
      ] as const).map(([key, label]) => (
        <label className="check-field" key={key}>
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={(event) => update(key, event.target.checked)}
          />
          {label}
        </label>
      ))}
    </section>
  )
}
