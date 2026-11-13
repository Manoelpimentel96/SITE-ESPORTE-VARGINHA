import { createSupabaseAdminClient, supabase } from '../../../../apps/api/src/lib/supabase'
import type {
  Collaborator, CollaboratorFilters, CollaboratorFormData,
  CollaboratorPermission, CollaboratorRole, CollaboratorStatus,
  CollaboratorsRepository,
} from './collaborators.types'

type ProfileRow = {
  id: string; user_id: string; full_name: string; cpf: string | null; email: string | null;
  phone: string | null; position: string | null; role: CollaboratorRole;
  is_active: boolean; created_at: string
}

function mapCollaborator(row: ProfileRow): Collaborator {
  return {
    id: row.id, name: row.full_name, cpf: row.cpf ?? '', email: row.email ?? '',
    phone: row.phone, cargo: row.position, role: row.role,
    status: row.is_active ? 'active' : 'inactive', createdAt: row.created_at,
  }
}

export const collaboratorsSupabaseRepository: CollaboratorsRepository = {
  async list(filters: CollaboratorFilters) {
    let query = supabase.from('profiles')
      .select('id,user_id,full_name,cpf,email,phone,position,role,is_active,created_at')
      .neq('role', 'owner').order('full_name')
    if (filters.role) query = query.eq('role', filters.role)
    if (filters.status) query = query.eq('is_active', filters.status === 'active')
    if (filters.search?.trim()) {
      const search = filters.search.trim().replace(/[,%()]/g, ' ')
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`)
    }
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return ((data ?? []) as ProfileRow[]).map(mapCollaborator)
  },

  async listPermissions(role: CollaboratorRole): Promise<CollaboratorPermission[]> {
    const { data, error } = await supabase.from('role_permissions')
      .select('permissions!inner(id,key,description)').eq('role', role)
    if (error) throw new Error(error.message)
    return (data ?? []).map((item) => {
      const permission = (item as unknown as { permissions: { id: string; key: string; description: string } }).permissions
      return { id: permission.id, key: permission.key, name: permission.description,
        description: permission.description, category: permission.key.split('.')[0] }
    })
  },

  async save(id: string | null, data: CollaboratorFormData): Promise<Collaborator> {
    const admin = createSupabaseAdminClient()
    const email = data.email.trim().toLowerCase()
    let userId: string
    let existingProfile: ProfileRow | null = null

    if (id) {
      const { data: current, error } = await admin.from('profiles')
        .select('id,user_id,full_name,cpf,email,phone,position,role,is_active,created_at')
        .eq('id', id).maybeSingle()
      if (error || !current) throw new Error(error?.message || 'Colaborador não encontrado.')
      existingProfile = current as ProfileRow
      userId = existingProfile.user_id
      const update: { email: string; email_confirm: true; user_metadata: { full_name: string }; password?: string } = { email, email_confirm: true, user_metadata: { full_name: data.name.trim() } }
      if (data.password) update.password = data.password
      const { error: authError } = await admin.auth.admin.updateUserById(userId, update)
      if (authError) throw new Error(authError.message)
    } else {
      if (!data.password) throw new Error('Defina uma senha inicial para o colaborador.')
      const { data: created, error } = await admin.auth.admin.createUser({
        email, password: data.password, email_confirm: true,
        user_metadata: { full_name: data.name.trim() },
      })
      if (error || !created.user) throw new Error(error?.message || 'Não foi possível criar o usuário de autenticação.')
      userId = created.user.id
    }

    const profilePayload = {
      full_name: data.name.trim(), cpf: data.cpf.replace(/\D/g, '') || null,
      email, phone: data.phone.trim() || null, position: data.cargo.trim() || null,
      role: data.role, is_active: existingProfile?.is_active ?? true,
    }
    const profileSelect = 'id,user_id,full_name,cpf,email,phone,position,role,is_active,created_at'
    let savedProfile: ProfileRow | null
    let saveError: string | null = null
    if (existingProfile) {
      const result = await admin.from('profiles').update(profilePayload).eq('id', id!).select(profileSelect).single()
      savedProfile = result.data as ProfileRow | null
      saveError = result.error?.message ?? null
    } else {
      // The auth.users trigger creates a viewer profile synchronously.
      const triggered = await admin.from('profiles').update(profilePayload)
        .eq('user_id', userId).select(profileSelect).maybeSingle()
      if (triggered.error) {
        await admin.auth.admin.deleteUser(userId)
        throw new Error(triggered.error.message)
      }
      if (triggered.data) {
        savedProfile = triggered.data as ProfileRow
      } else {
        const inserted = await admin.from('profiles').insert({ ...profilePayload, user_id: userId }).select(profileSelect).single()
        savedProfile = inserted.data as ProfileRow | null
        saveError = inserted.error?.message ?? null
      }
    }
    if (saveError || !savedProfile) {
      if (!existingProfile) await admin.auth.admin.deleteUser(userId)
      throw new Error(saveError || 'Não foi possível salvar o perfil do colaborador.')
    }
    return mapCollaborator(savedProfile)
  },

  async updateStatus(id: string, status: CollaboratorStatus) {
    const admin = createSupabaseAdminClient()
    const { error } = await admin.from('profiles').update({ is_active: status === 'active' }).eq('id', id)
    if (error) throw new Error(error.message)
  },
}
