import type {
  CollaboratorFormData,
  CollaboratorRole,
} from '../../../../../backend/modules/collaborators/collaborators.types'

interface CollaboratorFormProps {
  form: CollaboratorFormData
  editing: boolean
  saving: boolean
  onChange: (form: CollaboratorFormData) => void
  onSubmit: () => void
  onCancel: () => void
}

const roles: { value: CollaboratorRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'organizer', label: 'Organizador' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Visualizador' },
]

export default function CollaboratorForm({
  form,
  editing,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: CollaboratorFormProps) {
  function updateField<K extends keyof CollaboratorFormData>(
    field: K,
    value: CollaboratorFormData[K],
  ) {
    onChange({
      ...form,
      [field]: value,
    })
  }

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)

    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  return (
    <section className="collaborator-panel">
      <div className="collaborator-panel-header">
        <div>
          <h2>{editing ? 'Editar colaborador' : 'Novo colaborador'}</h2>
          <p>
            Cadastre os dados pessoais e defina o perfil de acesso ao sistema.
          </p>
        </div>
      </div>

      <div className="collaborator-form">
        <div className="collaborator-field">
          <label htmlFor="collaborator-name">Nome completo</label>

          <input
            id="collaborator-name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            maxLength={150}
            disabled={saving}
            placeholder="Nome do colaborador"
          />
        </div>

        <div className="collaborator-field">
          <label htmlFor="collaborator-cpf">CPF</label>

          <input
            id="collaborator-cpf"
            value={form.cpf}
            onChange={(event) =>
              updateField('cpf', formatCpf(event.target.value))
            }
            maxLength={14}
            disabled={saving}
            placeholder="000.000.000-00"
          />
        </div>

        <div className="collaborator-field">
          <label htmlFor="collaborator-email">E-mail de acesso</label>

          <input
            id="collaborator-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            disabled={saving}
            placeholder="colaborador@email.com"
          />
        </div>

        <div className="collaborator-field">
          <label htmlFor="collaborator-phone">Telefone</label>

          <input
            id="collaborator-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            disabled={saving}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="collaborator-field">
          <label htmlFor="collaborator-cargo">Cargo / função</label>

          <input
            id="collaborator-cargo"
            value={form.cargo}
            onChange={(event) => updateField('cargo', event.target.value)}
            maxLength={100}
            disabled={saving}
            placeholder="Ex.: Coordenador de equipe"
          />
        </div>

        <div className="collaborator-field">
          <label htmlFor="collaborator-role">Perfil de acesso</label>

          <select
            id="collaborator-role"
            value={form.role}
            onChange={(event) =>
              updateField(
                'role',
                event.target.value as CollaboratorRole,
              )
            }
            disabled={saving}
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="collaborator-field full-width">
          <label htmlFor="collaborator-password">
            {editing ? 'Nova senha (opcional)' : 'Senha inicial'}
          </label>

          <input
            id="collaborator-password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              updateField('password', event.target.value)
            }
            disabled={saving}
            placeholder={
              editing
                ? 'Deixe vazio para manter a senha atual'
                : 'Mínimo de 12 caracteres'
            }
          />

          <small>
            A senha será encaminhada diretamente à operação segura de
            autenticação. Ela não será armazenada no perfil do colaborador.
          </small>
        </div>
      </div>

      <div className="collaborator-form-actions">
        <button
          type="button"
          className="collaborators-button secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="collaborators-button primary"
          onClick={onSubmit}
          disabled={saving}
        >
          {saving
            ? 'Salvando...'
            : editing
              ? 'Salvar alterações'
              : 'Cadastrar colaborador'}
        </button>
      </div>
    </section>
  )
}
