
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import type { PasswordFormData } from '../ProfilePage'

interface ProfileSecurityFormProps {
  data: PasswordFormData
  message: string
  onChange: (field: keyof PasswordFormData, value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function ProfileSecurityForm({
  data,
  message,
  onChange,
  onSubmit,
}: ProfileSecurityFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <form className="profile-form" onSubmit={onSubmit}>
      <div className="profile-security__intro">
        <div className="profile-security__icon">
          <ShieldCheck size={22} />
        </div>

        <div>
          <strong>Proteja sua conta</strong>
          <p>
            Utilize uma senha segura e não compartilhe suas credenciais
            de acesso.
          </p>
        </div>
      </div>

      <div className="profile-form__grid profile-form__grid--security">
        <div className="profile-field profile-field--full">
          <label htmlFor="profile-current-password">Senha atual</label>

          <div className="profile-password-input">
            <LockKeyhole size={17} />

            <input
              id="profile-current-password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={data.currentPassword}
              onChange={(event) =>
                onChange('currentPassword', event.target.value)
              }
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
            />

            <button
              type="button"
              className="profile-password-input__toggle"
              onClick={() =>
                setShowCurrentPassword((current) => !current)
              }
              aria-label={showCurrentPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="profile-field">
          <label htmlFor="profile-new-password">Nova senha</label>

          <div className="profile-password-input">
            <LockKeyhole size={17} />

            <input
              id="profile-new-password"
              type={showNewPassword ? 'text' : 'password'}
              value={data.newPassword}
              onChange={(event) =>
                onChange('newPassword', event.target.value)
              }
              placeholder="Digite a nova senha"
              autoComplete="new-password"
            />

            <button
              type="button"
              className="profile-password-input__toggle"
              onClick={() => setShowNewPassword((current) => !current)}
              aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="profile-field">
          <label htmlFor="profile-confirm-password">
            Confirmar nova senha
          </label>

          <div className="profile-password-input">
            <LockKeyhole size={17} />

            <input
              id="profile-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={data.confirmPassword}
              onChange={(event) =>
                onChange('confirmPassword', event.target.value)
              }
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />

            <button
              type="button"
              className="profile-password-input__toggle"
              onClick={() =>
                setShowConfirmPassword((current) => !current)
              }
              aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="profile-form__message" role="status">
          {message}
        </div>
      )}

      <div className="profile-form__actions">
        <button type="submit" className="profile-button">
          <LockKeyhole size={17} />
          Alterar senha
        </button>
      </div>
    </form>
  )
}
