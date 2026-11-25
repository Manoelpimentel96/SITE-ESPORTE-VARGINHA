// Tipos da página pública: Estatísticas.

/** Tipos de evento de partida usados nas estatísticas por jogador. */
export type PublicPlayerEventType =
  | 'goal'
  | 'penalty_goal'
  | 'yellow_card'
  | 'red_card'

/** Jogador identificado em um evento (nome e equipe da inscrição na temporada). */
export type PublicEventPlayer = {
  playerId: string
  name: string
  teamName: string
}

/**
 * Evento de partida com os jogadores já identificados.
 *
 * - player: autor do evento (quem fez o gol, quem recebeu o cartão).
 * - relatedPlayer: jogador relacionado; em um gol, quem deu a assistência.
 * Ambos podem ser nulos, pois o jogador é opcional no registro do evento.
 */
export type PublicPlayerEvent = {
  eventType: PublicPlayerEventType
  player: PublicEventPlayer | null
  relatedPlayer: PublicEventPlayer | null
}

/** Posição de um jogador em um ranking (artilharia, assistências, cartões). */
export type PublicStatLeader = {
  playerId: string
  name: string
  teamName: string
  total: number
}

/** Total geral de uma categoria e o ranking por jogador. */
export type PublicStatCategory = {
  /** Conta todos os eventos da categoria, inclusive os sem jogador informado. */
  total: number
  leaders: PublicStatLeader[]
}

/** Gols marcados e sofridos por equipe (partidas encerradas e ao vivo). */
export type PublicTeamGoals = {
  registrationId: string
  teamName: string
  matches: number
  goalsFor: number
  goalsAgainst: number
  /** Média de gols marcados por jogo (duas casas decimais). */
  goalsForPerMatch: number
  /** Média de gols sofridos por jogo (duas casas decimais). */
  goalsAgainstPerMatch: number
}

/**
 * Destaques entre as equipes, comparados pela média de gols por jogo
 * (assim equipes com números diferentes de jogos são comparadas de forma justa).
 * Ficam nulos enquanto menos de duas equipes tiverem partidas.
 */
export type PublicTeamHighlights = {
  /** Menor média de gols sofridos por jogo. */
  bestDefense: PublicTeamGoals | null
  /** Maior média de gols sofridos por jogo. */
  worstDefense: PublicTeamGoals | null
  /** Maior média de gols marcados por jogo. */
  bestAttack: PublicTeamGoals | null
  /** Menor média de gols marcados por jogo. */
  worstAttack: PublicTeamGoals | null
}

export type PublicStatistics = {
  /** Soma dos placares das partidas da temporada. */
  goals: number
  /** Média de gols por partida encerrada (0 quando não há partidas encerradas). */
  goalsPerMatch: number
  matchesPlayed: number
  teams: number
  players: number
  teamGoals: PublicTeamGoals[]
  teamHighlights: PublicTeamHighlights
  topScorers: PublicStatLeader[]
  assists: PublicStatCategory
  yellowCards: PublicStatCategory
  redCards: PublicStatCategory
}
