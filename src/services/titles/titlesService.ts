import { domainCall } from '../../lib/domainApi'
import type { Title, TitleFilters, TitleFormData, TitleChampionshipOption, TitleSeasonOption, TitleTeamOption } from '../../backend/modules/titles/titles.types'

export const listTitleChampionships = () => 
    domainCall<TitleChampionshipOption[]>('titles', 'listTitleChampionships')

export const listTitleSeasons = (id: string) => 
    domainCall<TitleSeasonOption[]>('titles', 'listTitleSeasons', id)

export const listTitleTeams = (id: string) => 
    domainCall<TitleTeamOption[]>('titles', 'listTitleTeams', id)

export const listTitles = (filters: TitleFilters) => 
    domainCall<Title[]>('titles', 'listTitles', filters)

export const createTitle = (data: TitleFormData) => 
    domainCall<Title>('titles', 'createTitle', data)

export const updateTitle = (id: string, data: TitleFormData) => 
    domainCall<Title>('titles', 'updateTitle', id, data)

export const deleteTitle = (id: string) => 
    domainCall<void>('titles', 'deleteTitle', id)
