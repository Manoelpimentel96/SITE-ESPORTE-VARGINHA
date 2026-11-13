import { Edit, Medal, Trash2 } from 'lucide-react'

import type { Title } from '../../../../../backend/modules/titles/titles.types'

interface TitlesListProps {
  titles: Title[]
  loading: boolean
  onEdit: (title: Title) => void
  onDelete: (title: Title) => void
}

function formatDate(value: string | null) {
  if (!value) return 'Não informada'

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

export default function TitlesList({
  titles,
  loading,
  onEdit,
  onDelete,
}: TitlesListProps) {
  if (loading) {
    return (
      <div className="titles-empty">
        Carregando histórico de títulos...
      </div>
    )
  }

  if (titles.length === 0) {
    return (
      <div className="titles-empty">
        <Medal size={30} />

        <strong>Nenhum título registrado</strong>

        <span>
          O histórico de campeões desta temporada aparecerá aqui.
        </span>
      </div>
    )
  }

  return (
    <div className="titles-table-wrapper">
      <table className="titles-table">
        <thead>
          <tr>
            <th>Campeão</th>
            <th>Temporada</th>
            <th>Data da conquista</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {titles.map((title) => (
            <tr key={title.id}>
              <td>
                <div className="titles-team-cell">
                  <Medal size={19} />
                  <strong>{title.teamName}</strong>
                </div>
              </td>

              <td>{title.seasonName}</td>

              <td>{formatDate(title.awardedAt)}</td>

              <td>{title.notes || '—'}</td>

              <td>
                <div className="titles-actions">
                  <button
                    type="button"
                    title="Editar título"
                    aria-label={`Editar título de ${title.teamName}`}
                    onClick={() => onEdit(title)}
                  >
                    <Edit size={17} />
                  </button>

                  <button
                    type="button"
                    title="Excluir título"
                    aria-label={`Excluir título de ${title.teamName}`}
                    onClick={() => onDelete(title)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
