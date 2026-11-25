import type { MatchesRepository } from '../matches/matches.repository.js'
import type { TeamsRepository } from '../teams/teams.repository.js'
import type { PublicPlayerEvent } from './statistics.types.js'

/** Dados de que a página Estatísticas usa. */
export interface StatisticsRepository
  extends Pick<TeamsRepository, 'listTeams'>,
    Pick<MatchesRepository, 'listMatches'> {
  /** Quantidade de jogadores inscritos (ativos) na temporada. */
  countPlayers(seasonId: string): Promise<number>

  /**
   * Gols com jogador informado (modelo anterior da artilharia).
   * Não é mais usado pelas estatísticas; mantido por compatibilidade.
   */
  listScorerEvents(seasonId: string): Promise<Array<{
    playerId: string
    playerName: string
    teamName: string
  }>>

  /**
   * Eventos da temporada usados nas estatísticas por jogador:
   * gols, gols de pênalti, cartões amarelos e cartões vermelhos.
   */
  listPlayerEvents(seasonId: string): Promise<PublicPlayerEvent[]>
}
