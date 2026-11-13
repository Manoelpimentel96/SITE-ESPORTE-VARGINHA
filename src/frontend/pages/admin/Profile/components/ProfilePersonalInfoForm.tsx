
import { Save } from 'lucide-react'

import type { ProfileFormData } from '../ProfilePage'

interface ProfilePersonalInfoFormProps {
  data: ProfileFormData
  message: string
  onChange: (field: keyof ProfileFormData, value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function ProfilePersonalInfoForm({
  data,
  message,
  onChange,
  onSubmit,
}: ProfilePersonalInfoFormProps) {
  return (
    <form className="profile-form" onSubmit={onSubmit}>
      <div className="profile-form__grid">
        <div className="profile-field profile-field--full">
          <label htmlFor="profile-name">Nome completo</label>
          <input
            id="profile-name"
            type="text"
            value={data.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Nome completo"
            autoComplete="name"
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-cpf">CPF</label>
          <input
            id="profile-cpf"
            type="text"
            value={data.cpf}
            onChange={(event) => onChange('cpf', event.target.value)}
            placeholder="000.000.000-00"
            autoComplete="off"
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-phone">Telefone</label>
          <input
            id="profile-phone"
            type="tel"
            value={data.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            placeholder="(00) 00000-0000"
            autoComplete="tel"
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-email">E-mail</label>
          <input
            id="profile-email"
            type="email"
            value={data.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-cargo">Cargo</label>
          <input
            id="profile-cargo"
            type="text"
            value={data.cargo}
            onChange={(event) => onChange('cargo', event.target.value)}
            placeholder="Cargo na organização"
          />
        </div>
      </div>

      {message && (
        <div className="profile-form__message" role="status">
          {message}
        </div>
      )}

      <div className="profile-form__actions">
        <button type="submit" className="profile-button">
          <Save size={17} />
          Salvar informações
        </button>
      </div>
    </form>
  )
}
