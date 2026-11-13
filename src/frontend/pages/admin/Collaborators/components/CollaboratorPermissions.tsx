import { ShieldCheck } from 'lucide-react'

import type {
  Collaborator,
  CollaboratorPermission,
  CollaboratorRole,
} from '../../../../../backend/modules/collaborators/collaborators.types'

interface CollaboratorPermissionsProps {
  collaborator: Collaborator
  permissions: CollaboratorPermission[]
  loading: boolean
  onClose: () => void
}

const roleLabels: Record<CollaboratorRole, string> = {
  admin: 'Administrador',
  organizer: 'Organizador',
  editor: 'Editor',
  viewer: 'Visualizador',
}

export default function CollaboratorPermissions({
  collaborator,
  permissions,
  loading,
  onClose,
}: CollaboratorPermissionsProps) {
  const groupedPermissions = permissions.reduce<
    Record<string, CollaboratorPermission[]>
  >((groups, permission) => {
    const category = permission.category || 'Outras permissões'

    groups[category] ??= []
    groups[category].push(permission)

    return groups
  }, {})

  return (
    <section className="collaborator-panel permissions-panel">
      <div className="collaborator-panel-header">
        <div>
          <h2>Permissões de acesso</h2>
          <p>
            {collaborator.name} · {roleLabels[collaborator.role]}
          </p>
        </div>

        <button
          type="button"
          className="collaborators-button secondary"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>

      {loading ? (
        <div className="collaborators-empty">
          Carregando permissões...
        </div>
      ) : permissions.length === 0 ? (
        <div className="collaborators-empty">
          Nenhuma permissão encontrada para este perfil.
        </div>
      ) : (
        <div className="permissions-content">
          {Object.entries(groupedPermissions).map(
            ([category, categoryPermissions]) => (
              <div className="permission-category" key={category}>
                <h3>{category}</h3>

                {categoryPermissions.map((permission) => (
                  <div className="permission-item" key={permission.id}>
                    <ShieldCheck size={18} />

                    <div>
                      <strong>{permission.name}</strong>
                      {permission.description && (
                        <span>{permission.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ),
          )}
        </div>
      )}

      <p className="permissions-information">
        As permissões exibidas são herdadas do perfil de acesso. A alteração
        delas deve ser feita na configuração central de permissões, respeitando
        as restrições do proprietário do sistema.
      </p>
    </section>
  )
}
