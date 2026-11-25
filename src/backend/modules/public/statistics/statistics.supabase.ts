import { supabase } from '../../../../../apps/api/src/lib/supabase.js'
import { fail, firstRelation } from '../shared/supabase.helpers.js'
import type { Relation } from '../shared/supabase.helpers.js'
import { matchesSupabaseRepository } from '../matches/matches.supabase.js'
import { teamsSupabaseRepository } from '../teams/teams.supabase.js'
import type { StatisticsRepository } from './statistics.repository.js'
import type {
  PublicEventPlayer,
  PublicPlayerEvent,
  PublicPlayerEventType,
} from './statistics.types.js'

// Consultas da página pública: Estatísticas (gols, artilharia, assistências e cartões).

interface ScorerEventRow {
  player_registration_id: string | null
  player_registration: Relation<{
    player: Relation<{ id: string; full_name: string }>
  }>
  team_registration: Relation<{ team: Relation<{ name: string }> }>
}

interface PlayerEventRow {
  event_type: string
  player_registration_id: string | null
  related_player_registration_id: string | null
}

interface EventPlayerLookupRow {
  id: string
  player: Relation<{ id: string; full_name: string }>
  team_registration: Relation<{ team: Relation<{ name: string }> }>
}

export const statisticsSupabaseRepository: StatisticsRepository = {
  // Equipes e partidas vêm das próprias páginas Equipes e Partidas.
  listTeams: teamsSupabaseRepository.listTeams,
  listMatches: matchesSupabaseRepository.listMatches,

  async countPlayers(seasonId) {
    const { count, error } = await supabase
      .from('season_player_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('season_id', seasonId)
      .eq('status', 'active')
    fail(error)
    return count ?? 0
  },

  async listScorerEvents(seasonId) {
    const { data, error } = await supabase
      .from('match_events')
      .select(`
        player_registration_id,
        match:matches!inner(season_id),
        player_registration:season_player_registrations!match_events_player_registration_id_fkey(
          player:players(id,full_name)
        ),
        team_registration:season_team_registrations(team:teams(name))
      `)
      .eq('match.season_id', seasonId)
      .in('event_type', ['goal', 'penalty_goal'])
      .not('player_registration_id', 'is', null)
    fail(error)

    const rows = (data ?? []) as unknown as ScorerEventRow[]
    return rows.flatMap((row) => {
      const registration = firstRelation(row.player_registration)
      const player = registration ? firstRelation(registration.player) : null
      const teamRegistration = firstRelation(row.team_registration)
      const team = teamRegistration ? firstRelation(teamRegistration.team) : null
      if (!player?.id) return []
      return [{ playerId: player.id, playerName: player.full_name, teamName: team?.name ?? '' }]
    })
  },

  async listPlayerEvents(seasonId) {
    // Etapa 1: eventos da temporada (gols, gols de pênalti e cartões).
    // Traz apenas os identificadores das inscrições; os nomes vêm na etapa 2.
    const { data, error } = await supabase
      .from('match_events')
      .select('event_type,player_registration_id,related_player_registration_id,match:matches!inner(season_id)')
      .eq('match.season_id', seasonId)
      .in('event_type', ['goal', 'penalty_goal', 'yellow_card', 'red_card'])
    fail(error)

    const events = (data ?? []) as unknown as PlayerEventRow[]
    if (events.length === 0) return []

    // Etapa 2: inscrições de jogadores da temporada (nome e equipe), em uma única consulta.
    // Filtrar pela temporada evita montar uma lista enorme de IDs na URL da consulta.
    const { data: registrations, error: registrationError } = await supabase
      .from('season_player_registrations')
      .select(`
        id,
        player:players(id,full_name),
        team_registration:season_team_registrations(team:teams(name))
      `)
      .eq('season_id', seasonId)
    fail(registrationError)

    const people = new Map<string, PublicEventPlayer>()
    for (const row of (registrations ?? []) as unknown as EventPlayerLookupRow[]) {
      const player = firstRelation(row.player)
      const teamRegistration = firstRelation(row.team_registration)
      const team = teamRegistration ? firstRelation(teamRegistration.team) : null
      if (!player?.id) continue
      people.set(row.id, {
        playerId: player.id,
        name: player.full_name,
        teamName: team?.name ?? '',
      })
    }

    // Etapa 3: junta cada evento com os jogadores identificados (quando informados).
    return events.map((event): PublicPlayerEvent => ({
      eventType: event.event_type as PublicPlayerEventType,
      player: event.player_registration_id
        ? people.get(event.player_registration_id) ?? null
        : null,
      relatedPlayer: event.related_player_registration_id
        ? people.get(event.related_player_registration_id) ?? null
        : null,
    }))
  },
}
