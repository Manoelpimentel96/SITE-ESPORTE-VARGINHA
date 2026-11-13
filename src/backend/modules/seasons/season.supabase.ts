
import { supabase } from '../../../../apps/api/src/lib/supabase'
import { handleDatabaseError } from '../../../lib/errors/AppError'

import type {
  Season,
  SeasonFormData,
  SeasonListFilters,
  SeasonStatus,
} from './season.types'

import type { SeasonRepository } from './season.repository'

interface SeasonRow {
  id: string
  championship_id: string
  name: string
  year: number
  start_date: string | null
  end_date: string | null
  status: SeasonStatus
  created_at: string
  updated_at: string
}

function mapSeason(row: SeasonRow): Season {
  return {
    id: row.id,
    championshipId: row.championship_id,
    name: row.name,
    year: row.year,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDatabase(data: SeasonFormData) {
  return {
    championship_id: data.championshipId,
    name: data.name,
    year: data.year,
    start_date: data.startDate || null,
    end_date: data.endDate || null,
    status: data.status,
  }
}

function validateId(id: string): void {
  if (!id.trim()) {
    throw new Error('Identificador da temporada não informado.')
  }
}

export class SupabaseSeasonRepository implements SeasonRepository {
  
async list(filters?: SeasonListFilters): Promise<Season[]> {
  const safeFilters = filters ?? {}

  let query = supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false })
    .order('name', { ascending: true })

  if (safeFilters.status && safeFilters.status !== 'all') {
    query = query.eq('status', safeFilters.status)
  }

  if (
    safeFilters.championshipId &&
    safeFilters.championshipId !== 'all'
  ) {
    query = query.eq('championship_id', safeFilters.championshipId)
  }

  const search = safeFilters.search?.trim()

  if (search) {
    const safeSearch = search.replace(/[\\%_]/g, '\\$&')
    query = query.ilike('name', `%${safeSearch}%`)
  }

  const { data, error } = await query

  if (error) {
    throw handleDatabaseError(error)
  }

  return (data ?? []).map((row) => mapSeason(row as SeasonRow))
}


  async getById(id: string): Promise<Season | null> {
    validateId(id)

    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw handleDatabaseError(error)
    }

    return data ? mapSeason(data as SeasonRow) : null
  }

  async create(data: SeasonFormData): Promise<Season> {
    const { data: created, error } = await supabase
      .from('seasons')
      .insert(toDatabase(data))
      .select('*')
      .single()

    if (error) {
      throw handleDatabaseError(error)
    }

    return mapSeason(created as SeasonRow)
  }

  async update(
    id: string,
    data: SeasonFormData,
  ): Promise<Season> {
    validateId(id)

    const { data: updated, error } = await supabase
      .from('seasons')
      .update(toDatabase(data))
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      throw handleDatabaseError(error)
    }

    if (!updated) {
      throw new Error(
        'A temporada não foi encontrada ou você não tem permissão para alterá-la.',
      )
    }

    return mapSeason(updated as SeasonRow)
  }

  async delete(id: string): Promise<void> {
    validateId(id)

    const { data, error } = await supabase
      .from('seasons')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      throw handleDatabaseError(error)
    }

    if (!data) {
      throw new Error(
        'A temporada não foi encontrada ou você não tem permissão para excluí-la.',
      )
    }
  }
}
