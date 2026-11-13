
import { Search } from 'lucide-react'

import type {
  ChampionshipOption,
  MatchStatus,
  SeasonOption,
} from '../../../../../backend/modules/matches/matches.types'

interface MatchesFiltersProps {
  championships: ChampionshipOption[]
  seasons: SeasonOption[]

  championshipId: string
  selectedSeasonId: string
  search: string
  statusFilter: MatchStatus | 'all'

  onChampionshipChange: (value: string) => void
  onSeasonChange: (value: string) => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: MatchStatus | 'all') => void
}

export default function MatchesFilters({
  championships,
  seasons,
  championshipId,
  selectedSeasonId,
  search,
  statusFilter,
  onChampionshipChange,
  onSeasonChange,
  onSearchChange,
  onStatusChange,
}: MatchesFiltersProps) {
  return (
    <div className="matches-toolbar__filters">
      <label className="matches-field">
        <span>Campeonato</span>

        <select
          value={championshipId}
          onChange={(event) => onChampionshipChange(event.target.value)}
        >
          <option value="">Selecione o campeonato</option>

          {championships.map((championship) => (
            <option key={championship.id} value={championship.id}>
              {championship.name}
            </option>
          ))}
        </select>
      </label>

      <label className="matches-field">
        <span>Temporada</span>

        <select
          value={selectedSeasonId}
          onChange={(event) => onSeasonChange(event.target.value)}
          disabled={!championshipId}
        >
          <option value="">Todas as temporadas</option>

          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
      </label>

      <label className="matches-field matches-field--search">
        <span>Buscar partida</span>

        <div className="matches-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Equipe, cidade ou local..."
          />
        </div>
      </label>

      <label className="matches-field">
        <span>Status</span>

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusChange(event.target.value as MatchStatus | 'all')
          }
        >
          <option value="all">Todos os status</option>
          <option value="scheduled">Agendadas</option>
          <option value="live">Ao vivo</option>
          <option value="finished">Encerradas</option>
          <option value="postponed">Adiada</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </label>
    </div>
  )
}
