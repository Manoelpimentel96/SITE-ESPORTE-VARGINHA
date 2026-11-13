import type {
  CollaboratorFilters,
  CollaboratorFormData,
  CollaboratorRole,
  CollaboratorStatus,
  CollaboratorsRepository,
} from './collaborators.types'

import { validateCollaborator } from './collaborators.validation'

export function createCollaboratorsUseCases(
  repository: CollaboratorsRepository,
) {
  return {
    list(filters: CollaboratorFilters) {
      return repository.list(filters)
    },

    listPermissions(role: CollaboratorRole) {
      return repository.listPermissions(role)
    },

    async create(data: CollaboratorFormData) {
      validateCollaborator(data, false)

      return repository.save(null, data)
    },

    async update(id: string, data: CollaboratorFormData) {
      if (!id) {
        throw new Error('Colaborador não informado.')
      }

      validateCollaborator(data, true)

      return repository.save(id, data)
    },

    async updateStatus(
      id: string,
      status: CollaboratorStatus,
    ) {
      if (!id) {
        throw new Error('Colaborador não informado.')
      }

      if (!['active', 'inactive'].includes(status)) {
        throw new Error('Situação inválida.')
      }

      return repository.updateStatus(id, status)
    },
  }
}
