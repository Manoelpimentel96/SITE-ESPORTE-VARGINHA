
import type {
  StageChampionshipOption,
  StageSeasonOption,
} from '../../../../../backend/modules/stages/stages.types'

interface StagesFiltersProps {
  championships: StageChampionshipOption[]
  seasons: StageSeasonOption[]
  championshipId: string
  seasonId: string
  loading: boolean
  onChampionshipChange: (value: string) => void
  onSeasonChange: (value: string) => void
}

export default function StagesFilters({
  championships,
  seasons,
  championshipId,
  seasonId,
  loading,
  onChampionshipChange,
  onSeasonChange,
}: StagesFiltersProps) {
  return (
    <section className="stages-filters">
      <label className="stages-field">
        <span>Campeonato</span>
        <select
          value={championshipId}
          onChange={(event) => onChampionshipChange(event.target.value)}
          disabled={loading}
        >
          <option value="">Selecione o campeonato</option>
          {championships.map((championship) => (
            <option key={championship.id} value={championship.id}>
              {championship.name}
            </option>
          ))}
        </select>
      </label>

      <label className="stages-field">
        <span>Temporada</span>
        <select
          value={seasonId}
          onChange={(event) => onSeasonChange(event.target.value)}
          disabled={!championshipId || loading}
        >
          <option value="">Selecione a temporada</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
