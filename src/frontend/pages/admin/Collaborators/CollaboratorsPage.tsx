import { AlertCircle, Plus, RefreshCw, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import CollaboratorsFilters from './components/CollaboratorsFilters'
import CollaboratorForm from './components/CollaboratorForm'
import CollaboratorsList from './components/CollaboratorsList'
import CollaboratorPermissions from './components/CollaboratorPermissions'

import {
  createCollaborator,
  listCollaboratorPermissions,
  listCollaborators,
  updateCollaborator,
  updateCollaboratorStatus,
} from '../../../../services/collaborators/collaboratorsService'

import type {
  Collaborator,
  CollaboratorFilters,
  CollaboratorFormData,
  CollaboratorPermission,
  CollaboratorRole,
  CollaboratorStatus,
} from '../../../../backend/modules/collaborators/collaborators.types'

import '../../../../styles/admin/CollaboratorsPage.css'

const initialForm = (): CollaboratorFormData => ({
  name: '',
  cpf: '',
  email: '',
  phone: '',
  cargo: '',
  role: 'viewer',
  password: '',
})

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  const [filters, setFilters] = useState<CollaboratorFilters>({
    search: '',
    role: '',
    status: '',
  })

  const [form, setForm] = useState<CollaboratorFormData>(initialForm())
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [selectedCollaborator, setSelectedCollaborator] =
    useState<Collaborator | null>(null)

  const [permissions, setPermissions] = useState<
    CollaboratorPermission[]
  >([])

  const [loading, setLoading] = useState(false)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadCollaborators = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await listCollaborators(filters)
      setCollaborators(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os colaboradores.',
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)

      try {
        const result = await listCollaborators(filters)

        if (active) {
          setCollaborators(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os colaboradores.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [filters])

  function handleFilterChange<K extends keyof CollaboratorFilters>(
    field: K,
    value: CollaboratorFilters[K],
  ) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function startCreate() {
    setEditingId('')
    setForm(initialForm())
    setSelectedCollaborator(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function startEdit(collaborator: Collaborator) {
    setEditingId(collaborator.id)

    setForm({
      name: collaborator.name,
      cpf: collaborator.cpf,
      email: collaborator.email,
      phone: collaborator.phone ?? '',
      cargo: collaborator.cargo ?? '',
      role: collaborator.role,
      password: '',
    })

    setSelectedCollaborator(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  async function handleSubmit() {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        await updateCollaborator(editingId, form)
        setSuccess('Colaborador atualizado com sucesso.')
      } else {
        await createCollaborator(form)
        setSuccess('Colaborador cadastrado com sucesso.')
      }

      setShowForm(false)
      setEditingId('')
      setForm(initialForm())

      await loadCollaborators()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o colaborador.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(collaborator: Collaborator) {
    const nextStatus: CollaboratorStatus =
      collaborator.status === 'active' ? 'inactive' : 'active'

    const action =
      nextStatus === 'active' ? 'ativar' : 'desativar'

    const confirmed = window.confirm(
      `Deseja ${action} o acesso de "${collaborator.name}"?`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await updateCollaboratorStatus(collaborator.id, nextStatus)

      setSuccess(
        nextStatus === 'active'
          ? 'Colaborador ativado com sucesso.'
          : 'Colaborador desativado com sucesso.',
      )

      await loadCollaborators()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível alterar a situação.',
      )
    }
  }

  async function handlePermissions(collaborator: Collaborator) {
    setSelectedCollaborator(collaborator)
    setShowForm(false)
    setPermissions([])
    setLoadingPermissions(true)
    setError('')

    try {
      const result = await listCollaboratorPermissions(
        collaborator.role as CollaboratorRole,
      )

      setPermissions(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as permissões.',
      )
    } finally {
      setLoadingPermissions(false)
    }
  }

  return (
    <div className="admin-module-page collaborators-page">
      <AdminPageHeader
        title="Colaboradores"
        description="Gerenciamento dos colaboradores e suas permissões."
      />

      {error && (
        <div className="collaborators-message error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="collaborators-message success">
          <span>{success}</span>
        </div>
      )}

      <CollaboratorsFilters
        search={filters.search}
        role={filters.role}
        status={filters.status}
        onSearchChange={(value) => handleFilterChange('search', value)}
        onRoleChange={(value) => handleFilterChange('role', value)}
        onStatusChange={(value) => handleFilterChange('status', value)}
      />

      <div className="collaborators-toolbar">
        <div>
          <strong>Equipe de administração</strong>
          <small>
            {collaborators.length === 1
              ? '1 colaborador encontrado'
              : `${collaborators.length} colaboradores encontrados`}
          </small>
        </div>

        <div className="collaborators-toolbar-actions">
          <button
            type="button"
            className="collaborators-button secondary"
            onClick={() => void loadCollaborators()}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? 'is-spinning' : ''}
            />
            Atualizar
          </button>

          <button
            type="button"
            className="collaborators-button primary"
            onClick={startCreate}
          >
            <Plus size={17} />
            Novo colaborador
          </button>
        </div>
      </div>

      {showForm && (
        <CollaboratorForm
          form={form}
          editing={Boolean(editingId)}
          saving={saving}
          onChange={setForm}
          onSubmit={() => void handleSubmit()}
          onCancel={() => setShowForm(false)}
        />
      )}

      {selectedCollaborator && (
        <CollaboratorPermissions
          collaborator={selectedCollaborator}
          permissions={permissions}
          loading={loadingPermissions}
          onClose={() => setSelectedCollaborator(null)}
        />
      )}

      <section className="collaborator-panel">
        <div className="collaborator-panel-header">
          <div>
            <h2>Colaboradores cadastrados</h2>
            <p>Contas com acesso administrativo ao SITE ESPORTE.</p>
          </div>

          <Users size={21} />
        </div>

        <CollaboratorsList
          collaborators={collaborators}
          loading={loading}
          onEdit={startEdit}
          onStatusChange={(collaborator) =>
            void handleStatusChange(collaborator)
          }
          onPermissions={(collaborator) =>
            void handlePermissions(collaborator)
          }
        />
      </section>
    </div>
  )
}
