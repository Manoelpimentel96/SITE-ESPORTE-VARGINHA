import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function CompetitionFormatForm({ form, onChange }: Props) {
  return (
    <section className="regulation-section">
      <h2>Formato da competição</h2>
      <p>Informe o formato utilizado nesta temporada.</p>

      <label>
        Formato de disputa
        <select
          value={form.format}
          onChange={(event) =>
            onChange({ ...form, format: event.target.value as RegulationFormData['format'] })
          }
        >
          <option value="league_home_away">Pontos corridos — ida e volta</option>
          <option value="league_single">Pontos corridos — jogo único</option>
          <option value="groups">Grupos</option>
          <option value="knockout">Eliminatória</option>
          <option value="groups_knockout">Grupos e eliminatórias</option>
          <option value="league_knockout">Pontos corridos e eliminatórias</option>
          <option value="custom">Personalizado</option>
        </select>
      </label>

      <label>
        Jogos entre participantes
        <select
          value={form.matchSettings.legs}
          onChange={(event) =>
            onChange({
              ...form,
              matchSettings: {
                ...form.matchSettings,
                legs: event.target.value as 'single' | 'home_away',
              },
            })
          }
        >
          <option value="single">Jogo único</option>
          <option value="home_away">Ida e volta</option>
        </select>
      </label>
    </section>
  )
}