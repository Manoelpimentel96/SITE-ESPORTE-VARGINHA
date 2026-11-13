import { Pencil, Shield, Trash2 } from 'lucide-react'

import type { Team } from '../../../../../services/teams/teamService'

interface TeamListProps {
  teams: Team[]
  isLoading: boolean
  onEdit: (team: Team) => void
  onDelete: (team: Team) => void
}

export default function TeamList({
  teams,
  isLoading,
  onEdit,
  onDelete,
}: TeamListProps) {
  if (isLoading) {
    return (
      <div className="team-list-feedback">
        Carregando equipes...
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="team-list-empty">
        <Shield size={32} />

        <h3>Nenhuma equipe encontrada</h3>

        <p>As equipes cadastradas serão apresentadas nesta área.</p>
      </div>
    )
  }

  return (
    <div className="team-list">
      {teams.map((team) => (
        <article className="team-card" key={team.id}>
          <div className="team-card-crest">
            {team.crestUrl ? (
              <img src={team.crestUrl} alt={`Escudo ${team.name}`} />
            ) : (
              <Shield size={27} />
            )}
          </div>

          <div className="team-card-information">
            <h3>{team.name}</h3>

            <p>
              {team.shortName || 'Sem abreviação'}
              {team.city ? ` · ${team.city}` : ''}
            </p>

            <span className="team-card-status">
              {team.status === 'active' ? 'Ativa' : 'Inativa'}
            </span>
          </div>

          <div className="team-card-color">
            <span
              style={{ backgroundColor: team.primaryColor || '#176b45' }}
            />
          </div>

          <div className="team-card-actions">
            <button
              type="button"
              aria-label={`Editar ${team.name}`}
              title="Editar equipe"
              onClick={() => onEdit(team)}
            >
              <Pencil size={17} />
            </button>

            <button
              type="button"
              className="team-delete-action"
              aria-label={`Excluir ${team.name}`}
              title="Excluir equipe"
              onClick={() => onDelete(team)}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
