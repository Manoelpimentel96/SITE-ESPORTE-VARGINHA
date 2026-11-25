// Tipos da página pública: Classificação.

export type PublicStanding = {
  position: number
  registrationId: string
  teamId: string
  teamName: string
  crestUrl: string | null
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}
