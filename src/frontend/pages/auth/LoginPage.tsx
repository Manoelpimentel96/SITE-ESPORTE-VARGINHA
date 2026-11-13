import { Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { LoginMode } from './components/LoginForm'
import LoginForm from './components/LoginForm'

import { authService } from '../../../services/auth/authService'

import '../../../styles/auth/LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const mode: LoginMode =
    searchParams.get('mode') === 'recovery' ? 'recovery' : 'login'

  const tokenHash = searchParams.get('token_hash')
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')
  const isRecovery =
    searchParams.get('type') === 'recovery' ||
    hashParams.get('type') === 'recovery'
  const recoveryLinkError =
    isRecovery && !tokenHash && (!accessToken || !refreshToken)

  // O estado inicial já considera o link de recuperação, sem setState síncrono no effect.
  const [isLoading, setIsLoading] = useState(
    isRecovery && !recoveryLinkError,
  )
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isRecovery || recoveryLinkError) return

    let active = true
    const establishSession = tokenHash
      ? authService.verifyRecoveryToken(tokenHash)
      : authService.establishRecoverySession(accessToken!, refreshToken!)

    establishSession
      .then(() => {
        if (!active) return

        window.history.replaceState(
          {},
          document.title,
          `${window.location.pathname}?mode=recovery`,
        )
        setSearchParams({ mode: 'recovery' })
        setMessage('Link validado. Cadastre sua nova senha.')
      })
      .catch((reason: unknown) => {
        if (!active) return

        setError(
          reason instanceof Error
            ? reason.message
            : 'Link de recuperação inválido.',
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [
    isRecovery,
    recoveryLinkError,
    tokenHash,
    accessToken,
    refreshToken,
    setSearchParams,
  ])

  function changeMode(nextMode: LoginMode) {
    setMessage('')
    setError('')

    if (nextMode === 'recovery') {
      setSearchParams({ mode: 'recovery' })
      return
    }

    setSearchParams({})
  }

  async function handleLogin(email: string, password: string) {
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      await authService.login({ email, password })
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível realizar o login.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRecovery(email: string) {
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      await authService.requestPasswordRecovery({ email })

      setMessage(
        'Se o e-mail estiver cadastrado, você receberá as instruções para recuperar sua senha.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível solicitar a recuperação da senha.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdatePassword(password: string) {
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      await authService.updatePassword({ password })

      setSearchParams({})
      setMessage('Senha atualizada com sucesso. Faça login novamente.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar sua senha.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-brand-content">
          <div className="login-logo">
            <Trophy size={38} />
          </div>

          <h1>SITE ESPORTE</h1>
          <p>Esporte, comunidade e tradição.</p>

          <div className="login-brand-footer">
            GESTÃO DE COMPETIÇÕES ESPORTIVAS
          </div>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-mobile-logo">
          <Trophy size={30} />
          <span>SITE ESPORTE</span>
        </div>

        <LoginForm
          mode={mode}
          isLoading={isLoading}
          message={message}
          error={error || (recoveryLinkError ? 'O link de recuperação é inválido ou expirou.' : '')}
          onLogin={handleLogin}
          onRecover={handleRecovery}
          onUpdatePassword={handleUpdatePassword}
          onChangeMode={changeMode}
        />

        <footer className="login-footer">
          <span>
            © {new Date().getFullYear()} SITE ESPORTE. Todos os direitos
            reservados.
          </span>

          <span className="login-developer">
            Desenvolvido por <strong>Manoel Pimentel </strong>
          </span>
        </footer>
      </section>
    </main>
  )
}
