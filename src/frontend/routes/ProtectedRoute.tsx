import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authService } from '../../services/auth/authService'

export default function ProtectedRoute() {
  const [state, setState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const location = useLocation()

  useEffect(() => {
    let active = true
    authService.currentUser()
      .then(() => { if (active) setState('authenticated') })
      .catch(() => { if (active) setState('unauthenticated') })
    return () => { active = false }
  }, [location.pathname])

  if (state === 'loading') {
    return <main className="auth-loading" role="status" aria-live="polite"><p>Verificando acesso...</p></main>
  }
  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
