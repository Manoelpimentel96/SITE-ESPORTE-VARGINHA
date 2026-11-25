// Tipos da página pública: Partidas.

export type PublicMatch = {
  id: string
  /** IDs da inscrição, usados internamente para relacionar partidas e classificação. */
  homeRegistrationId: string
  awayRegistrationId: string
  scheduledAt: string | null
  status: string
  homeScore: number | null
  awayScore: number | null
  city: string | null
  venue: string | null
  homeTeam: string
  awayTeam: string
  homeCrest: string | null
  awayCrest: string | null
  phase: string | null
  group: string | null
  round: string | null
}
