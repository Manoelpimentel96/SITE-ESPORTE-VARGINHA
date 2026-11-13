import type {
  CompetitionPhase,
  RegulationFormData,
} from '../../../../../services/regulations/regulationService'

interface Props {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function PhasesForm({ form, onChange }: Props) {
  function updatePhase(index: number, changes: Partial<CompetitionPhase>) {
    const phases = form.phases.map((phase, phaseIndex) =>
      phaseIndex === index ? { ...phase, ...changes } : phase,
    )

    onChange({ ...form, phases })
  }

  function addPhase() {
    const phase: CompetitionPhase = {
      key: `fase_${Date.now()}`,
      name: '',
      type: 'other',
      order: form.phases.length + 1,
      legs: 'single',
    }

    onChange({ ...form, phases: [...form.phases, phase] })
  }

  function removePhase(index: number) {
    onChange({
      ...form,
      phases: form.phases.filter((_, phaseIndex) => phaseIndex !== index),
    })
  }

  return (
    <section className="regulation-section">
      <h2>Fases da competição</h2>

      {form.phases.map((phase, index) => (
        <div className="regulation-phase" key={phase.key}>
          <h3>Fase {index + 1}</h3>

          <label>
            Nome da fase
            <input
              value={phase.name}
              onChange={(event) =>
                updatePhase(index, { name: event.target.value })
              }
            />
          </label>

          <label>
            Tipo da fase
            <select
              value={phase.type}
              onChange={(event) =>
                updatePhase(index, {
                  type: event.target.value as CompetitionPhase['type'],
                })
              }
            >
              <option value="league">Pontos corridos</option>
              <option value="groups">Grupos</option>
              <option value="knockout">Eliminatória</option>
              <option value="final">Final</option>
              <option value="other">Outra</option>
            </select>
          </label>

          <label>
            Ordem de apresentação
            <input
              type="number"
              value={phase.order}
              onChange={(event) =>
                updatePhase(index, { order: Number(event.target.value) })
              }
            />
          </label>

          <label>
            Jogos
            <select
              value={phase.legs}
              onChange={(event) =>
                updatePhase(index, {
                  legs: event.target.value as 'single' | 'home_away',
                })
              }
            >
              <option value="single">Jogo único</option>
              <option value="home_away">Ida e volta</option>
            </select>
          </label>

          <label>
            Participantes classificados
            <input
              type="number"
              min="0"
              value={phase.teamsQualified ?? ''}
              onChange={(event) =>
                updatePhase(index, {
                  teamsQualified: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            />
          </label>

          <label className="check-field">
            <input
              type="checkbox"
              checked={phase.thirdPlaceMatch ?? false}
              onChange={(event) =>
                updatePhase(index, {
                  thirdPlaceMatch: event.target.checked,
                })
              }
            />
            Informar disputa de terceiro lugar
          </label>

          <button type="button" onClick={() => removePhase(index)}>
            Remover fase
          </button>
        </div>
      ))}

      <button type="button" onClick={addPhase}>
        Adicionar fase
      </button>
    </section>
  )
}
