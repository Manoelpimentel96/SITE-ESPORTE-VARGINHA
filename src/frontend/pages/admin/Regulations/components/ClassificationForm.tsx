import type { RegulationFormData, TieBreaker } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

const tieBreakers: { value: TieBreaker; label: string }[] = [
  { value: 'wins', label: 'Maior número de vitórias' },
  { value: 'goal_difference', label: 'Saldo de gols' },
  { value: 'goals_for', label: 'Gols marcados' },
  { value: 'head_to_head', label: 'Confronto direto' },
  { value: 'fewest_goals_against', label: 'Menor número de gols sofridos' },
  { value: 'fair_play', label: 'Critério de fair play' },
  { value: 'draw', label: 'Sorteio' },
]

export default function ClassificationForm({ form, onChange }: Props) {
  function toggleTieBreaker(value: TieBreaker) {
    const exists = form.tieBreakers.includes(value)

    const next = exists
      ? form.tieBreakers.filter((item) => item !== value)
      : [...form.tieBreakers, value]

    onChange({
      ...form,
      tieBreakers: next,
      classificationSettings: {
        ...form.classificationSettings,
        orderBy: next,
      },
    })
  }

  function moveTieBreaker(index: number, direction: -1 | 1) {
    const next = [...form.tieBreakers]
    const target = index + direction

    if (target < 0 || target >= next.length) return

    ;[next[index], next[target]] = [next[target], next[index]]

    onChange({
      ...form,
      tieBreakers: next,
      classificationSettings: {
        ...form.classificationSettings,
        orderBy: next,
      },
    })
  }

  return (
    <section className="regulation-section">
      <h2>Classificação e desempates</h2>

      <label>
        Total de participantes classificados
        <input
          type="number"
          min="0"
          value={form.classificationSettings.totalQualified ?? ''}
          onChange={(event) =>
            onChange({
              ...form,
              classificationSettings: {
                ...form.classificationSettings,
                totalQualified: event.target.value
                  ? Number(event.target.value)
                  : null,
              },
            })
          }
        />
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={form.classificationSettings.headToHeadMiniTable}
          onChange={(event) =>
            onChange({
              ...form,
              classificationSettings: {
                ...form.classificationSettings,
                headToHeadMiniTable: event.target.checked,
              },
            })
          }
        />
        Registrar tabela de confronto direto
      </label>

      <h3>Critérios de desempate</h3>
      <p>Selecione os critérios e organize a ordem de apresentação.</p>

      {tieBreakers.map((item) => (
        <label className="check-field" key={item.value}>
          <input
            type="checkbox"
            checked={form.tieBreakers.includes(item.value)}
            onChange={() => toggleTieBreaker(item.value)}
          />
          {item.label}
        </label>
      ))}

      <h3>Ordem selecionada</h3>

      {form.tieBreakers.map((value, index) => {
        const item = tieBreakers.find((option) => option.value === value)

        return (
          <div className="tie-breaker-row" key={value}>
            <span>{index + 1}. {item?.label ?? value}</span>

            <button
              type="button"
              disabled={index === 0}
              onClick={() => moveTieBreaker(index, -1)}
            >
              ↑
            </button>

            <button
              type="button"
              disabled={index === form.tieBreakers.length - 1}
              onClick={() => moveTieBreaker(index, 1)}
            >
              ↓
            </button>
          </div>
        )
      })}
    </section>
  )
}