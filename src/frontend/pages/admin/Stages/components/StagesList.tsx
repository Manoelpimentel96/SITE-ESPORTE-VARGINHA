
import { Edit2, Layers3, Plus, Trash2 } from 'lucide-react'

import type { Stage } from '../../../../../backend/modules/stages/stages.types'

interface StagesListProps {
  stages: Stage[]
  selectedStageId: string
  loading: boolean
  onSelect: (stage: Stage) => void
  onEdit: (stage: Stage) => void
  onDelete: (stage: Stage) => void
  onCreate: () => void
}

const phaseLabels: Record<string, string> = {
  league: 'Pontos corridos',
  groups: 'Fase de grupos',
  knockout: 'Mata-mata',
  final: 'Final',
  other: 'Outro formato',
}

export default function StagesList({
  stages,
  selectedStageId,
  loading,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
}: StagesListProps) {
  return (
    <section className="stages-panel">
      <div className="stages-panel-header">
        <div>
          <h3>Fases cadastradas</h3>
          <p>{stages.length} fase(s) nesta temporada</p>
        </div>

        <button type="button" className="stages-button primary" onClick={onCreate}>
          <Plus size={16} />
          Nova fase
        </button>
      </div>

      {loading ? (
        <div className="stages-empty">Carregando fases...</div>
      ) : stages.length === 0 ? (
        <div className="stages-empty">
          <Layers3 size={30} />
          <strong>Nenhuma fase cadastrada</strong>
          <span>Cadastre a primeira fase para organizar a competição.</span>
        </div>
      ) : (
        <div className="stages-list">
          {stages.map((stage) => (
            <article
              key={stage.id}
              className={`stages-list-item ${
                selectedStageId === stage.id ? 'selected' : ''
              }`}
            >
              <button
                type="button"
                className="stages-list-select"
                onClick={() => onSelect(stage)}
              >
                <span className="stages-order">{stage.orderNumber}</span>
                <span className="stages-list-info">
                  <strong>{stage.name}</strong>
                  <small>{phaseLabels[stage.phaseType] ?? stage.phaseType}</small>
                </span>
              </button>

              <div className="stages-item-actions">
                <button
                  type="button"
                  title="Editar fase"
                  aria-label={`Editar fase ${stage.name}`}
                  onClick={() => onEdit(stage)}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  title="Excluir fase"
                  aria-label={`Excluir fase ${stage.name}`}
                  onClick={() => onDelete(stage)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
