import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function DisciplineForm({ form, onChange }: Props) {
  const settings = form.disciplineSettings

  function update<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    onChange({
      ...form,
      disciplineSettings: {
        ...settings,
        [key]: value,
      },
    })
  }

  return (
    <section className="regulation-section">
      <h2>Disciplina e cartões</h2>

      <label>
        Quantidade de cartões amarelos informada para suspensão
        <input
          type="number"
          value={settings.yellowCardSuspensionAfter}
          onChange={(event) =>
            update('yellowCardSuspensionAfter', Number(event.target.value))
          }
        />
      </label>

      <label>
        Partidas de suspensão por cartão vermelho
        <input
          type="number"
          value={settings.redCardSuspensionMatches}
          onChange={(event) =>
            update('redCardSuspensionMatches', Number(event.target.value))
          }
        />
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={settings.yellowCardsResetAtStage}
          onChange={(event) =>
            update('yellowCardsResetAtStage', event.target.checked)
          }
        />
        Informar reinício dos cartões amarelos por fase
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={settings.yellowCardsResetAtKnockout}
          onChange={(event) =>
            update('yellowCardsResetAtKnockout', event.target.checked)
          }
        />
        Informar reinício dos cartões amarelos nas eliminatórias
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={settings.redCardAutomaticSuspension}
          onChange={(event) =>
            update('redCardAutomaticSuspension', event.target.checked)
          }
        />
        Informar suspensão automática por cartão vermelho
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={settings.disciplinaryReview}
          onChange={(event) =>
            update('disciplinaryReview', event.target.checked)
          }
        />
        Informar possibilidade de análise disciplinar
      </label>

      <label>
        Observações disciplinares
        <textarea
          value={settings.notes}
          onChange={(event) => update('notes', event.target.value)}
          rows={4}
        />
      </label>
    </section>
  )
}
