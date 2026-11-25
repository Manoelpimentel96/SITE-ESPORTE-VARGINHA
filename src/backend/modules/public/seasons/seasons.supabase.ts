import { supabase } from '../../../../../apps/api/src/lib/supabase.js'
import { fail } from '../shared/supabase.helpers.js'
import type { SeasonsRepository } from './seasons.repository.js'
import type { PublicSeason } from './seasons.types.js'

// Consultas da página pública: seletor de campeonato/temporada e "Edições anteriores".

interface SeasonRow {
  id: string
  championship_id: string
  name: string
  edition: number | null
  year: number
  start_date: string | null
  end_date: string | null
  status: string
}

interface ChampionshipRow {
  id: string
  name: string
  acronym: string | null
  description: string | null
  logo_url: string | null
}

function mapSeason(row: SeasonRow): PublicSeason {
  return {
    id: row.id,
    championshipId: row.championship_id,
    name: row.name,
    edition: row.edition ?? row.year,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    status: row.status,
  }
}

export const seasonsSupabaseRepository: SeasonsRepository = {
  async listChampionships() {
    const { data, error } = await supabase
      .from('championships')
      .select('id,name,acronym,description,logo_url')
      .eq('status', 'published')
      .order('name')
    fail(error)

    return ((data ?? []) as unknown as ChampionshipRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      acronym: row.acronym ?? null,
      description: row.description ?? null,
      logoUrl: row.logo_url ?? null,
    }))
  },

  async listSeasons(championshipId) {
    const { data, error } = await supabase
      .from('seasons')
      .select('id,championship_id,name,edition,year,start_date,end_date,status')
      .eq('championship_id', championshipId)
      .in('status', ['active', 'published', 'in_progress'])
      .order('start_date', { ascending: false })
    fail(error)
    return ((data ?? []) as unknown as SeasonRow[]).map(mapSeason)
  },

  async getSeason(seasonId) {
    const { data, error } = await supabase
      .from('seasons')
      .select('id,championship_id,name,edition,year,start_date,end_date,status')
      .eq('id', seasonId)
      .in('status', ['active', 'published', 'in_progress'])
      .single()
    fail(error)
    if (!data) throw new Error('Temporada pública não encontrada.')
    return mapSeason(data as unknown as SeasonRow)
  },

  async listPreviousSeasons(championshipId) {
    const { data, error } = await supabase
      .from('seasons')
      .select('id,championship_id,name,edition,year,start_date,end_date,status')
      .eq('championship_id', championshipId)
      .eq('status', 'completed')
      .order('end_date', { ascending: false })
    fail(error)
    return ((data ?? []) as unknown as SeasonRow[]).map(mapSeason)
  },
}
