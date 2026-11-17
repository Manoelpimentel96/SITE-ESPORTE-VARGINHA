import { supabase } from '../../../../apps/api/src/lib/supabase.js'
import { handleDatabaseError } from '../../../lib/errors/AppError.js'
import type { RegulationRepository } from './regulation.repository.js'
import type {
  Regulation,
  RegulationFormData,
  RegulationListFilters,
  RegulationStatus,
  ClassificationSettings,
  TieBreaker,
} from './regulation.types.js'

type DatabaseRow = Record<string, unknown>

function fromRow(row: DatabaseRow): Regulation {
  const scoring = (row.scoring_settings ?? {}) as Record<string, unknown>
  const classification = (row.classification_settings ?? {}) as Record<string, unknown>
  const classificationSettings: ClassificationSettings = {
    totalQualified: typeof classification.totalQualified === 'number' ? classification.totalQualified : null,
    orderBy: Array.isArray(classification.orderBy) ? classification.orderBy as TieBreaker[] : ['wins', 'goal_difference', 'goals_for'],
    headToHeadMiniTable: typeof classification.headToHeadMiniTable === 'boolean' ? classification.headToHeadMiniTable : false,
  }
  return {
    id: row.id as string,
    seasonId: row.season_id as string,
    status: row.status as RegulationStatus,
    format: row.format as Regulation['format'],
    pointsWin: Number(scoring.pointsPerWin ?? 3),
    pointsDraw: Number(scoring.pointsPerDraw ?? 1),
    pointsLoss: Number(scoring.pointsPerLoss ?? 0),
    tieBreakers: (classification.orderBy ?? ['wins', 'goal_difference', 'goals_for']) as Regulation['tieBreakers'],
    groupSettings: (row.teams_settings ?? {}) as Regulation['groupSettings'],
    classificationSettings,
    knockoutSettings: (row.knockout_settings ?? {}) as Regulation['knockoutSettings'],
    matchSettings: (row.match_settings ?? {}) as Regulation['matchSettings'],
    phases: (row.phase_settings ?? []) as Regulation['phases'],
    disciplineSettings: (row.discipline_settings ?? {}) as Regulation['disciplineSettings'],
    substitutionSettings: (row.substitution_settings ?? {}) as Regulation['substitutionSettings'],
    generalSettings: (row.general_settings ?? {}) as Regulation['generalSettings'],
    publishedAt: (row.published_at ?? null) as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function toRow(data: RegulationFormData): DatabaseRow {
  return {
    season_id: data.seasonId,
    status: data.status,
    format: data.format,
    scoring_settings: {
      pointsPerWin: data.pointsWin,
      pointsPerDraw: data.pointsDraw,
      pointsPerLoss: data.pointsLoss,
    },
    teams_settings: data.groupSettings,
    classification_settings: {
      ...data.classificationSettings,
      orderBy: data.tieBreakers,
    },
    knockout_settings: data.knockoutSettings,
    match_settings: data.matchSettings,
    phase_settings: data.phases,
    discipline_settings: data.disciplineSettings,
    substitution_settings: data.substitutionSettings,
    general_settings: data.generalSettings,
  }
}

export class SupabaseRegulationRepository
  implements RegulationRepository
{
  async list(
    filters: RegulationListFilters = {},
  ): Promise<Regulation[]> {
    let query = supabase
      .from('competition_regulations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (filters.seasonId) {
      query = query.eq('season_id', filters.seasonId)
    }

    const { data, error } = await query

    if (error) {
      throw handleDatabaseError(error)
    }

    return (data ?? []).map((row) =>
      fromRow(row as DatabaseRow),
    )
  }

  async getById(id: string): Promise<Regulation | null> {
    const { data, error } = await supabase
      .from('competition_regulations')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw handleDatabaseError(error)
    }

    return data ? fromRow(data as DatabaseRow) : null
  }

  async getBySeasonId(
    seasonId: string,
  ): Promise<Regulation | null> {
    const { data, error } = await supabase
      .from('competition_regulations')
      .select('*')
      .eq('season_id', seasonId)
      .maybeSingle()

    if (error) {
      throw handleDatabaseError(error)
    }

    return data ? fromRow(data as DatabaseRow) : null
  }

  async create(
    data: RegulationFormData,
  ): Promise<Regulation> {
    const { data: created, error } = await supabase
      .from('competition_regulations')
      .insert(toRow(data))
      .select('*')
      .single()

    if (error) {
      throw handleDatabaseError(error)
    }

    return fromRow(created as DatabaseRow)
  }

  async update(
    id: string,
    data: RegulationFormData,
  ): Promise<Regulation> {
    const { data: updated, error } = await supabase
      .from('competition_regulations')
      .update(toRow(data))
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      throw handleDatabaseError(error)
    }

    return fromRow(updated as DatabaseRow)
  }

  async updateStatus(
    id: string,
    status: RegulationStatus,
  ): Promise<Regulation> {
    const { data, error } = await supabase
      .from('competition_regulations')
      .update({
        status,
        published_at:
          status === 'published'
            ? new Date().toISOString()
            : null,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      throw handleDatabaseError(error)
    }

    return fromRow(data as DatabaseRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('competition_regulations')
      .delete()
      .eq('id', id)

    if (error) {
      throw handleDatabaseError(error)
    }
  }

  async hasCompetitionActivity(
    seasonId: string,
  ): Promise<boolean> {
    const { count, error } = await supabase
      .from('matches')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('season_id', seasonId)

    if (error) {
      throw handleDatabaseError(error)
    }

    return (count ?? 0) > 0
  }
}
