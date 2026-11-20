import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AdminRoutes from './frontend/routes/AdminRoutes'
import AppRoutes from './frontend/routes/AppRoutes'
import PublicRoutes from './frontend/routes/PublicRoutes'

function App() {
  const mode = import.meta.env.VITE_APP_MODE
  useEffect(() => {
    if (mode === 'admin') {
      document.title = 'Administração | SITE ESPORTE'
      let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots) }
      robots.content = 'noindex,nofollow'
    } else {
      document.title = 'SITE ESPORTE | Competições esportivas'
    }
  }, [mode])
  return <BrowserRouter>
    {mode === 'public' ? <PublicRoutes /> : mode === 'admin' ? <AdminRoutes /> : <AppRoutes />}
  </BrowserRouter>
}

export default App
