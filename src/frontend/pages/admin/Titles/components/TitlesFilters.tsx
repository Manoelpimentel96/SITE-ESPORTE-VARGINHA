import type {
  TitleChampionshipOption,
  TitleSeasonOption,
} from '../../../../../backend/modules/titles/titles.types'

interface TitlesFiltersProps {
  championships: TitleChampionshipOption[]
  seasons: TitleSeasonOption[]
  championshipId: string
  seasonId: string
  loading: boolean
  onChampionshipChange: (value: string) => void
  onSeasonChange: (value: string) => void
}

export default function TitlesFilters({
  championships,
  seasons,
  championshipId,
  seasonId,
  loading,
  onChampionshipChange,
  onSeasonChange,
}: TitlesFiltersProps) {
  return (
    <section className="titles-filters">
      <div className="titles-field">
        <label htmlFor="titles-championship">Campeonato</label>

        <select
          id="titles-championship"
          value={championshipId}
          onChange={(event) => onChampionshipChange(event.target.value)}
          disabled={loading}
        >
          <option value="">Selecione um campeonato</option>

          {championships.map((championship) => (
            <option key={championship.id} value={championship.id}>
              {championship.name}
            </option>
          ))}
        </select>
      </div>

      <div className="titles-field">
        <label htmlFor="titles-season">Temporada</label>

        <select
          id="titles-season"
          value={seasonId}
          onChange={(event) => onSeasonChange(event.target.value)}
          disabled={!championshipId || loading}
        >
          <option value="">Selecione uma temporada</option>

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
