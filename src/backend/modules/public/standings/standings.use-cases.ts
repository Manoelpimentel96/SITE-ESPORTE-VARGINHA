import { requireId } from '../public.validation.js'
import type { PublicTeam } from '../teams/teams.types.js'
import type { PublicMatch } from '../matches/matches.types.js'
import type { StandingsRepository } from './standings.repository.js'
import type { PublicStanding } from './standings.types.js'

// Regras da página pública: Classificação.

export function calculateStandings(
  teams: PublicTeam[],
  matches: PublicMatch[],
): PublicStanding[] {
  const table = new Map<string, PublicStanding>()

  // Inicializa todas as equipes com zero.
  for (const team of teams) {
    table.set(team.registrationId, {
      position: 0,
      registrationId: team.registrationId,
      teamId: team.teamId,
      teamName: team.name,
      crestUrl: team.crestUrl,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    })
  }

  // Processa partidas ao vivo e encerradas.
  for (const match of matches) {
    if (
      match.status !== 'live' &&
      match.status !== 'finished'
    ) {
      continue
    }

    if (
      match.homeScore == null ||
      match.awayScore == null
    ) {
      continue
    }

    const home = table.get(match.homeRegistrationId)
    const away = table.get(match.awayRegistrationId)

    if (!home || !away) continue

    // Jogos disputados.
    home.played += 1
    away.played += 1

    // Gols pró e gols contra.
    home.goalsFor += match.homeScore
    home.goalsAgainst += match.awayScore

    away.goalsFor += match.awayScore
    away.goalsAgainst += match.homeScore

    // Pontuação e resultados.
    if (match.homeScore > match.awayScore) {
      home.wins += 1
      home.points += 3

      away.losses += 1
    } else if (match.homeScore < match.awayScore) {
      away.wins += 1
      away.points += 3

      home.losses += 1
    } else {
      home.draws += 1
      away.draws += 1

      home.points += 1
      away.points += 1
    }
  }

  // Calcula o saldo de gols.
  const rows = [...table.values()].map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }))

  // Critérios de classificação:
  // 1. Maior pontuação.
  // 2. Maior saldo de gols.
  // 3. Maior número de gols pró.
  // 4. Ordem alfabética do nome da equipe.
  rows.sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.teamName.localeCompare(b.teamName, 'pt-BR'),
  )

  // Define a posição de cada equipe.
  return rows.map((row, index) => ({
    ...row,
    position: index + 1,
  }))
}

export function createStandingsUseCases(
  repository: StandingsRepository,
) {
  async function getStandings(
    seasonId: string,
  ): Promise<PublicStanding[]> {
    const id = requireId(seasonId, 'Temporada')

    // Busca novamente as equipes e partidas no repositório.
    // O repositório consulta o Supabase.
    const [teams, matches] = await Promise.all([
      repository.listTeams(id),
      repository.listMatches(id),
    ])

    return calculateStandings(teams, matches)
  }

  return {
    getStandings,
  }
}
