
import { teamRepository } from './team.supabase'
import { validateTeam } from './team.validation'

import type {
  Team,
  TeamFormData,
  TeamListFilters,
  TeamResult,
} from './team.types'

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Ocorreu um erro inesperado ao processar a equipe.'
}

export async function listTeams(
  filters?: TeamListFilters,
): Promise<Team[]> {
  return teamRepository.list(filters)
}

export async function getTeam(id: string): Promise<Team | null> {
  return teamRepository.findById(id)
}

export async function saveTeam(
  data: TeamFormData,
): Promise<TeamResult> {
  const errors = validateTeam(data)

  if (errors.length > 0) {
    return {
      success: false,
      message: errors.join(' '),
    }
  }

  try {
    const existingTeam = data.id
      ? await teamRepository.findById(data.id)
      : null

    if (data.id && !existingTeam) {
      return {
        success: false,
        message: 'A equipe que você está tentando editar não foi encontrada.',
      }
    }

    const foundedYear = data.foundedYear.trim()
      ? Number(data.foundedYear)
      : null

    const teamData = {
      championshipId: data.championshipId,
      name: data.name.trim(),
      shortName: data.shortName.trim() || null,
      city: data.city.trim() || null,
      primaryColor: data.primaryColor || null,
      foundedYear,
      crestUrl: existingTeam?.crestUrl ?? null,
      status: existingTeam?.status ?? ('active' as const),
    }

    let team: Team

    if (data.id) {
      team = await teamRepository.update(data.id, teamData)
    } else {
      team = await teamRepository.create(teamData)
    }

    if (data.crest) {
      const crestUrl = await teamRepository.uploadCrest(
        data.crest,
        team.id,
      )

      team = await teamRepository.update(team.id, {
        crestUrl,
      })
    }

    if (data.seasonId) {
      await teamRepository.saveSeasonRegistration(team.id, data.seasonId)
    }

    if (data.president.trim()) {
      await teamRepository.saveStaff(team.id, null, 'president', data.president)
    } else {
      await teamRepository.deleteStaff(team.id, null, 'president')
    }

    if (data.seasonId && data.coach.trim()) {
      await teamRepository.saveStaff(team.id, data.seasonId, 'coach', data.coach)
    } else if (data.seasonId) {
      await teamRepository.deleteStaff(team.id, data.seasonId, 'coach')
    }

    return {
      success: true,
      message: data.id
        ? 'Equipe atualizada com sucesso.'
        : 'Equipe cadastrada com sucesso.',
      team,
    }
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    }
  }
}

export async function deleteTeam(id: string): Promise<TeamResult> {
  try {
    await teamRepository.delete(id)

    return {
      success: true,
      message: 'Equipe excluída com sucesso.',
    }
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    }
  }
}

export async function listChampionshipOptions() {
  return teamRepository.listChampionships()
}

export async function listSeasonOptions(championshipId: string) {
  if (!championshipId) {
    return []
  }

  return teamRepository.listSeasons(championshipId)
}
