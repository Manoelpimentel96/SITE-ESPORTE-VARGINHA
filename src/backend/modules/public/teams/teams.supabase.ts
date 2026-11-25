import { supabase } from '../../../../../apps/api/src/lib/supabase.js'
import { fail, firstRelation } from '../shared/supabase.helpers.js'
import type { Relation } from '../shared/supabase.helpers.js'
import { matchesSupabaseRepository } from '../matches/matches.supabase.js'
import { playersSupabaseRepository } from '../players/players.supabase.js'
import type { TeamsRepository } from './teams.repository.js'
import type { PublicTeam } from './teams.types.js'

// Consultas das páginas públicas: Equipes e detalhe da equipe
// (também usadas por Visão geral, Classificação e Estatísticas).

interface TeamRow {
  id: string
  name: string
  short_name: string | null
  city: string | null
  primary_color: string | null
  crest_url: string | null
  founded_year: number | null
}

interface TeamRegistrationRow {
  id: string
  team: Relation<TeamRow>
}

interface StaffRow {
  full_name: string
  role: string
  team_registration_id: string | null
}

function mapTeam(registration: TeamRegistrationRow): PublicTeam {
  const team = firstRelation(registration.team)
  if (!team) throw new Error('Não foi possível carregar os dados de uma equipe.')

  return {
    registrationId: registration.id,
    teamId: team.id,
    name: team.name,
    shortName: team.short_name ?? null,
    city: team.city ?? null,
    primaryColor: team.primary_color ?? null,
    crestUrl: team.crest_url ?? null,
    foundedYear: team.founded_year ?? null,
  }
}

export const teamsSupabaseRepository: TeamsRepository = {
  async listTeams(seasonId, search = '') {
    let query = supabase
      .from('season_team_registrations')
      .select('id,status,team:teams!inner(id,name,short_name,city,primary_color,crest_url,founded_year)')
      .eq('season_id', seasonId)
      .eq('status', 'active')

    if (search) query = query.ilike('team.name', `%${search}%`)

    const { data, error } = await query.order('created_at')
    fail(error)
    return ((data ?? []) as unknown as TeamRegistrationRow[]).map(mapTeam)
  },

  async getTeamDetails(seasonId, teamId) {
    const teams = await teamsSupabaseRepository.listTeams(seasonId)
    const team = teams.find((item) => item.teamId === teamId)
    if (!team) throw new Error('Equipe não encontrada nesta temporada.')

    const [players, allMatches, staffResult] = await Promise.all([
      playersSupabaseRepository.listPlayers(seasonId),
      matchesSupabaseRepository.listMatches(seasonId),
      supabase
        .from('team_staff')
        .select('full_name,role,team_registration_id')
        .eq('team_id', teamId)
        .or(`team_registration_id.is.null,team_registration_id.eq.${team.registrationId}`),
    ])
    fail(staffResult.error)

    const matches = allMatches.filter(
      (match) =>
        match.homeRegistrationId === team.registrationId ||
        match.awayRegistrationId === team.registrationId,
    )
    const staffRows = (staffResult.data ?? []) as unknown as StaffRow[]

    return {
      team,
      players: players.filter((player) => player.registrationId === team.registrationId),
      matches,
      staff: staffRows.map((row) => ({ name: row.full_name, role: row.role })),
    }
  },
}
