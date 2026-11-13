
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { authService } from '../../../../services/auth/authService'
import type { AuthenticatedUser } from '../../../../lib/api'

import {
  Activity,
  BarChart3,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Trophy,
  UserRound,
  UserRoundCog,
  Users,
  X,
} from 'lucide-react'

import '../../../../styles/admin/AdminSidebar.css'

const navigation = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Dashboard', permissions: ['standings.read'],
        path: '/admin',
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    title: 'Campeonato',
    items: [
      { label: 'Campeonatos', path: '/admin/campeonatos', icon: Trophy, permissions: ['championships.manage'] },
      { label: 'Temporadas', path: '/admin/temporadas', icon: CalendarDays, permissions: ['seasons.manage'] },
      { label: 'Regulamentos', path: '/admin/regulamentos', icon: FileText, permissions: ['regulations.manage'] },
      { label: 'Equipes', path: '/admin/equipes', icon: Shield, permissions: ['teams.manage'] },
      { label: 'Jogadores', path: '/admin/jogadores', icon: Users, permissions: ['players.manage'] },
      { label: 'Inscrições e elencos', path: '/admin/inscricoes', icon: UserRound, permissions: ['players.manage', 'teams.manage'] },
      { label: 'Fases e grupos', path: '/admin/fases', icon: Activity, permissions: ['matches.manage', 'matches.update_live'] },
      { label: 'Partidas', path: '/admin/partidas', icon: CalendarClock, permissions: ['matches.manage', 'matches.update_live'] },
      { label: 'Classificação', path: '/admin/classificacao', icon: BarChart3, permissions: ['standings.read'] },
      { label: 'Histórico de títulos', path: '/admin/titulos', icon: Trophy, permissions: ['titles.manage'] },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Colaboradores', path: '/admin/colaboradores', icon: UserRoundCog, permissions: ['collaborators.manage'] },
      { label: 'Auditoria', path: '/admin/auditoria', icon: ClipboardList, permissions: ['audit.read'] },
      { label: 'Configurações', path: '/admin/configuracoes', icon: Settings, ownerOnly: true },
    ],
  },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    authService.currentUser().then((current) => { if (active) setUser(current) }).catch(() => undefined)
    return () => { active = false }
  }, [])

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await authService.logout()
      navigate('/login', { replace: true })
    } catch {
      // A falha de rede não deve gerar rejeição não tratada na interface.
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-symbol">
            <Trophy size={25} />
          </div>

          <div className="brand-text">
            <strong>ESPORTE VARGINHA</strong>
            <span>PAINEL ADMINISTRATIVO</span>
          </div>

          <button
            type="button"
            className="mobile-close"
            onClick={onClose}
            aria-label="Fechar navegação"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-navigation" aria-label="Navegação administrativa">
          {navigation.map((section) => {
            const visibleItems = section.items.filter((item) => {
              if ('ownerOnly' in item && item.ownerOnly) return user?.role === 'owner' || user?.role === 'admin'
              if (!('permissions' in item) || !item.permissions) return true
              return item.permissions.some((permission) => user?.role === 'owner' || user?.permissions?.includes(permission))
            })
            if (!visibleItems.length) return null
            return <div className="navigation-section" key={section.title}>
              <span className="navigation-title">{section.title}</span>

              {visibleItems.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={'end' in item ? item.end : false}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `navigation-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          })}
        </nav>

        <NavLink
          to="/admin/perfil"
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar-profile ${isActive ? 'active' : ''}`
          }
        >
          <div className="profile-avatar">
            <UserRound size={25} />
          </div>

          <div className="profile-information">
            <strong>{user?.name || 'Perfil do usuário'}</strong>
            <span>{user?.email || 'Minha conta'}</span>
          </div>

          <UserRoundCog size={18} />
        </NavLink>

        <button type="button" className="sidebar-logout" onClick={handleLogout} disabled={loggingOut}>
          <LogOut size={18} />
          <span>{loggingOut ? 'Saindo...' : 'Sair do sistema'}</span>
        </button>
      </aside>
    </>
  )
}
