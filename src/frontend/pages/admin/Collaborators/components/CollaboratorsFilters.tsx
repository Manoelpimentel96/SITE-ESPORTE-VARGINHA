import type {
    CollaboratorRole,
} from '../../../../../backend/modules/collaborators/collaborators.types'

interface CollaboratorsFiltersProps {
  search: string
  role: string
  status: string
  onSearchChange: (value: string) => void
  onRoleChange: (value: string) => void
  onStatusChange: (value: string) => void
}

const roles: { value: CollaboratorRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'organizer', label: 'Organizador' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Visualizador' },
]

export default function CollaboratorsFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: CollaboratorsFiltersProps) {
  return (
    <section className="collaborators-filters">
      <div className="collaborators-field search-field">
        <label htmlFor="collaborator-search">Pesquisar colaborador</label>

        <input
          id="collaborator-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nome, e-mail ou CPF..."
        />
      </div>

      <div className="collaborators-field">
        <label htmlFor="collaborator-role-filter">Perfil de acesso</label>

        <select
          id="collaborator-role-filter"
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
        >
          <option value="">Todos os perfis</option>

          {roles.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="collaborators-field">
        <label htmlFor="collaborator-status-filter">Situação</label>

        <select
          id="collaborator-status-filter"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">Todas as situações</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
    </section>
  )
}
