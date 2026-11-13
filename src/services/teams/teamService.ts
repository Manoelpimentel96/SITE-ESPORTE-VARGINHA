import { domainCall } from '../../lib/domainApi'
import type { Team, TeamFormData, TeamListFilters, TeamResult } from '../../backend/modules/teams/team.types'
export type { Team, TeamFormData, TeamListFilters, TeamResult, ChampionshipOption, SeasonOption } from '../../backend/modules/teams/team.types'
export const listTeams = (filters?: TeamListFilters) => domainCall<Team[]>('teams', 'listTeams', filters)
export const getTeam = (id: string) => domainCall<Team | null>('teams', 'getTeam', id)
async function encodeFile(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  return { name: file.name, type: file.type, base64: btoa(binary) }
}
export const saveTeam = async (data: TeamFormData) => {
  const { crest, ...form } = data
  const crestUpload = crest ? await encodeFile(crest) : null
  return domainCall<TeamResult>('teams', 'saveTeam', { ...form, crest: null, crestUpload })
}
export const deleteTeam = (id: string) => domainCall<TeamResult>('teams', 'deleteTeam', id)
export const listChampionships = () => domainCall<import('../../backend/modules/teams/team.types').ChampionshipOption[]>('teams', 'listChampionships')
export const listSeasons = (id: string) => domainCall<import('../../backend/modules/teams/team.types').SeasonOption[]>('teams', 'listSeasons', id)
