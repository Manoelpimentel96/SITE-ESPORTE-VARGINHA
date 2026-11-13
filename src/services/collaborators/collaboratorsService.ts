import { domainCall } from '../../lib/domainApi'
import type { Collaborator, CollaboratorFilters, CollaboratorFormData, CollaboratorPermission, CollaboratorRole, CollaboratorStatus } from '../../backend/modules/collaborators/collaborators.types'
export const listCollaborators = (filters: CollaboratorFilters) => domainCall<Collaborator[]>('collaborators', 'listCollaborators', filters)
export const listCollaboratorPermissions = (role: CollaboratorRole) => domainCall<CollaboratorPermission[]>('collaborators', 'listCollaboratorPermissions', role)
export const createCollaborator = (data: CollaboratorFormData) => domainCall<Collaborator>('collaborators', 'createCollaborator', data)
export const updateCollaborator = (id: string, data: CollaboratorFormData) => domainCall<Collaborator>('collaborators', 'updateCollaborator', id, data)
export const updateCollaboratorStatus = (id: string, status: CollaboratorStatus) => domainCall<void>('collaborators', 'updateCollaboratorStatus', id, status)
