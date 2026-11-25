// Tipos da página pública: seletor de campeonato/temporada e "Edições anteriores".

export type PublicChampionship = {
  id: string
  name: string
  acronym: string | null
  description: string | null
  logoUrl: string | null
}

export type PublicSeason = {
  id: string
  championshipId: string
  name: string
  edition: number | null
  startDate: string | null
  endDate: string | null
  status: string
}
