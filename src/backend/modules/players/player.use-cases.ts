
import { playerRepository } from './player.supabase'
import { validatePlayer } from './player.validation'

import type {
  Player,
  PlayerFormData,
  PlayerListFilters,
  PlayerResult,
} from './player.types'

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Ocorreu um erro inesperado ao processar o jogador.'
}

export async function listPlayers(
  filters?: PlayerListFilters,
): Promise<Player[]> {
  return playerRepository.list(filters)
}

export async function getPlayer(id: string): Promise<Player | null> {
  return playerRepository.findById(id)
}

export async function savePlayer(
  data: PlayerFormData,
): Promise<PlayerResult> {
  const errors = validatePlayer(data)

  if (errors.length > 0) {
    return {
      success: false,
      message: errors.join(' '),
    }
  }

  try {
    const existingPlayer = data.id
      ? await playerRepository.findById(data.id)
      : null

    if (data.id && !existingPlayer) {
      return {
        success: false,
        message: 'O jogador que você está tentando editar não foi encontrado.',
      }
    }

    const playerData = {
      championshipId: data.championshipId,
      fullName: data.fullName.trim(),
      birthDate: data.birthDate || null,
      position: data.position || null,
      shirtNumber: data.shirtNumber.trim()
        ? Number(data.shirtNumber)
        : null,
      photoUrl: existingPlayer?.photoUrl ?? null,
      status: existingPlayer?.status ?? ('active' as const),
    }

    let player: Player

    if (data.id) {
      player = await playerRepository.update(data.id, playerData)
    } else {
      player = await playerRepository.create(playerData)
    }

    if (data.photo) {
      const photoUrl = await playerRepository.uploadPhoto(
        data.photo,
        player.id,
      )

      player = await playerRepository.update(player.id, { ...playerData, photoUrl })
    }

    await playerRepository.registerInSeason(
      player.id,
      data.teamId,
      data.seasonId,
      data.shirtNumber.trim() ? Number(data.shirtNumber) : null,
    )

    return {
      success: true,
      message: data.id
        ? 'Jogador atualizado com sucesso.'
        : 'Jogador cadastrado e inscrito na temporada com sucesso.',
      player,
    }
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    }
  }
}

export async function deletePlayer(id: string): Promise<PlayerResult> {
  try {
    await playerRepository.delete(id)

    return {
      success: true,
      message: 'Jogador excluído com sucesso.',
    }
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    }
  }
}

export async function listPlayerChampionships() {
  return playerRepository.listChampionships()
}

export async function listPlayerSeasons(championshipId: string) {
  if (!championshipId) return []

  return playerRepository.listSeasons(championshipId)
}

export async function listPlayerTeams(seasonId: string) {
  if (!seasonId) return []

  return playerRepository.listTeams(seasonId)
}
