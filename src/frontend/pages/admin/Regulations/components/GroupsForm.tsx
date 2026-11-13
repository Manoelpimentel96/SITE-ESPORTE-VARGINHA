import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function GroupsForm({ form, onChange }: Props) {
  const settings = form.groupSettings

  return (
    <section className="regulation-section">
      <h2>Grupos</h2>

      <label>
        Quantidade de grupos
        <input
          type="number"
          min="1"
          value={settings.groupCount}
          onChange={(event) =>
            onChange({
              ...form,
              groupSettings: {
                ...settings,
                groupCount: Number(event.target.value),
              },
            })
          }
        />
      </label>

      <label>
        Participantes por grupo
        <input
          type="number"
          min="1"
          value={settings.teamsPerGroup ?? ''}
          onChange={(event) =>
            onChange({
              ...form,
              groupSettings: {
                ...settings,
                teamsPerGroup: event.target.value
                  ? Number(event.target.value)
                  : null,
              },
            })
          }
        />
      </label>

      <label>
        Jogos entre participantes do grupo
        <select
          value={settings.matchesPerPairing}
          onChange={(event) =>
            onChange({
              ...form,
              groupSettings: {
                ...settings,
                matchesPerPairing: event.target.value as 'single' | 'home_away',
              },
            })
          }
        >
          <option value="single">Jogo único</option>
          <option value="home_away">Ida e volta</option>
        </select>
      </label>

      <label>
        Classificados por grupo
        <input
          type="number"
          min="0"
          value={settings.qualifiedPerGroup}
          onChange={(event) =>
            onChange({
              ...form,
              groupSettings: {
                ...settings,
                qualifiedPerGroup: Number(event.target.value),
              },
            })
          }
        />
      </label>

      <label>
        Quantidade de melhores terceiros colocados
        <input
          type="number"
          min="0"
          value={settings.bestThirdPlaceCount}
          onChange={(event) =>
            onChange({
              ...form,
              groupSettings: {
                ...settings,
                bestThirdPlaceCount: Number(event.target.value),
              },
            })
          }
        />
      </label>

      <label>
        Distribuição dos participantes
        <select
          value={settings.distribution}
          onChange={(event) =>
            onChange({
              ...form,
              groupSettings: {
                ...settings,
                distribution: event.target.value as 'balanced' | 'manual',
              },
            })
          }
        >
          <option value="balanced">Distribuição equilibrada</option>
          <option value="manual">Distribuição manual</option>
        </select>
      </label>
    </section>
  )
}
