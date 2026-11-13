
import { Navigate, Route, Routes } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout/PublicLayout'
import MatchesPage from '../pages/public/Matches/MatchesPage'
import OverviewPage from '../pages/public/Overview/OverviewPage'
import PlayersPage from '../pages/public/Players/PlayersPage'
import PreviousEditionsPage from '../pages/public/PreviousEditions/PreviousEditionsPage'
import StandingsPage from '../pages/public/Standings/StandingsPage'
import StatisticsPage from '../pages/public/Statistics/StatisticsPage'
import TeamDetailsPage from '../pages/public/TeamDetails/TeamDetailsPage'
import TeamsPage from '../pages/public/Teams/TeamsPage'

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="equipes" element={<TeamsPage />} />
        <Route path="equipes/:teamId" element={<TeamDetailsPage />} />
        <Route path="partidas" element={<MatchesPage />} />
        <Route path="classificacao" element={<StandingsPage />} />
        <Route path="jogadores" element={<PlayersPage />} />
        <Route path="estatisticas" element={<StatisticsPage />} />
        <Route path="edicoes-anteriores" element={<PreviousEditionsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  )
}
