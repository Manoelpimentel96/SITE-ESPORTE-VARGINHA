export interface Title {
  id: string
  seasonId: string
  championshipId: string
  championshipName: string
  seasonName: string
  seasonTeamRegistrationId: string
  teamId: string
  teamName: string
  teamShortName: string | null
  awardedAt: string | null
  notes: string | null
  createdAt: string
}

export interface TitleFormData {
  seasonId: string
  seasonTeamRegistrationId: string
  awardedAt: string
  notes: string
}

export interface TitleChampionshipOption {
  id: string
  name: string
}

export interface TitleSeasonOption {
  id: string
  championshipId: string
  name: string
}

export interface TitleTeamOption {
  registrationId: string
  teamId: string
  name: string
  shortName: string | null
}

export interface TitleFilters {
  championshipId: string
  seasonId: string
}

export interface TitlesRepository {
  listChampionships(): Promise<TitleChampionshipOption[]>

  listSeasons(
    championshipId: string,
  ): Promise<TitleSeasonOption[]>

  listTeams(
    seasonId: string,
  ): Promise<TitleTeamOption[]>

  listTitles(
    filters: TitleFilters,
  ): Promise<Title[]>

  createTitle(
    data: TitleFormData,
  ): Promise<Title>

  updateTitle(
    id: string,
    data: TitleFormData,
  ): Promise<Title>

  deleteTitle(id: string): Promise<void>
}
