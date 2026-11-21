import { domainCall } from '../../lib/domainApi'

import type {
  ChampionshipOption,
  GroupOption,
  Match,
  MatchEvent,
  MatchEventFormData,
  MatchFilters,
  MatchFormData,
  MatchTeamOption,
  PhaseOption,
  RoundOption,
  SeasonOption,
} from '../../backend/modules/matches/matches.types'

/**
 * CORREÇÃO DO HORÁRIO DA PARTIDA (única alteração de comportamento deste arquivo)
 *
 * O campo "Data e horário" (datetime-local) entrega um texto como "2026-11-20T16:30",
 * SEM fuso horário. Como a API roda no servidor (fuso UTC), ela leria esse texto como
 * 16:30 UTC e a hora apareceria 3 horas mais cedo para quem está no Pará (UTC-3).
 *
 * Esta função roda no NAVEGADOR, que conhece o fuso do usuário, e converte o texto para
 * um instante absoluto (ISO com "Z"). O servidor passa a receber a hora certa.
 *
 * Não altera o objeto original do formulário: devolve uma cópia para envio.
 */
function withAbsoluteSchedule(data: MatchFormData): MatchFormData {
  // Etapa 1: interpreta o texto do campo no fuso do navegador.
  const date = new Date(data.scheduledAt)

  // Etapa 2: se o campo estiver vazio ou inválido, envia como está.
  // A validação do servidor continua responsável por mostrar o erro ao usuário.
  if (!data.scheduledAt || Number.isNaN(date.getTime())) return data

  // Etapa 3: devolve uma cópia com a data em formato absoluto (ISO/UTC).
  return { ...data, scheduledAt: date.toISOString() }
}

/** Lista as partidas conforme os filtros da tela. */
export const listMatches = (filters: MatchFilters) =>
  domainCall<Match[]>('matches', 'listMatches', filters)

/** Cadastra uma partida nova (o horário passa pela conversão acima). */
export const createMatch = (data: MatchFormData) =>
  domainCall<Match>('matches', 'createMatch', withAbsoluteSchedule(data))

/** Atualiza uma partida existente (o horário passa pela conversão acima). */
export const updateMatch = (id: string, data: MatchFormData) =>
  domainCall<Match>('matches', 'updateMatch', id, withAbsoluteSchedule(data))

/** Exclui uma partida. */
export const deleteMatch = (id: string) =>
  domainCall<void>('matches', 'deleteMatch', id)

/** Busca uma partida pelo identificador. */
export const findMatchById = (id: string) =>
  domainCall<Match | null>('matches', 'findMatchById', id)

/** Inicia a partida (status "ao vivo"). */
export const startMatch = (matchId: string) =>
  domainCall<Match>('matches', 'startMatch', matchId)

/** Encerra a partida. */
export const finishMatch = (matchId: string) =>
  domainCall<Match>('matches', 'finishMatch', matchId)

/** Lista os eventos (gols, cartões etc.) de uma partida. */
export const listMatchEvents = (matchId: string) =>
  domainCall<MatchEvent[]>('matches', 'listMatchEvents', matchId)

/** Registra um evento na partida. */
export const createMatchEvent = (
  matchId: string,
  data: MatchEventFormData,
) =>
  domainCall<MatchEvent>(
    'matches',
    'createMatchEvent',
    matchId,
    data,
  )

/** Atualiza um evento da partida. */
export const updateMatchEvent = (
  matchId: string,
  eventId: string,
  data: MatchEventFormData,
) =>
  domainCall<MatchEvent>(
    'matches',
    'updateMatchEvent',
    matchId,
    eventId,
    data,
  )

/** Exclui um evento da partida. */
export const deleteMatchEvent = (
  matchId: string,
  eventId: string,
) =>
  domainCall<void>(
    'matches',
    'deleteMatchEvent',
    matchId,
    eventId,
  )

/** Opções de campeonato para os filtros e o formulário. */
export const listMatchChampionships = () =>
  domainCall<ChampionshipOption[]>(
    'matches',
    'listMatchChampionships',
  )

/** Opções de temporada de um campeonato. */
export const listMatchSeasons = (id: string) =>
  domainCall<SeasonOption[]>(
    'matches',
    'listMatchSeasons',
    id,
  )

/** Opções de fase de uma temporada. */
export const listMatchPhases = (id: string) =>
  domainCall<PhaseOption[]>(
    'matches',
    'listMatchPhases',
    id,
  )

/** Opções de grupo de uma fase. */
export const listMatchGroups = (id: string) =>
  domainCall<GroupOption[]>(
    'matches',
    'listMatchGroups',
    id,
  )

/** Opções de rodada de uma fase/grupo. */
export const listMatchRounds = (
  phaseId: string,
  groupId: string,
) =>
  domainCall<RoundOption[]>(
    'matches',
    'listMatchRounds',
    phaseId,
    groupId,
  )

/** Equipes inscritas disponíveis para a partida. */
export const listMatchTeams = (id: string) =>
  domainCall<MatchTeamOption[]>(
    'matches',
    'listMatchTeams',
    id,
  )
  