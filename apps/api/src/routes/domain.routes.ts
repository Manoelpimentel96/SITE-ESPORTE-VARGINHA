
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { File } from 'node:buffer'
import { z } from 'zod'

import { env } from '../lib/env.mjs'
import { createSupabaseClient } from '../lib/supabase.mjs'
import { runWithSupabaseToken } from '../lib/supabase.ts'

import * as audit from '../domain-services/audit/auditService.ts'
import * as championships from '../domain-services/championships/championshipService.ts'
import * as collaborators from '../domain-services/collaborators/collaboratorsService.ts'
import * as dashboard from '../domain-services/dashboard/dashboardService.ts'
import * as matches from '../domain-services/matches/matchService.ts'
import * as players from '../domain-services/players/playerService.ts'
import * as publicData from '../domain-services/public/publicService.ts'
import * as regulations from '../domain-services/regulations/regulationService.ts'
import * as seasons from '../domain-services/seasons/seasonService.ts'
import * as stages from '../domain-services/stages/stagesService.ts'
import * as standings from '../domain-services/standings/standingsService.ts'
import * as teams from '../domain-services/teams/teamService.ts'
import * as titles from '../domain-services/titles/titlesService.ts'

const COOKIE = 'site_esporte_session'

const callSchema = z.object({
  args: z.array(z.unknown()).max(12).default([]),
})

type DomainModule = Record<string, (...args: unknown[]) => unknown>

type UploadPayload = {
  base64: string
  name?: string
  type?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUpload(value: unknown): value is UploadPayload {
  return isRecord(value) && typeof value.base64 === 'string'
}

const handlers: Record<string, DomainModule> = {
  championships: championships as unknown as DomainModule,
  collaborators: collaborators as unknown as DomainModule,
  dashboard: dashboard.dashboardService as unknown as DomainModule,
  matches: matches as unknown as DomainModule,
  players: players as unknown as DomainModule,
  public: publicData.publicService as unknown as DomainModule,
  regulations: regulations as unknown as DomainModule,
  seasons: seasons as unknown as DomainModule,
  stages: stages as unknown as DomainModule,

  standings: {
    getStandings: standings.getStandings,
    listStandingsChampionships: standings.listStandingsChampionships,
    listStandingsSeasons: standings.listStandingsSeasons,
    listStandingsPhases: standings.listStandingsPhases,
    listStandingsGroups: standings.listStandingsGroups,
  } as unknown as DomainModule,

  teams: teams as unknown as DomainModule,
  titles: titles as unknown as DomainModule,
  audit: audit.auditService as unknown as DomainModule,
}

const permissions: Record<string, string> = {
  'championships.*': 'championships.manage',
  'collaborators.*': 'collaborators.manage',
  'dashboard.*': 'standings.read',

  'matches.*': 'matches.manage',

  'matches.listMatches': 'matches.update_live',
  'matches.findMatchById': 'matches.update_live',

  'matches.createMatch': 'matches.manage',
  'matches.updateMatch': 'matches.manage',
  'matches.deleteMatch': 'matches.manage',

  'matches.startMatch': 'matches.update_live',
  'matches.finishMatch': 'matches.update_live',
  'matches.listMatchEvents': 'matches.update_live',
  'matches.createMatchEvent': 'matches.update_live',
  'matches.updateMatchEvent': 'matches.correct_finished',
  'matches.deleteMatchEvent': 'matches.correct_finished',

  'matches.listMatchChampionships': 'matches.update_live',
  'matches.listMatchSeasons': 'matches.update_live',
  'matches.listMatchPhases': 'matches.update_live',
  'matches.listMatchGroups': 'matches.update_live',
  'matches.listMatchRounds': 'matches.update_live',
  'matches.listMatchTeams': 'matches.update_live',

  'players.*': 'players.manage',
  'regulations.*': 'regulations.manage',
  'seasons.*': 'seasons.manage',
  'stages.*': 'matches.manage',
  'standings.*': 'standings.read',
  'teams.*': 'teams.manage',
  'titles.*': 'titles.manage',
  'audit.*': 'audit.read',
}

function permissionFor(
  moduleName: string,
  action: string,
): string | null {
  if (moduleName === 'public') {
    return null
  }

  if (moduleName === 'matches') {
    if (
      action === 'createMatch' ||
      action === 'updateMatch' ||
      action === 'deleteMatch'
    ) {
      return 'matches.manage'
    }

    if (
      action === 'updateMatchEvent' ||
      action === 'deleteMatchEvent'
    ) {
      return 'matches.correct_finished'
    }

    if (
      action === 'listMatches' ||
      action === 'findMatchById' ||
      action === 'startMatch' ||
      action === 'finishMatch' ||
      action === 'listMatchEvents' ||
      action === 'createMatchEvent' ||
      action.startsWith('listMatch')
    ) {
      return 'matches.update_live'
    }
  }

  if (moduleName === 'stages' && action.startsWith('list')) {
    return 'matches.update_live'
  }

  return (
    permissions[`${moduleName}.${action}`] ??
    permissions[`${moduleName}.*`] ??
    '__deny__'
  )
}

async function readSession(request: FastifyRequest) {
  const raw = (
    request.cookies as Record<string, string | undefined>
  )[COOKIE]

  if (!raw) return null

  const unsigned = request.unsignCookie(raw)

  if (!unsigned.valid) return null

  try {
    const parsed = JSON.parse(unsigned.value)

    return parsed?.access_token && parsed?.refresh_token
      ? parsed
      : null
  } catch {
    return null
  }
}

async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
  requiredPermission: string | null,
) {
  if (requiredPermission === null) {
    return {
      token: null,
      user: null,
      profile: null,
    }
  }

  const saved = await readSession(request)

  if (!saved) {
    await reply.code(401).send({
      error: 'Autenticação necessária.',
    })

    return null
  }

  const authClient = createSupabaseClient()

  const { data: sessionData, error: sessionError } =
    await authClient.auth.setSession(saved)

  if (sessionError || !sessionData.session) {
    await reply.code(401).send({
      error: 'Sessão inválida ou expirada.',
    })

    return null
  }

  const token = sessionData.session.access_token

  reply.setCookie(
    COOKIE,
    JSON.stringify({
      access_token: token,
      refresh_token: sessionData.session.refresh_token,
    }),
    {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(env.COOKIE_DOMAIN
        ? { domain: env.COOKIE_DOMAIN }
        : {}),
      maxAge: 60 * 60 * 24 * 7,
      signed: true,
    },
  )

  const client = createSupabaseClient(token)

  const { data: userData, error: userError } =
    await client.auth.getUser(token)

  if (userError || !userData.user) {
    await reply.code(401).send({
      error: 'Sessão inválida ou expirada.',
    })

    return null
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('full_name,role,is_active')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    (requiredPermission !== null && profile.role === 'viewer')
  ) {
    await reply.code(403).send({
      error: 'Usuário sem acesso administrativo ativo.',
    })

    return null
  }

  if (requiredPermission) {
    const { data: allowed, error } = await client.rpc(
      'has_permission',
      {
        permission_key: requiredPermission,
      },
    )

    if (error || allowed !== true) {
      await reply.code(403).send({
        error: 'Você não possui permissão para esta operação.',
      })

      return null
    }
  }

  return {
    token,
    user: userData.user,
    profile,
  }
}

