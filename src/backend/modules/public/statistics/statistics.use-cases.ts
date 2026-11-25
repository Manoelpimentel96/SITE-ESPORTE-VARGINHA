import { requireId } from '../public.validation.js'
import type { PublicMatch } from '../matches/matches.types.js'
import type { StatisticsRepository } from './statistics.repository.js'
import type {
  PublicEventPlayer,
  PublicStatCategory,
  PublicStatistics,
  PublicStatLeader,
  PublicTeamGoals,
  PublicTeamHighlights,
} from './statistics.types.js'

// Regras da página pública: Estatísticas (gols, artilharia, assistências e cartões).

/**
 * Monta um ranking por jogador a partir de uma lista de jogadores (um item por evento).
 * Eventos sem jogador identificado são ignorados no ranking.
 * Ordena por total (maior primeiro) e, no empate, por nome.
 */
function buildLeaders(
  players: Array<PublicEventPlayer | null>,
  limit = 20,
): PublicStatLeader[] {
  const leaders = new Map<string, PublicStatLeader>()

  for (const player of players) {
    if (!player) continue

    const current = leaders.get(player.playerId) ?? {
      playerId: player.playerId,
      name: player.name,
      teamName: player.teamName,
      total: 0,
    }

    current.total += 1
    leaders.set(player.playerId, current)
  }

  return [...leaders.values()]
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, limit)
}

/** Total de uma categoria (todos os eventos) e o ranking dos jogadores identificados. */
function buildCategory(
  items: Array<{ player: PublicEventPlayer | null }>,
): PublicStatCategory {
  return {
    total: items.length,
    leaders: buildLeaders(items.map((item) => item.player)),
  }
}

/**
 * Gols marcados e sofridos por equipe, a partir do placar das partidas
 * encerradas e ao vivo. Ordena por gols marcados (e, no empate, menos gols sofridos).
 */
function calculateTeamGoals(matches: PublicMatch[]): PublicTeamGoals[] {
  const table = new Map<
    string,
    Omit<PublicTeamGoals, 'goalsForPerMatch' | 'goalsAgainstPerMatch'>
  >()

  function add(
    registrationId: string,
    teamName: string,
    goalsFor: number,
    goalsAgainst: number,
  ) {
    const current = table.get(registrationId) ?? {
      registrationId,
      teamName,
      matches: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    }

    current.matches += 1
    current.goalsFor += goalsFor
    current.goalsAgainst += goalsAgainst
    table.set(registrationId, current)
  }

  for (const match of matches) {
    if (match.status !== 'finished' && match.status !== 'live') continue

    const home = match.homeScore ?? 0
    const away = match.awayScore ?? 0

    add(match.homeRegistrationId, match.homeTeam, home, away)
    add(match.awayRegistrationId, match.awayTeam, away, home)
  }

  // Médias por jogo (toda equipe da tabela tem ao menos uma partida).
  const round = (value: number) => Math.round(value * 100) / 100

  return [...table.values()]
    .map((team) => ({
      ...team,
      goalsForPerMatch: round(team.goalsFor / team.matches),
      goalsAgainstPerMatch: round(team.goalsAgainst / team.matches),
    }))
    .sort(
      (a, b) =>
        b.goalsFor - a.goalsFor ||
        a.goalsAgainst - b.goalsAgainst ||
        a.teamName.localeCompare(b.teamName, 'pt-BR'),
    )
}

/**
 * Melhor e pior defesa e ataque entre as equipes.
 *
 * A comparação usa a média de gols por jogo, porque as equipes podem ter
 * disputado quantidades diferentes de partidas. No empate da média, vale o
 * total de gols e, depois, a ordem alfabética.
 * Com menos de duas equipes com partidas, não há o que comparar.
 */
function calculateTeamHighlights(
  teams: PublicTeamGoals[],
): PublicTeamHighlights {
  const byName = (a: PublicTeamGoals, b: PublicTeamGoals) =>
    a.teamName.localeCompare(b.teamName, 'pt-BR')

  const conceded = (team: PublicTeamGoals) => team.goalsAgainst / team.matches
  const scored = (team: PublicTeamGoals) => team.goalsFor / team.matches

  function pick(
    compare: (a: PublicTeamGoals, b: PublicTeamGoals) => number,
  ): PublicTeamGoals | null {
    if (teams.length < 2) return null

    return [...teams].sort(compare)[0] ?? null
  }

  return {
    bestDefense: pick(
      (a, b) =>
        conceded(a) - conceded(b) ||
        a.goalsAgainst - b.goalsAgainst ||
        byName(a, b),
    ),
    worstDefense: pick(
      (a, b) =>
        conceded(b) - conceded(a) ||
        b.goalsAgainst - a.goalsAgainst ||
        byName(a, b),
    ),
    bestAttack: pick(
      (a, b) =>
        scored(b) - scored(a) ||
        b.goalsFor - a.goalsFor ||
        byName(a, b),
    ),
    worstAttack: pick(
      (a, b) =>
        scored(a) - scored(b) ||
        a.goalsFor - b.goalsFor ||
        byName(a, b),
    ),
  }
}

export function createStatisticsUseCases(
  repository: StatisticsRepository,
) {
  return {
    async getStatistics(
      seasonId: string,
    ): Promise<PublicStatistics> {
      const id = requireId(seasonId, 'Temporada')

      const [
        matches,
        teams,
        players,
        playerEvents,
      ] = await Promise.all([
        repository.listMatches(id),
        repository.listTeams(id),
        repository.countPlayers(id),
        repository.listPlayerEvents(id),
      ])

      // Total de gols da temporada: soma dos placares das partidas, o mesmo placar
      // exibido no painel e usado na classificação. Ele já considera gols, gols de
      // pênalti e gols contra, e não depende de o gol ter um jogador informado
      // (a artilharia, sim, depende do jogador).
      const totalGoals = matches.reduce(
        (total, match) =>
          total + (match.homeScore ?? 0) + (match.awayScore ?? 0),
        0,
      )

      const finishedMatches = matches.filter(
        (match) => match.status === 'finished',
      )

      // Média de gols por partida encerrada (duas casas decimais).
      const finishedGoals = finishedMatches.reduce(
        (total, match) =>
          total + (match.homeScore ?? 0) + (match.awayScore ?? 0),
        0,
      )

      const goalsPerMatch =
        finishedMatches.length > 0
          ? Math.round((finishedGoals / finishedMatches.length) * 100) / 100
          : 0

      // Separa os eventos por categoria.
      const goalEvents = playerEvents.filter(
        (event) =>
          event.eventType === 'goal' || event.eventType === 'penalty_goal',
      )

      // Assistência: jogador relacionado em um gol de jogo corrido (não pênalti).
      const assistEvents = playerEvents
        .filter(
          (event) =>
            event.eventType === 'goal' && event.relatedPlayer !== null,
        )
        .map((event) => ({ player: event.relatedPlayer }))

      const yellowEvents = playerEvents.filter(
        (event) => event.eventType === 'yellow_card',
      )

      const redEvents = playerEvents.filter(
        (event) => event.eventType === 'red_card',
      )

      const teamGoals = calculateTeamGoals(matches)

      return {
        goals: totalGoals,
        goalsPerMatch,
        matchesPlayed: finishedMatches.length,
        teams: teams.length,
        players,
        teamGoals,
        teamHighlights: calculateTeamHighlights(teamGoals),
        topScorers: buildLeaders(goalEvents.map((event) => event.player)),
        assists: buildCategory(assistEvents),
        yellowCards: buildCategory(yellowEvents),
        redCards: buildCategory(redEvents),
      }
    },
  }
}
