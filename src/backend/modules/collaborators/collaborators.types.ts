export type CollaboratorRole =
  | 'admin'
  | 'organizer'
  | 'editor'
  | 'viewer'

export type CollaboratorStatus = 'active' | 'inactive'

export interface Collaborator {
  id: string
  name: string
  cpf: string
  email: string
  phone: string | null
  cargo: string | null
  role: CollaboratorRole
  status: CollaboratorStatus
  createdAt: string
}

export interface CollaboratorFormData {
  name: string
  cpf: string
  email: string
  phone: string
  cargo: string
  role: CollaboratorRole
  password: string
}

export interface CollaboratorFilters {
  search: string
  role: string
  status: string
}

export interface CollaboratorPermission {
  id: string
  key: string
  name: string
  description: string | null
  category: string
}

export interface CollaboratorPermissions {
  role: CollaboratorRole
  permissions: CollaboratorPermission[]
}

export interface CollaboratorsRepository {
  list(filters: CollaboratorFilters): Promise<Collaborator[]>

  listPermissions(
    role: CollaboratorRole,
  ): Promise<CollaboratorPermission[]>

  save(
    id: string | null,
    data: CollaboratorFormData,
  ): Promise<Collaborator>

  updateStatus(
    id: string,
    status: CollaboratorStatus,
  ): Promise<void>
}
