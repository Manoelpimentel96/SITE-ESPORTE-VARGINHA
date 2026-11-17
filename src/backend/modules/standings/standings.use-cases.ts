
import type {
  StandingsFilters,
  StandingsMatch,
  StandingsRegistration,
  StandingsRepository,
  StandingsRow,
  StandingsRules,
} from './standings.types.js'

import { validateStandingsFilters } from './standings.validation.js'

function createEmptyRow(
  registration: StandingsRegistration,
): StandingsRow {
  return {
    position: 0,
    team: registration.team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    yellowCards: 0,
    redCards: 0,
  }
}

function compareRows(
  a: StandingsRow,
  b: StandingsRow,
  rules: StandingsRules,
): number {
  for (const criterion of rules.tieBreakers) {
    let difference = 0

    switch (criterion) {
      case 'points':
        difference = b.points - a.points
        break
      case 'wins':
        difference = b.wins - a.wins
        break
      case 'goal_difference':
        difference = b.goalDifference - a.goalDifference
        break
      case 'goals_for':
        difference = b.goalsFor - a.goalsFor
        break
      case 'fewest_goals_against':
        difference = a.goalsAgainst - b.goalsAgainst
        break
      case 'fewest_losses':
        difference = a.losses - b.losses
        break
      case 'fair_play':
        difference =
          (a.yellowCards + a.redCards * 3) -
          (b.yellowCards + b.redCards * 3)
        break
      case 'head_to_head':
        // O confronto direto exige cálculo específico entre equipes empatadas.
        // Será aplicado quando a regra e os confrontos estiverem disponíveis.
        difference = 0
        break
    }

    if (difference !== 0) return difference
  }

  return a.team.name.localeCompare(b.team.name)
}

function calculateStandings(
  matches: StandingsMatch[],
  registrations: StandingsRegistration[],
  rules: StandingsRules,
  filters: StandingsFilters,
): StandingsRow[] {
  const rows = new Map<string, StandingsRow>()

  for (const registration of registrations) {
    rows.set(registration.id, createEmptyRow(registration))
  }

  const relevantMatches = matches.filter((match) => {
    if (match.seasonId !== filters.seasonId) return false

    if (filters.phaseId && match.phaseId !== filters.phaseId) {
      return false
    }

    if (filters.groupId && match.groupId !== filters.groupId) {
      return false
    }

    if (filters.mode === 'official') {
      return match.status === 'finished'
    }

    return match.status === 'finished' || match.status === 'live'
  })

  for (const match of relevantMatches) {
    const home = rows.get(match.homeRegistrationId)
    const away = rows.get(match.awayRegistrationId)

    if (!home || !away) continue

    home.played += 1
    away.played += 1

    home.goalsFor += match.homeScore
    home.goalsAgainst += match.awayScore

    away.goalsFor += match.awayScore
    away.goalsAgainst += match.homeScore

    if (match.homeScore > match.awayScore) {
      home.wins += 1
      away.losses += 1
      home.points += rules.pointsPerWin
      away.points += rules.pointsPerLoss
    } else if (match.homeScore < match.awayScore) {
      away.wins += 1
      home.losses += 1
      away.points += rules.pointsPerWin
      home.points += rules.pointsPerLoss
    } else {
      home.draws += 1
      away.draws += 1
      home.points += rules.pointsPerDraw
      away.points += rules.pointsPerDraw
    }
  }

  const result = Array.from(rows.values())

  for (const row of result) {
    row.goalDifference = row.goalsFor - row.goalsAgainst
  }

  result.sort((a, b) => compareRows(a, b, rules))

  return result.map((row, index) => ({
    ...row,
    position: index + 1,
  }))
}

export function createStandingsUseCases(
  repository: StandingsRepository,
) {
  async function getStandings(filters: StandingsFilters) {
    const validationError = validateStandingsFilters(filters)

    if (validationError) {
      throw new Error(validationError)
    }

    const [
      matches,
      registrations,
      rules,
      events,
    ] = await Promise.all([
      repository.listMatches(filters.seasonId),
      repository.listRegistrations(filters.seasonId),
      repository.getRules(filters.seasonId),
      repository.listMatchEvents(filters.seasonId),
    ])

    const rows = calculateStandings(
      matches,
      registrations,
      rules,
      filters,
    )

    const eventsByRegistration = new Map<
      string,
      { yellow: number; red: number }
    >()

    for (const event of events) {
      const current = eventsByRegistration.get(event.registrationId) ?? {
        yellow: 0,
        red: 0,
      }

      if (event.type === 'yellow_card') current.yellow += 1
      if (event.type === 'red_card') current.red += 1

      eventsByRegistration.set(event.registrationId, current)
    }

    for (const row of rows) {
      const registration = registrations.find(
        (item) => item.team.id === row.team.id,
      )

      if (!registration) continue

      const cards = eventsByRegistration.get(registration.id)

      row.yellowCards = cards?.yellow ?? 0
      row.redCards = cards?.red ?? 0
    }

    return rows
  }

  return {
    getStandings,
    listChampionships: () => repository.listChampionships(),
    listSeasons: (championshipId: string) =>
      repository.listSeasons(championshipId),
    listPhases: (seasonId: string) =>
      repository.listPhases(seasonId),
    listGroups: (phaseId: string) =>
      repository.listGroups(phaseId),
    subscribeToSeason: (
      seasonId: string,
      onChange: () => void,
    ) => repository.subscribeToSeason(seasonId, onChange),
  }
}
