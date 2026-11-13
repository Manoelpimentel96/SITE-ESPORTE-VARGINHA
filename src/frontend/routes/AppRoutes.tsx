import { Navigate, Route, Routes } from 'react-router-dom'

import AdminLayout from '../layouts/AdminLayout'
import LoginPage from '../pages/auth/LoginPage'

import AuditPage from '../pages/admin/Audit/AuditPage'
import ChampionshipFormPage from '../pages/admin/Championships/ChampionshipFormPage'
import ChampionshipsPage from '../pages/admin/Championships/ChampionshipsPage'
import CollaboratorsPage from '../pages/admin/Collaborators/CollaboratorsPage'
import DashboardPage from '../pages/admin/Dashboard/DashboardPage'
import MatchesPage from '../pages/admin/Matches/MatchesPage'
import PlayersPage from '../pages/admin/Players/PlayersPage'
import ProfilePage from '../pages/admin/Profile/ProfilePage'
import RegistrationsPage from '../pages/admin/Registrations/RegistrationsPage'
import RegulationsPage from '../pages/admin/Regulations/RegulationsPage'
import SeasonsPage from '../pages/admin/Seasons/SeasonsPage'
import SettingsPage from '../pages/admin/Settings/SettingsPage'
import StagesPage from '../pages/admin/Stages/StagesPage'
import StandingsPage from '../pages/admin/Standings/StandingsPage'
import TeamsPage from '../pages/admin/Teams/TeamsPage'
import TitlesPage from '../pages/admin/Titles/TitlesPage'

import ProtectedRoute from './ProtectedRoute'
import PublicRoutes from './PublicRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Portal público: consulta sem autenticação */}
      <Route path="/portal/*" element={<PublicRoutes />} />

      {/* Entrada principal */}
      <Route path="/" element={<Navigate to="/portal" replace />} />

      {/* Autenticação */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* Área administrativa */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />

          <Route
            path="campeonatos"
            element={<ChampionshipsPage />}
          />

          <Route
            path="campeonatos/novo"
            element={<ChampionshipFormPage />}
          />

          <Route
            path="campeonatos/:id/editar"
            element={<ChampionshipFormPage />}
          />

          <Route path="temporadas" element={<SeasonsPage />} />
          <Route path="regulamentos" element={<RegulationsPage />} />
          <Route path="equipes" element={<TeamsPage />} />
          <Route path="jogadores" element={<PlayersPage />} />
          <Route path="inscricoes" element={<RegistrationsPage />} />
          <Route path="fases" element={<StagesPage />} />
          <Route path="partidas" element={<MatchesPage />} />
          <Route path="classificacao" element={<StandingsPage />} />
          <Route path="titulos" element={<TitlesPage />} />
          <Route path="colaboradores" element={<CollaboratorsPage />} />
          <Route path="auditoria" element={<AuditPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Rotas inexistentes */}
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  )
}