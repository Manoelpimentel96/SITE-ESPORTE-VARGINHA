
import type {
  StandingsChampionshipOption,
  StandingsGroupOption,
  StandingsPhaseOption,
  StandingsSeasonOption,
  StandingsMode,
} from '../../../../../backend/modules/standings/standings.types'

interface StandingsFiltersProps {
  championships: StandingsChampionshipOption[]
  seasons: StandingsSeasonOption[]
  phases: StandingsPhaseOption[]
  groups: StandingsGroupOption[]
  championshipId: string
  seasonId: string
  phaseId: string
  groupId: string
  mode: StandingsMode
  loading: boolean
  onChampionshipChange: (value: string) => void
  onSeasonChange: (value: string) => void
  onPhaseChange: (value: string) => void
  onGroupChange: (value: string) => void
  onModeChange: (value: StandingsMode) => void
}

export default function StandingsFilters({
  championships,
  seasons,
  phases,
  groups,
  championshipId,
  seasonId,
  phaseId,
  groupId,
  mode,
  loading,
  onChampionshipChange,
  onSeasonChange,
  onPhaseChange,
  onGroupChange,
  onModeChange,
}: StandingsFiltersProps) {
  return (
    <section className="standings-filters">
      <label>
        Campeonato
        <select
          value={championshipId}
          onChange={(event) => onChampionshipChange(event.target.value)}
          disabled={loading}
        >
          <option value="">Selecione o campeonato</option>
          {championships.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Temporada
        <select
          value={seasonId}
          onChange={(event) => onSeasonChange(event.target.value)}
          disabled={!championshipId || loading}
        >
          <option value="">Selecione a temporada</option>
          {seasons.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Fase
        <select
          value={phaseId}
          onChange={(event) => onPhaseChange(event.target.value)}
          disabled={!seasonId || loading}
        >
          <option value="">Todas as fases</option>
          {phases.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Grupo
        <select
          value={groupId}
          onChange={(event) => onGroupChange(event.target.value)}
          disabled={!phaseId || loading}
        >
          <option value="">Todos os grupos</option>
          {groups.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tipo de classificação
        <select
          value={mode}
          onChange={(event) =>
            onModeChange(event.target.value as StandingsMode)
          }
          disabled={!seasonId || loading}
        >
          <option value="official">Classificação oficial</option>
          <option value="provisional">Classificação provisória</option>
        </select>
      </label>
    </section>
  )
}
