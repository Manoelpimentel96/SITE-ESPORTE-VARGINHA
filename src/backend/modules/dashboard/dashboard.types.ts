export interface DashboardChampionship {
  id: string
  name: string
}

export interface DashboardSeason {
  id: string
  championshipId: string
  name: string
}

export interface DashboardFilters {
  championshipId: string
  seasonId: string
}

export interface DashboardStats {
  championships: number
  seasons: number
  teams: number
  players: number
  matches: number
  completedMatches: number
  upcomingMatches: number
  liveMatches: number
}

export interface DashboardTeam {
  id: string
  name: string
}

export interface DashboardMatch {
  id: string
  homeTeam: string
  awayTeam: string
  scheduledAt: string | null
  status: string
  homeScore: number | null
  awayScore: number | null
  city: string | null
}

export interface DashboardActivity {
  id: string
  userName: string
  action: string
  module: string
  description: string
  createdAt: string
}

export interface DashboardData {
  stats: DashboardStats
  liveMatches: DashboardMatch[]
  upcomingMatches: DashboardMatch[]
  recentResults: DashboardMatch[]
  activities: DashboardActivity[]
}

export interface DashboardRepository {
  listChampionships(): Promise<DashboardChampionship[]>
  listSeasons(championshipId: string): Promise<DashboardSeason[]>
  getDashboardData(filters: DashboardFilters): Promise<DashboardData>
}
