import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function ScoringForm({ form, onChange }: Props) {
  return (
    <section className="regulation-section">
      <h2>Pontuação</h2>
      <p>Informe os valores de pontuação que serão registrados no regulamento.</p>

      <label>
        Pontos por vitória
        <input
          type="number"
          value={form.pointsWin}
          onChange={(event) =>
            onChange({ ...form, pointsWin: Number(event.target.value) })
          }
        />
      </label>

      <label>
        Pontos por empate
        <input
          type="number"
          value={form.pointsDraw}
          onChange={(event) =>
            onChange({ ...form, pointsDraw: Number(event.target.value) })
          }
        />
      </label>

      <label>
        Pontos por derrota
        <input
          type="number"
          value={form.pointsLoss}
          onChange={(event) =>
            onChange({ ...form, pointsLoss: Number(event.target.value) })
          }
        />
      </label>
    </section>
  )
}