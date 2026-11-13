import { useState } from 'react'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowLeft,
} from 'lucide-react'

export type LoginMode = 'login' | 'forgot' | 'recovery'

interface LoginFormProps {
  mode: LoginMode
  isLoading: boolean
  message: string
  error: string
  onLogin: (email: string, password: string) => void
  onRecover: (email: string) => void
  onUpdatePassword: (password: string) => void
  onChangeMode: (mode: LoginMode) => void
}

export default function LoginForm({
  mode,
  isLoading,
  message,
  error,
  onLogin,
  onRecover,
  onUpdatePassword,
  onChangeMode,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError('')

    if (mode === 'login') {
      onLogin(email, password)
      return
    }

    if (mode === 'forgot') {
      onRecover(email)
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('As senhas informadas não são iguais.')
      return
    }

    onUpdatePassword(password)
  }

  return (
    <div className="login-form-container">
      <div className="login-heading">
        <span className="login-eyebrow">
          ÁREA ADMINISTRATIVA
        </span>

        {mode === 'login' && (
          <>
            <h2>Bem-vindo de volta!</h2>
            <p>
              Entre com suas credenciais para acessar o painel
              administrativo.
            </p>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2>Recuperar senha</h2>
            <p>
              Informe seu e-mail para receber as instruções de
              recuperação de acesso.
            </p>
          </>
        )}

        {mode === 'recovery' && (
          <>
            <h2>Nova senha</h2>
            <p>
              Cadastre uma nova senha para acessar o painel
              administrativo.
            </p>
          </>
        )}
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {mode !== 'recovery' && (
          <div className="login-field">
            <label htmlFor="email">E-mail</label>

            <div className="login-input-wrapper">
              <Mail size={19} />

              <input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="login-field">
            <div className="login-label-row">
              <label htmlFor="password">Senha</label>

              <button
                type="button"
                className="login-forgot-link"
                onClick={() => onChangeMode('forgot')}
              >
                Esqueceu sua senha?
              </button>
            </div>

            <div className="login-input-wrapper">
              <LockKeyhole size={19} />

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? 'Ocultar senha' : 'Mostrar senha'
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>
        )}

        {mode === 'recovery' && (
          <>
            <div className="login-field">
              <label htmlFor="new-password">Nova senha</label>

              <div className="login-input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Ocultar senha' : 'Mostrar senha'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="confirm-password">
                Confirmar nova senha
              </label>

              <div className="login-input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Digite novamente sua senha"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmação'
                      : 'Mostrar confirmação'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {passwordError && (
          <div className="login-feedback login-feedback-error">
            {passwordError}
          </div>
        )}

        {error && (
          <div className="login-feedback login-feedback-error">
            {error}
          </div>
        )}

        {message && (
          <div className="login-feedback login-feedback-success">
            {message}
          </div>
        )}

        <button
          type="submit"
          className="login-submit-button"
          disabled={isLoading}
        >
          {isLoading
            ? 'Aguarde...'
            : mode === 'login'
              ? 'Entrar no painel'
              : mode === 'forgot'
                ? 'Enviar link de recuperação'
                : 'Salvar nova senha'}
        </button>
      </form>

      {mode !== 'login' && (
        <button
          type="button"
          className="login-back-button"
          onClick={() => onChangeMode('login')}
        >
          <ArrowLeft size={16} />
          Voltar para o login
        </button>
      )}

      <div className="login-security">
        <LockKeyhole size={15} />
        <span>
          Acesso exclusivo para colaboradores autorizados.
        </span>
      </div>
    </div>
  )
}
