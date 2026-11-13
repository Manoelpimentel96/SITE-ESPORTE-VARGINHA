import type {
  DashboardChampionship,
  DashboardSeason,
} from '../../../../../backend/modules/dashboard/dashboard.types'

interface DashboardFiltersProps {
  championships: DashboardChampionship[]
  seasons: DashboardSeason[]
  championshipId: string
  seasonId: string
  onChampionshipChange: (value: string) => void
  onSeasonChange: (value: string) => void
}

export default function DashboardFilters({
  championships,
  seasons,
  championshipId,
  seasonId,
  onChampionshipChange,
  onSeasonChange,
}: DashboardFiltersProps) {
  return (
    <section className="dashboard-filters">
      <div className="dashboard-filter">
        <label htmlFor="dashboard-championship">
          Campeonato
        </label>

        <select
          id="dashboard-championship"
          value={championshipId}
          onChange={(event) =>
            onChampionshipChange(event.target.value)
          }
        >
          <option value="">Todos os campeonatos</option>

          {championships.map((championship) => (
            <option key={championship.id} value={championship.id}>
              {championship.name}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-filter">
        <label htmlFor="dashboard-season">
          Temporada
        </label>

        <select
          id="dashboard-season"
          value={seasonId}
          onChange={(event) => onSeasonChange(event.target.value)}
          disabled={seasons.length === 0}
        >
          <option value="">Todas as temporadas</option>

          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}
