import { collaboratorsSupabaseRepository } from '../../../../../src/backend/modules/collaborators/collaborators.supabase'
import { createCollaboratorsUseCases } from '../../../../../src/backend/modules/collaborators/collaborators.use-cases'

import type {
  CollaboratorFilters,
  CollaboratorFormData,
  CollaboratorRole,
  CollaboratorStatus,
} from '../../../../../src/backend/modules/collaborators/collaborators.types'

const collaborators = createCollaboratorsUseCases(
  collaboratorsSupabaseRepository,
)

export const listCollaborators = (filters: CollaboratorFilters) =>
  collaborators.list(filters)

export const listCollaboratorPermissions = (role: CollaboratorRole) =>
  collaborators.listPermissions(role)

export const createCollaborator = (data: CollaboratorFormData) =>
  collaborators.create(data)

export const updateCollaborator = (
  id: string,
  data: CollaboratorFormData,
) => collaborators.update(id, data)

export const updateCollaboratorStatus = (
  id: string,
  status: CollaboratorStatus,
) => collaborators.updateStatus(id, status)
