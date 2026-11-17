
import { supabase } from '../../../../apps/api/src/lib/supabase.js'

import type {
    GroupFormData,
    RoundFormData,
    Stage,
    StageChampionshipOption,
    StageFormData,
    StageGroup,
    StagePhaseType,
    StageRound,
    StageSeasonOption,
    StagesRepository,
} from './stages.types.js'

interface StageRow {
  id: string
  season_id: string
  name: string
  phase_type: StagePhaseType
  order_number: number
  settings: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface GroupRow {
  id: string
  phase_id: string
  season_id: string
  name: string
  order_number: number
  created_at: string
}

interface RoundRow {
  id: string
  phase_id: string
  season_id: string
  group_id: string | null
  name: string
  round_number: number
  scheduled_date: string | null
  created_at: string
}

function throwDatabaseError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message)
  }
}

function mapStage(row: StageRow): Stage {
  return {
    id: row.id,
    seasonId: row.season_id,
    name: row.name,
    phaseType: row.phase_type,
    orderNumber: row.order_number,
    settings: row.settings ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapGroup(row: GroupRow): StageGroup {
  return {
    id: row.id,
    phaseId: row.phase_id,
    seasonId: row.season_id,
    name: row.name,
    orderNumber: row.order_number,
    createdAt: row.created_at,
  }
}

function mapRound(row: RoundRow): StageRound {
  return {
    id: row.id,
    phaseId: row.phase_id,
    seasonId: row.season_id,
    groupId: row.group_id,
    name: row.name,
    roundNumber: row.round_number,
    scheduledDate: row.scheduled_date,
    createdAt: row.created_at,
  }
}

export const stagesSupabaseRepository: StagesRepository = {
  async listChampionships(): Promise<StageChampionshipOption[]> {
    const { data, error } = await supabase
      .from('championships')
      .select('id, name')
      .order('name')

    throwDatabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    }))
  },

  async listSeasons(championshipId): Promise<StageSeasonOption[]> {
    const { data, error } = await supabase
      .from('seasons')
      .select('id, championship_id, name')
      .eq('championship_id', championshipId)
      .order('name')

    throwDatabaseError(error)

    return (data ?? []).map((row) => ({
      id: row.id,
      championshipId: row.championship_id,
      name: row.name,
    }))
  },

  async listStages(seasonId): Promise<Stage[]> {
    const { data, error } = await supabase
      .from('competition_phases')
      .select('*')
      .eq('season_id', seasonId)
      .order('order_number')

    throwDatabaseError(error)

    return ((data ?? []) as StageRow[]).map(mapStage)
  },

  async createStage(data: StageFormData): Promise<Stage> {
    const { data: row, error } = await supabase
      .from('competition_phases')
      .insert({
        season_id: data.seasonId,
        name: data.name.trim(),
        phase_type: data.phaseType,
        order_number: data.orderNumber,
        settings: data.settings,
      })
      .select('*')
      .single()

    throwDatabaseError(error)

    if (!row) {
      throw new Error('O banco não retornou a fase cadastrada.')
    }

    return mapStage(row as StageRow)
  },

  async updateStage(id: string, data: StageFormData): Promise<Stage> {
    const { data: row, error } = await supabase
      .from('competition_phases')
      .update({
        name: data.name.trim(),
        phase_type: data.phaseType,
        order_number: data.orderNumber,
        settings: data.settings,
      })
      .eq('id', id)
      .eq('season_id', data.seasonId)
      .select('*')
      .single()

    throwDatabaseError(error)

    if (!row) {
      throw new Error('O banco não retornou a fase atualizada.')
    }

    return mapStage(row as StageRow)
  },

  async deleteStage(id: string): Promise<void> {
    const { error } = await supabase
      .from('competition_phases')
      .delete()
      .eq('id', id)

    throwDatabaseError(error)
  },

  async listGroups(phaseId): Promise<StageGroup[]> {
    const { data, error } = await supabase
      .from('competition_groups')
      .select('*')
      .eq('phase_id', phaseId)
      .order('order_number')

    throwDatabaseError(error)

    return ((data ?? []) as GroupRow[]).map(mapGroup)
  },

  async createGroup(data: GroupFormData): Promise<StageGroup> {
    const { data: row, error } = await supabase
      .from('competition_groups')
      .insert({
        phase_id: data.phaseId,
        season_id: data.seasonId,
        name: data.name.trim(),
        order_number: data.orderNumber,
      })
      .select('*')
      .single()

    throwDatabaseError(error)

    if (!row) {
      throw new Error('O banco não retornou o grupo cadastrado.')
    }

    return mapGroup(row as GroupRow)
  },

  async updateGroup(id: string, data: GroupFormData): Promise<StageGroup> {
    const { data: row, error } = await supabase
      .from('competition_groups')
      .update({
        name: data.name.trim(),
        order_number: data.orderNumber,
      })
      .eq('id', id)
      .eq('phase_id', data.phaseId)
      .eq('season_id', data.seasonId)
      .select('*')
      .single()

    throwDatabaseError(error)

    if (!row) {
      throw new Error('O banco não retornou o grupo atualizado.')
    }

    return mapGroup(row as GroupRow)
  },

  async deleteGroup(id: string): Promise<void> {
    const { error } = await supabase
      .from('competition_groups')
      .delete()
      .eq('id', id)

    throwDatabaseError(error)
  },

  async listRounds(phaseId, groupId): Promise<StageRound[]> {
    let query = supabase
      .from('competition_rounds')
      .select('*')
      .eq('phase_id', phaseId)

    if (groupId !== undefined) {
      query = groupId
        ? query.eq('group_id', groupId)
        : query.is('group_id', null)
    }

    const { data, error } = await query.order('round_number')

    throwDatabaseError(error)

    return ((data ?? []) as RoundRow[]).map(mapRound)
  },

  async createRound(data: RoundFormData): Promise<StageRound> {
    const { data: row, error } = await supabase
      .from('competition_rounds')
      .insert({
        phase_id: data.phaseId,
        season_id: data.seasonId,
        group_id: data.groupId,
        name: data.name.trim(),
        round_number: data.roundNumber,
        scheduled_date: data.scheduledDate,
      })
      .select('*')
      .single()

    throwDatabaseError(error)

    if (!row) {
      throw new Error('O banco não retornou a rodada cadastrada.')
    }

    return mapRound(row as RoundRow)
  },

  async updateRound(id: string, data: RoundFormData): Promise<StageRound> {
    const { data: row, error } = await supabase
      .from('competition_rounds')
      .update({
        group_id: data.groupId,
        name: data.name.trim(),
        round_number: data.roundNumber,
        scheduled_date: data.scheduledDate,
      })
      .eq('id', id)
      .eq('phase_id', data.phaseId)
      .eq('season_id', data.seasonId)
      .select('*')
      .single()

    throwDatabaseError(error)

    if (!row) {
      throw new Error('O banco não retornou a rodada atualizada.')
    }

    return mapRound(row as RoundRow)
  },

  async deleteRound(id: string): Promise<void> {
    const { error } = await supabase
      .from('competition_rounds')
      .delete()
      .eq('id', id)

    throwDatabaseError(error)
  },
}
