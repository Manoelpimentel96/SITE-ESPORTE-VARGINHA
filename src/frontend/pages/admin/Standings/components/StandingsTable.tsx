
import type { StandingsRow } from '../../../../../backend/modules/standings/standings.types'

interface StandingsTableProps {
  rows: StandingsRow[]
  loading: boolean
}

export default function StandingsTable({
  rows,
  loading,
}: StandingsTableProps) {
  if (loading) {
    return (
      <div className="standings-feedback">
        Carregando classificação...
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="standings-feedback">
        Nenhum dado de classificação encontrado para os filtros selecionados.
      </div>
    )
  }

  return (
    <div className="standings-table-container">
      <table className="standings-table">
        <thead>
          <tr>
            <th className="position-column">POS</th>
            <th className="team-column">EQUIPE</th>
            <th>PJ</th>
            <th>V</th>
            <th>E</th>
            <th>D</th>
            <th>GP</th>
            <th>GC</th>
            <th>SG</th>
            <th className="points-column">PTS</th>
            <th>CA</th>
            <th>CV</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.team.id}>
              <td className="position-cell">{row.position}º</td>

              <td className="team-cell">
                <strong>{row.team.name}</strong>
              </td>

              <td>{row.played}</td>
              <td>{row.wins}</td>
              <td>{row.draws}</td>
              <td>{row.losses}</td>
              <td>{row.goalsFor}</td>
              <td>{row.goalsAgainst}</td>

              <td className={row.goalDifference < 0 ? 'negative' : ''}>
                {row.goalDifference > 0 ? '+' : ''}
                {row.goalDifference}
              </td>

              <td className="points-cell">{row.points}</td>
              <td>{row.yellowCards}</td>
              <td>{row.redCards}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
