
import { supabase } from '../../../../apps/api/src/lib/supabase.js'

import { handleDatabaseError } from '../../../lib/errors/AppError.js'

import type {
  Championship,
  ChampionshipFormData,
} from './championship.types.js'

import type {
  ChampionshipListFilters,
  ChampionshipRepository,
} from './championship.repository.js'

interface ChampionshipRow {
  id: string
  name: string
  acronym: string | null
  description: string | null
  status: Championship['status']
  created_at: string
  updated_at: string
}

function mapChampionship(row: ChampionshipRow): Championship {
  return {
    id: row.id,
    name: row.name,
    acronym: row.acronym,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDatabase(data: ChampionshipFormData) {
  return {
    name: data.name.trim(),
    acronym: data.acronym.trim().toUpperCase() || null,
    description: data.description.trim() || null,
    status: data.status,
  }
}

function validateId(id: string): string {
  const normalizedId = id.trim()

  if (!normalizedId) {
    throw new Error('Identificador do campeonato não informado.')
  }

  return normalizedId
}

export class SupabaseChampionshipRepository
  implements ChampionshipRepository
{
  async list(
    filters: ChampionshipListFilters = {},
  ): Promise<Championship[]> {
    let query = supabase
      .from('championships')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.search?.trim()) {
      // Remove caracteres especiais da sintaxe de filtros PostgREST.
      const search = filters.search
        .trim()
        .replace(/[(),.%]/g, ' ')
        .replace(/\s+/g, ' ')

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,acronym.ilike.%${search}%`,
        )
      }
    }

    const { data, error } = await query

    if (error) {
      throw handleDatabaseError(error)
    }

    return (data ?? []).map((row) =>
      mapChampionship(row as ChampionshipRow),
    )
  }

  async getById(id: string): Promise<Championship | null> {
    const normalizedId = validateId(id)

    const { data, error } = await supabase
      .from('championships')
      .select('*')
      .eq('id', normalizedId)
      .maybeSingle()

    if (error) {
      throw handleDatabaseError(error)
    }

    return data
      ? mapChampionship(data as ChampionshipRow)
      : null
  }

  async create(
    data: ChampionshipFormData,
  ): Promise<Championship> {
    const { data: created, error } = await supabase
      .from('championships')
      .insert(toDatabase(data))
      .select('*')
      .single()

    if (error) {
      throw handleDatabaseError(error)
    }

    if (!created) {
      throw new Error(
        'O banco de dados não retornou os dados do campeonato cadastrado.',
      )
    }

    return mapChampionship(created as ChampionshipRow)
  }

  async update(
    id: string,
    data: ChampionshipFormData,
  ): Promise<Championship> {
    const normalizedId = validateId(id)

    const { data: updated, error } = await supabase
      .from('championships')
      .update(toDatabase(data))
      .eq('id', normalizedId)
      .select('*')
      .maybeSingle()

    if (error) {
      throw handleDatabaseError(error)
    }

    if (!updated) {
      throw new Error(
        'Campeonato não encontrado ou você não possui permissão para alterá-lo.',
      )
    }

    return mapChampionship(updated as ChampionshipRow)
  }

  async delete(id: string): Promise<void> {
    const normalizedId = validateId(id)

    const { data, error } = await supabase
      .from('championships')
      .delete()
      .eq('id', normalizedId)
      .select('id')
      .maybeSingle()

    if (error) {
      throw handleDatabaseError(error)
    }

    if (!data) {
      throw new Error(
        'Campeonato não encontrado ou você não possui permissão para excluí-lo.',
      )
    }
  }
}
