// Tipos das páginas públicas: Equipes e detalhe da equipe.

import type { PublicMatch } from '../matches/matches.types.js'
import type { PublicPlayer } from '../players/players.types.js'

export type PublicTeam = {
  registrationId: string
  teamId: string
  name: string
  shortName: string | null
  city: string | null
  primaryColor: string | null
  crestUrl: string | null
  foundedYear: number | null
}

export type PublicTeamDetails = {
  team: PublicTeam
  players: PublicPlayer[]
  matches: PublicMatch[]
  staff: Array<{ name: string; role: string }>
}