export async function domainRoutes(app: FastifyInstance) {
  app.post('/domain/:module/:action', async (request, reply) => {
    const {
      module: moduleName,
      action,
    } = request.params as {
      module: string
      action: string
    }

    const moduleHandlers = Object.hasOwn(handlers, moduleName)
      ? handlers[moduleName]
      : undefined

    const operation =
      moduleHandlers && Object.hasOwn(moduleHandlers, action)
        ? moduleHandlers[action]
        : undefined

    if (!moduleHandlers || typeof operation !== 'function') {
      return reply.code(404).send({
        error: 'Operação não encontrada.',
      })
    }

    const parsed = callSchema.safeParse(request.body ?? {})

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Formato de solicitação inválido.',
      })
    }

    const permission = permissionFor(moduleName, action)

    const auth = await authenticate(
      request,
      reply,
      permission,
    )

    if (!auth) return

    try {
      const args = [...parsed.data.args]

      if (
        moduleName === 'players' &&
        action === 'savePlayer' &&
        isRecord(args[0])
      ) {
        const payload = args[0]

        const upload = isUpload(payload.photoUpload)
          ? payload.photoUpload
          : null

        if (upload) {
          const bytes = Buffer.from(upload.base64, 'base64')

          if (bytes.byteLength > 5 * 1024 * 1024) {
            return reply.code(413).send({
              error: 'A foto deve ter no máximo 5 MB.',
            })
          }

          payload.photo = new File(
            [bytes],
            upload.name || 'player-photo.jpg',
            {
              type: upload.type || 'image/jpeg',
            },
          )
        }

        delete payload.photoUpload
      }

      if (
        moduleName === 'teams' &&
        action === 'saveTeam' &&
        isRecord(args[0])
      ) {
        const payload = args[0]

        const upload = isUpload(payload.crestUpload)
          ? payload.crestUpload
          : null

        if (upload) {
          const bytes = Buffer.from(upload.base64, 'base64')

          if (bytes.byteLength > 5 * 1024 * 1024) {
            return reply.code(413).send({
              error: 'O escudo deve ter no máximo 5 MB.',
            })
          }

          payload.crest = new File(
            [bytes],
            upload.name || 'team-crest.png',
            {
              type: upload.type || 'image/png',
            },
          )
        }

        delete payload.crestUpload
      }

      const result = await runWithSupabaseToken(
        auth.token,
        () => operation(...args),
      )

      const resultRecord = isRecord(result) ? result : {}

      const playerRecord = isRecord(resultRecord.player)
        ? resultRecord.player
        : {}

      const teamRecord = isRecord(resultRecord.team)
        ? resultRecord.team
        : {}

      const mutation =
        /^(create|save|update|delete|publish|unpublish|start|finish)/i.test(
          action,
        )

      const auditAction = /^delete/i.test(action)
        ? 'delete'
        : /^(create|save)/i.test(action)
          ? 'create'
          : /^(publish|unpublish|updateStatus|start|finish)/i.test(
                action,
              )
            ? 'status_change'
            : /^update/i.test(action)
              ? 'update'
              : 'other'

      if (
        mutation &&
        auth.token &&
        auth.user &&
        auth.profile &&
        !(isRecord(result) && result.success === false)
      ) {
        const tableByModule: Record<string, string> = {
          championships: 'championships',
          seasons: 'seasons',
          regulations: 'competition_regulations',
          teams: 'teams',
          players: 'players',
          matches: 'matches',
          stages: 'competition_phases',
          titles: 'championship_titles',
          collaborators: 'profiles',
        }

        const entityId =
          typeof resultRecord.id === 'string'
            ? resultRecord.id
            : typeof playerRecord.id === 'string'
              ? playerRecord.id
              : typeof teamRecord.id === 'string'
                ? teamRecord.id
                : typeof args[0] === 'string'
                  ? args[0]
                  : null

        const entityTable =
          moduleName === 'stages' && action.includes('Group')
            ? 'competition_groups'
            : moduleName === 'stages' && action.includes('Round')
              ? 'competition_rounds'
              : moduleName === 'matches' &&
                  action.toLowerCase().includes('event')
                ? 'match_events'
                : tableByModule[moduleName] ?? moduleName

        const auditClient = createSupabaseClient(auth.token)

        const { error: auditError } = await auditClient
          .from('audit_logs')
          .insert({
            user_id: auth.user.id,
            user_name: auth.profile.full_name,
            user_email: auth.user.email ?? null,
            action: auditAction,
            module: moduleName,
            entity_table: entityTable,
            entity_type: moduleName,
            entity_id: entityId,
            description: `${action} executado no módulo ${moduleName}.`,
            ip_address: request.ip,
            user_agent: request.headers['user-agent'] ?? null,
          })

        if (auditError) {
          request.log.error(
            { auditError },
            'Could not write audit log',
          )
        }
      }

      return reply.send({
        data: result ?? null,
      })
    } catch (error) {
      request.log.error(
        {
          error,
          moduleName,
          action,
        },
        'Domain operation failed',
      )

      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir a operação.'

      const databaseCode =
        isRecord(error) && typeof error.code === 'string'
          ? error.code
          : ''

      if (
        databaseCode === '42501' ||
        /row-level security|permission denied/i.test(message)
      ) {
        return reply.code(403).send({
          error: 'Você não possui permissão para realizar esta operação.',
        })
      }

      if (
        databaseCode === '23505' ||
        /duplicate key|already exists/i.test(message)
      ) {
        return reply.code(409).send({
          error: 'Já existe um registro com essas informações.',
        })
      }

      if (
        databaseCode === '23503' ||
        /foreign key|still referenced/i.test(message)
      ) {
        return reply.code(409).send({
          error:
            'Este registro possui vínculos e não pode ser removido ou alterado desta forma.',
        })
      }

      if (
        /postgrest|postgres|schema cache|relation .* does not exist|column .* does not exist/i.test(
          message,
        )
      ) {
        return reply.code(500).send({
          error:
            'Ocorreu uma inconsistência na integração com o banco. Consulte os registros do servidor.',
        })
      }

      return reply.code(422).send({
        error: message,
      })
    }
  })
}
