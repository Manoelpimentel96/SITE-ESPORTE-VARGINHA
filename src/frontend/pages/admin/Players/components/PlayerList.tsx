
import { Pencil, Trash2, UserRound } from 'lucide-react'

import type { Player } from '../../../../../services/players/playerService'

interface PlayerListProps {
  players: Player[]
  isLoading: boolean
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}

const positionLabels: Record<string, string> = {
  goalkeeper: 'Goleiro',
  defender: 'Defensor',
  midfielder: 'Meio-campista',
  forward: 'Atacante',
  other: 'Outra posição',
}

export default function PlayerList({
  players,
  isLoading,
  onEdit,
  onDelete,
}: PlayerListProps) {
  if (isLoading) {
    return <div className="player-list-feedback">Carregando jogadores...</div>
  }

  if (players.length === 0) {
    return (
      <div className="player-list-empty">
        <UserRound size={34} />
        <h3>Nenhum jogador encontrado</h3>
        <p>Os jogadores cadastrados serão apresentados nesta área.</p>
      </div>
    )
  }

  return (
    <div className="player-list">
      {players.map((player) => (
        <article className="player-card" key={player.id}>
          <div className="player-card-photo">
            {player.photoUrl ? (
              <img src={player.photoUrl} alt={player.fullName} />
            ) : (
              <UserRound size={25} />
            )}
          </div>

          <div className="player-card-info">
            <h3>{player.fullName}</h3>
            <p>
              {positionLabels[player.position ?? ''] ?? 'Posição não informada'}
              {player.shirtNumber !== null
                ? ` · Camisa ${player.shirtNumber}`
                : ''}
            </p>
            <span className={`player-status player-status-${player.status}`}>
              {player.status === 'active'
                ? 'Ativo'
                : player.status === 'suspended'
                  ? 'Suspenso'
                  : 'Inativo'}
            </span>
          </div>

          <div className="player-card-actions">
            <button
              type="button"
              title="Editar jogador"
              aria-label={`Editar ${player.fullName}`}
              onClick={() => onEdit(player)}
            >
              <Pencil size={17} />
            </button>

            <button
              type="button"
              className="player-delete-action"
              title="Excluir jogador"
              aria-label={`Excluir ${player.fullName}`}
              onClick={() => onDelete(player)}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
