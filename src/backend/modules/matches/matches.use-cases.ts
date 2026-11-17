
import type {
  Match,
  MatchEvent,
  MatchEventFormData,
  MatchFilters,
  MatchFormData,
  MatchRepository,
} from './matches.types.js'

import {
  normalizeMatchData,
  validateMatch,
} from './matches.validation.js'

function assertValid(data: MatchFormData): MatchFormData {
  const normalized = normalizeMatchData(data)
  const result = validateMatch(normalized)

  if (!result.valid) {
    throw new Error(Object.values(result.errors).join(' '))
  }

  return normalized
}

function assertValidEvent(data: MatchEventFormData): MatchEventFormData {
  if (!data.teamRegistrationId) {
    throw new Error('Selecione a equipe relacionada ao evento.')
  }

  if (!data.eventType) {
    throw new Error('Selecione o tipo do evento.')
  }

  if (!Number.isInteger(data.minute) || data.minute < 0) {
    throw new Error('O minuto do evento deve ser um número válido.')
  }

  if (!Number.isInteger(data.addedTime) || data.addedTime < 0) {
    throw new Error('O acréscimo deve ser um número válido.')
  }

  return {
    ...data,
    playerRegistrationId: data.playerRegistrationId || '',
    relatedPlayerRegistrationId:
      data.relatedPlayerRegistrationId || '',
    description: data.description?.trim() ?? '',
  }
}

export function createMatchUseCases(repository: MatchRepository) {
  return {
    list(filters: MatchFilters): Promise<Match[]> {
      return repository.list(filters)
    },

    async create(data: MatchFormData): Promise<Match> {
      return repository.create(assertValid(data))
    },

    async update(id: string, data: MatchFormData): Promise<Match> {
      const existing = await repository.findById(id)

      if (!existing) {
        throw new Error('Partida não encontrada.')
      }

      if (existing.status === 'live' || existing.status === 'finished') {
        throw new Error(
          'Partidas em andamento ou encerradas não podem ser editadas pelo cadastro.',
        )
      }

      return repository.update(id, assertValid(data))
    },

    async delete(id: string): Promise<void> {
      const existing = await repository.findById(id)

      if (!existing) {
        throw new Error('Partida não encontrada.')
      }

      if (
        existing.status !== 'scheduled' &&
        existing.status !== 'cancelled'
      ) {
        throw new Error(
          'Somente partidas agendadas ou canceladas podem ser excluídas.',
        )
      }

      await repository.delete(id)
    },

    findById(id: string) {
      return repository.findById(id)
    },

    async start(id: string): Promise<Match> {
      const existing = await repository.findById(id)

      if (!existing) {
        throw new Error('Partida não encontrada.')
      }

      if (existing.status !== 'scheduled') {
        throw new Error(
          'Somente partidas agendadas podem ser iniciadas.',
        )
      }

      return repository.updateStatus(id, {
        status: 'live',
        startedAt: new Date().toISOString(),
        finishedAt: null,
      })
    },

    async finish(id: string): Promise<Match> {
      const existing = await repository.findById(id)

      if (!existing) {
        throw new Error('Partida não encontrada.')
      }

      if (existing.status !== 'live') {
        throw new Error(
          'Somente partidas em andamento podem ser encerradas.',
        )
      }

      return repository.updateStatus(id, {
        status: 'finished',
        finishedAt: new Date().toISOString(),
      })
    },

    async listEvents(matchId: string): Promise<MatchEvent[]> {
      const existing = await repository.findById(matchId)

      if (!existing) {
        throw new Error('Partida não encontrada.')
      }

      return repository.listEvents(matchId)
    },

    async createEvent(
      matchId: string,
      data: MatchEventFormData,
    ): Promise<MatchEvent> {
      const existing = await repository.findById(matchId)

      if (!existing) {
        throw new Error('Partida não encontrada.')
      }

      if (existing.status !== 'live') {
        throw new Error(
          'Só é possível registrar eventos em partidas em andamento.',
        )
      }

      const normalized = assertValidEvent(data)

      if (
        normalized.teamRegistrationId !== existing.homeRegistrationId &&
        normalized.teamRegistrationId !== existing.awayRegistrationId
      ) {
        throw new Error(
          'A equipe selecionada não participa desta partida.',
        )
      }

      return repository.createEvent(matchId, normalized)
    },

    async updateEvent(
      matchId: string,
      eventId: string,
      data: MatchEventFormData,
    ): Promise<MatchEvent> {
      const existing = await repository.findById(matchId)

      if (!existing) {
        throw new Error('Partida não encontrada.')
      }

      if (
        existing.status !== 'live' &&
        existing.status !== 'finished'
      ) {
        throw new Error(
          'Os eventos só podem ser corrigidos durante ou após a partida.',
        )
      }

      const normalized = assertValidEvent(data)

      if (
        normalized.teamRegistrationId !== existing.homeRegistrationId &&
        normalized.teamRegistrationId !== existing.awayRegistrationId
      ) {
        throw new Error(
          'A equipe selecionada não participa desta partida.',
        )
      }

      return repository.updateEvent(matchId, eventId, normalized)
    },

    async deleteEvent(
      matchId: string,
      eventId: string,
    ): Promise<void> {
      const existing = await repository.findById(matchId)

      if (!existing) {
        throw new Error('Partida não encontrada.')
      }

      if (
        existing.status !== 'live' &&
        existing.status !== 'finished'
      ) {
        throw new Error(
          'Os eventos só podem ser corrigidos durante ou após a partida.',
        )
      }

      await repository.deleteEvent(matchId, eventId)
    },

    recalculateScore(matchId: string) {
      return repository.recalculateScore(matchId)
    },

    listChampionships() {
      return repository.listChampionships()
    },

    listSeasons(championshipId: string) {
      return repository.listSeasons(championshipId)
    },

    listPhases(seasonId: string) {
      return repository.listPhases(seasonId)
    },

    listGroups(phaseId: string) {
      return repository.listGroups(phaseId)
    },

    listRounds(phaseId: string, groupId: string) {
      return repository.listRounds(phaseId, groupId)
    },

    listTeams(seasonId: string) {
      return repository.listTeams(seasonId)
    },
  }
}
