
import type { PublicRepository } from './public.repository.js'

import type {
  PublicMatch,
  PublicOverview,
  PublicStanding,
  PublicStatistics,
  PublicTeam,
} from './public.types.js'

import {
  normalizeSearch,
  requireId,
} from './public.validation.js'

function calculateStandings(
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

export function createPublicUseCases(
  repository: PublicRepository,
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
    listChampionships: () =>
      repository.listChampionships(),

    listSeasons: (championshipId: string) =>
      repository.listSeasons(
        requireId(championshipId, 'Campeonato'),
      ),

    getSeason: (seasonId: string) =>
      repository.getSeason(
        requireId(seasonId, 'Temporada'),
      ),

    listTeams: (seasonId: string, search?: string) =>
      repository.listTeams(
        requireId(seasonId, 'Temporada'),
        normalizeSearch(search),
      ),

    listMatches: (seasonId: string) =>
      repository.listMatches(
        requireId(seasonId, 'Temporada'),
      ),

    listPlayers: (seasonId: string, search?: string) =>
      repository.listPlayers(
        requireId(seasonId, 'Temporada'),
        normalizeSearch(search),
      ),

    getTeamDetails: (
      seasonId: string,
      teamId: string,
    ) =>
      repository.getTeamDetails(
        requireId(seasonId, 'Temporada'),
        requireId(teamId, 'Equipe'),
      ),

    listPreviousSeasons: (championshipId: string) =>
      repository.listPreviousSeasons(
        requireId(championshipId, 'Campeonato'),
      ),

    getStandings,

    async getOverview(
      seasonId: string,
    ): Promise<PublicOverview> {
      const id = requireId(seasonId, 'Temporada')

      const [teams, matches] = await Promise.all([
        repository.listTeams(id),
        repository.listMatches(id),
      ])

      const finished = matches.filter(
        (match) => match.status === 'finished',
      )

      const upcoming = matches.filter(
        (match) => match.status === 'scheduled',
      )

      return {
        teamsCount: teams.length,
        matchesCount: matches.length,
        finishedCount: finished.length,
        upcomingCount: upcoming.length,

        latestResults: [...finished]
          .sort((a, b) =>
            (b.scheduledAt ?? '').localeCompare(
              a.scheduledAt ?? '',
            ),
          )
          .slice(0, 4),

        upcomingMatches: upcoming.slice(0, 4),

        standings: calculateStandings(
          teams,
          matches,
        ).slice(0, 8),
      }
    },

    async getStatistics(
      seasonId: string,
    ): Promise<PublicStatistics> {
      const id = requireId(seasonId, 'Temporada')

      const [
        matches,
        teams,
        players,
        scorerEvents,
      ] = await Promise.all([
        repository.listMatches(id),
        repository.listTeams(id),
        repository.countPlayers(id),
        repository.listScorerEvents(id),
      ])

      const scorerMap = new Map<
        string,
        {
          playerId: string
          name: string
          teamName: string
          goals: number
        }
      >()

      for (const event of scorerEvents) {
        if (!event.playerId) continue

        const current = scorerMap.get(event.playerId) ?? {
          playerId: event.playerId,
          name: event.playerName,
          teamName: event.teamName,
          goals: 0,
        }

        current.goals += 1

        scorerMap.set(event.playerId, current)
      }

      return {
        goals: scorerEvents.length,

        matchesPlayed: matches.filter(
          (match) => match.status === 'finished',
        ).length,

        teams: teams.length,
        players,

        topScorers: [...scorerMap.values()]
          .sort((a, b) =>
            b.goals - a.goals ||
            a.name.localeCompare(b.name, 'pt-BR'),
          )
          .slice(0, 10),
      }
    },
  }
}
