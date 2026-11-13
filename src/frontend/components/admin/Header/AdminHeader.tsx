
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

interface AdminHeaderProps {
  onOpenMenu: () => void
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/campeonatos': 'Campeonatos',
  '/admin/temporadas': 'Temporadas',
  '/admin/regulamentos': 'Regulamentos',
  '/admin/equipes': 'Equipes',
  '/admin/jogadores': 'Jogadores',
  '/admin/inscricoes': 'Inscrições e elencos',
  '/admin/fases': 'Fases e grupos',
  '/admin/partidas': 'Partidas',
  '/admin/classificacao': 'Classificação',
  '/admin/titulos': 'Histórico de títulos',
  '/admin/colaboradores': 'Colaboradores',
  '/admin/auditoria': 'Auditoria',
  '/admin/configuracoes': 'Configurações',
  '/admin/perfil': 'Meu perfil',
}

export default function AdminHeader({
  onOpenMenu,
}: AdminHeaderProps) {
  const location = useLocation()

  const pageTitle = pageTitles[location.pathname] ?? 'Administração'

  return (
    <header className="admin-header">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>

      <div className="header-information">
        <strong>{pageTitle}</strong>
        <span>Gerenciamento de Campeonatos</span>
      </div>
    </header>
  )
}
