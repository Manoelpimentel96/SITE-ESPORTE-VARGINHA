
import { supabase } from '../../../../apps/api/src/lib/supabase.js'

import type {
  AuditAction,
  AuditFilters,
  AuditLog,
  AuditRepository,
} from './audit.types'

interface AuditLogRow {
  id: string
  user_id: string | null
  user_name: string | null
  user_email: string | null
  action: string
  module: string
  description: string | null
  entity_type: string | null
  entity_id: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name ?? 'Usuário não identificado',
    userEmail: row.user_email,
    action: row.action as AuditAction,
    module: row.module,
    description: row.description ?? '',
    entityType: row.entity_type,
    entityId: row.entity_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  }
}

export const auditSupabaseRepository: AuditRepository = {
  async list(filters: AuditFilters) {
    const from = (filters.page - 1) * filters.pageSize
    const to = from + filters.pageSize - 1

    let query = supabase
      .from('audit_logs')
      .select(
        `
          id,
          user_id,
          user_name,
          user_email,
          action,
          module,
          description,
          entity_type,
          entity_id,
          ip_address,
          user_agent,
          created_at
        `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filters.search) {
      query = query.ilike('user_name', `%${filters.search}%`)
    }

    if (filters.module) {
      query = query.eq('module', filters.module)
    }

    if (filters.action) {
      query = query.eq('action', filters.action)
    }

    if (filters.startDate) {
      query = query.gte(
        'created_at',
        `${filters.startDate}T00:00:00`,
      )
    }

    if (filters.endDate) {
      query = query.lte(
        'created_at',
        `${filters.endDate}T23:59:59.999`,
      )
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Erro ao consultar auditoria: ${error.message}`)
    }

    return {
      data: (data as AuditLogRow[]).map(mapAuditLog),
      total: count ?? 0,
    }
  },
}
