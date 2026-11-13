import { Edit, UserCheck, UserX } from 'lucide-react'

import type {
  Collaborator,
  CollaboratorRole,
} from '../../../../../backend/modules/collaborators/collaborators.types'

interface CollaboratorsListProps {
  collaborators: Collaborator[]
  loading: boolean
  onEdit: (collaborator: Collaborator) => void
  onStatusChange: (collaborator: Collaborator) => void
  onPermissions: (collaborator: Collaborator) => void
}

const roleLabels: Record<CollaboratorRole, string> = {
  admin: 'Administrador',
  organizer: 'Organizador',
  editor: 'Editor',
  viewer: 'Visualizador',
}

export default function CollaboratorsList({
  collaborators,
  loading,
  onEdit,
  onStatusChange,
  onPermissions,
}: CollaboratorsListProps) {
  if (loading) {
    return (
      <div className="collaborators-empty">
        Carregando colaboradores...
      </div>
    )
  }

  if (collaborators.length === 0) {
    return (
      <div className="collaborators-empty">
        <strong>Nenhum colaborador encontrado</strong>
        <span>Os colaboradores cadastrados aparecerão aqui.</span>
      </div>
    )
  }

  return (
    <div className="collaborators-table-wrapper">
      <table className="collaborators-table">
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>CPF</th>
            <th>Cargo</th>
            <th>Perfil</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {collaborators.map((collaborator) => (
            <tr key={collaborator.id}>
              <td>
                <div className="collaborator-identity">
                  <strong>{collaborator.name}</strong>
                  <span>{collaborator.email}</span>
                </div>
              </td>

              <td>{collaborator.cpf}</td>

              <td>{collaborator.cargo || '—'}</td>

              <td>{roleLabels[collaborator.role]}</td>

              <td>
                <span
                  className={`collaborator-status ${collaborator.status}`}
                >
                  {collaborator.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </td>

              <td>
                <div className="collaborator-actions">
                  <button
                    type="button"
                    title="Editar colaborador"
                    aria-label={`Editar ${collaborator.name}`}
                    onClick={() => onEdit(collaborator)}
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    type="button"
                    title="Consultar permissões"
                    aria-label={`Consultar permissões de ${collaborator.name}`}
                    onClick={() => onPermissions(collaborator)}
                  >
                    <UserCheck size={16} />
                  </button>

                  <button
                    type="button"
                    title={
                      collaborator.status === 'active'
                        ? 'Desativar colaborador'
                        : 'Ativar colaborador'
                    }
                    aria-label={`Alterar situação de ${collaborator.name}`}
                    onClick={() => onStatusChange(collaborator)}
                  >
                    {collaborator.status === 'active' ? (
                      <UserX size={16} />
                    ) : (
                      <UserCheck size={16} />
                    )}
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
