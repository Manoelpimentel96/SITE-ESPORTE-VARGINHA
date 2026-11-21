import {
  Activity,
  CalendarDays,
  CirclePlus,
  ClipboardList,
  Edit,
  MapPin,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import MatchesFilters from './components/MatchesFilters'
import MatchForm from './components/MatchForm'
import MatchManagement from './components/MatchManagement'

import {
  createMatch,
  deleteMatch,
  findMatchById,
  listMatchChampionships,
  listMatches,
  listMatchGroups,
  listMatchPhases,
  listMatchRounds,
  listMatchSeasons,
  listMatchTeams,
  updateMatch,
} from '../../../../services/matches/matchService'

import type {
  ChampionshipOption,
  GroupOption,
  Match,
  MatchFilters,
  MatchFormData,
  MatchStatus,
  MatchTeamOption,
  PhaseOption,
  RoundOption,
  SeasonOption,
} from '../../../../backend/modules/matches/matches.types'

import '../../../../styles/admin/MatchesPage.css'

const emptyForm: MatchFormData = {
  seasonId: '',
  phaseId: '',
  groupId: '',
  roundId: '',
  homeRegistrationId: '',
  awayRegistrationId: '',
  city: '',
  venue: '',
  scheduledAt: '',
  notes: '',
}

const statusLabels: Record<MatchStatus, string> = {
  scheduled: 'Agendada',
  live: 'Ao vivo',
  finished: 'Encerrada',
  postponed: 'Adiada',
  cancelled: 'Cancelada',
}

function formatDate(value: string | null) {
  if (!value) return 'Data não definida'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Data inválida'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function toLocalDateTime(value: string | null) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offset = date.getTimezoneOffset() * 60000

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16)
}

/**
 * Define a prioridade de exibição das partidas.
 *
 * 0 - Ao vivo
 * 1 - Agendadas
 * 2 - Adiadas
 * 3 - Canceladas
 * 4 - Encerradas
 */
function getMatchPriority(status: MatchStatus) {
  const priorities: Record<MatchStatus, number> = {
    live: 0,
    scheduled: 1,
    postponed: 2,
    cancelled: 3,
    finished: 4,
  }

  return priorities[status]
}

/**
 * Obtém a data usada para ordenar cada partida.
 */
function getMatchDate(match: Match) {
  const value =
    match.status === 'live'
      ? match.startedAt ?? match.scheduledAt
      : match.status === 'finished'
        ? match.finishedAt ?? match.scheduledAt
        : match.scheduledAt

  if (!value) {
    return null
  }

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? null : timestamp
}

/**
 * Ordena as partidas sem modificar o array original.
 */
function sortMatches(items: Match[]) {
  return [...items].sort((a, b) => {
    const priorityDifference =
      getMatchPriority(a.status) - getMatchPriority(b.status)

    if (priorityDifference !== 0) {
      return priorityDifference
    }

    const dateA = getMatchDate(a)
    const dateB = getMatchDate(b)

    // Partidas encerradas:
    // as mais recentes aparecem primeiro.
    if (a.status === 'finished' && b.status === 'finished') {
      if (dateA === null && dateB === null) return 0
      if (dateA === null) return 1
      if (dateB === null) return -1

      return dateB - dateA
    }

    // Demais partidas:
    // as que possuem data definida aparecem primeiro,
    // respeitando a data mais próxima.
    if (dateA === null && dateB === null) return 0
    if (dateA === null) return 1
    if (dateB === null) return -1

    return dateA - dateB
  })
}

export default function MatchesPage() {
  const [championships, setChampionships] = useState<ChampionshipOption[]>([])
  const [seasons, setSeasons] = useState<SeasonOption[]>([])
  const [phases, setPhases] = useState<PhaseOption[]>([])
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [rounds, setRounds] = useState<RoundOption[]>([])
  const [teams, setTeams] = useState<MatchTeamOption[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  const [championshipId, setChampionshipId] = useState('')
  const [selectedSeasonId, setSelectedSeasonId] = useState('')

  const [form, setForm] = useState<MatchFormData>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Evita que uma resposta antiga sobrescreva uma consulta mais recente.
  const matchesRequestId = useRef(0)

  // Referência ao cartão do formulário, usada para rolar a tela até ele.
  const formSectionRef = useRef<HTMLElement | null>(null)

  // Cada clique em "Editar" incrementa este contador. Usar um contador (e não
  // apenas "formOpen") garante a rolagem também quando o formulário já está aberto
  // ou quando o mesmo botão é clicado novamente.
  const [scrollToFormRequest, setScrollToFormRequest] = useState(0)

  /**
   * Carrega a listagem de partidas.
   *
   * Esta função é utilizada tanto pelo botão Atualizar
   * quanto pelas alterações nos filtros e operações de cadastro.
   */
  const loadMatches = useCallback(async () => {
    const requestId = ++matchesRequestId.current

    setLoading(true)
    setError('')

    try {
      const filters: MatchFilters = {
        seasonId: selectedSeasonId,
        status: statusFilter,
        search,
      }

      const result = await listMatches(filters)

      if (requestId === matchesRequestId.current) {
        setMatches(result)
      }
    } catch (err) {
      if (requestId === matchesRequestId.current) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar as partidas.',
        )
      }
    } finally {
      if (requestId === matchesRequestId.current) {
        setLoading(false)
      }
    }
  }, [selectedSeasonId, statusFilter, search])

  /**
   * Carrega os campeonatos disponíveis.
   */
  useEffect(() => {
    let active = true

    async function load() {
      try {
        const result = await listMatchChampionships()

        if (active) {
          setChampionships(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os campeonatos.',
          )
        }
      }
    }

    load().catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  /**
   * Carrega as temporadas do campeonato selecionado.
   */
  useEffect(() => {
    let active = true

    async function load() {
      if (!championshipId) {
        setSeasons([])
        return
      }

      try {
        const result = await listMatchSeasons(championshipId)

        if (active) {
          setSeasons(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as temporadas.',
          )
        }
      }
    }

    load().catch(() => undefined)

    return () => {
      active = false
    }
  }, [championshipId])

  /**
   * Carrega fases e equipes para o formulário.
   */
  useEffect(() => {
    let active = true

    async function load() {
      if (!form.seasonId) {
        setPhases([])
        setTeams([])
        setLoadingOptions(false)
        return
      }

      setLoadingOptions(true)

      try {
        const [phaseOptions, teamOptions] = await Promise.all([
          listMatchPhases(form.seasonId),
          listMatchTeams(form.seasonId),
        ])

        if (active) {
          setPhases(phaseOptions)
          setTeams(teamOptions)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as opções da partida.',
          )
        }
      } finally {
        if (active) {
          setLoadingOptions(false)
        }
      }
    }

    load().catch(() => undefined)

    return () => {
      active = false
    }
  }, [form.seasonId])

  /**
   * Carrega grupos da fase selecionada.
   */
  useEffect(() => {
    let active = true

    async function load() {
      if (!form.phaseId) {
        setGroups([])
        return
      }

      try {
        const result = await listMatchGroups(form.phaseId)

        if (active) {
          setGroups(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os grupos.',
          )
        }
      }
    }

    load().catch(() => undefined)

    return () => {
      active = false
    }
  }, [form.phaseId])

  /**
   * Carrega rodadas da fase e do grupo selecionados.
   */
  useEffect(() => {
    let active = true

    async function load() {
      if (!form.phaseId) {
        setRounds([])
        return
      }

      try {
        const result = await listMatchRounds(form.phaseId, form.groupId)

        if (active) {
          setRounds(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as rodadas.',
          )
        }
      }
    }

    load().catch(() => undefined)

    return () => {
      active = false
    }
  }, [form.phaseId, form.groupId])

  /**
   * Único efeito responsável por carregar a listagem.
   *
   * Evita manter um segundo useEffect com a mesma consulta.
   */
  useEffect(() => {
  void Promise.resolve().then(() => loadMatches())
}, [loadMatches])

  /**
   * Rola a tela até o formulário de edição.
   *
   * Roda depois que o React desenha o formulário (o contador muda no mesmo
   * ciclo em que formOpen vira true). requestAnimationFrame garante que o layout
   * já foi calculado antes de rolar. Respeita a preferência do sistema por menos
   * animação.
   */
  useEffect(() => {
    if (scrollToFormRequest === 0) return

    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      formSectionRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [scrollToFormRequest])

  /**
   * Lista já ordenada para apresentação.
   */
  const orderedMatches = sortMatches(matches)

  function updateField<K extends keyof MatchFormData>(
    field: K,
    value: MatchFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function openNewForm() {
    setEditingId(null)

    setForm({
      ...emptyForm,
      seasonId: selectedSeasonId,
    })

    setError('')
    setSuccess('')
    setFormOpen(true)
    setSelectedMatch(null)
  }

  function openEditForm(match: Match) {
    setEditingId(match.id)

    setForm({
      seasonId: match.seasonId,
      phaseId: match.phaseId,
      groupId: match.groupId ?? '',
      roundId: match.roundId ?? '',
      homeRegistrationId: match.homeRegistrationId,
      awayRegistrationId: match.awayRegistrationId,
      city: match.city ?? '',
      venue: match.venue ?? '',
      scheduledAt: toLocalDateTime(match.scheduledAt),
      notes: match.notes ?? '',
    })

    setError('')
    setSuccess('')
    setSelectedMatch(null)
    setFormOpen(true)

    // Pede a rolagem até o formulário (tratada no useEffect acima).
    setScrollToFormRequest((current) => current + 1)

    const season = seasons.find(
      (item) => item.id === match.seasonId,
    )

    if (season) {
      setChampionshipId(season.championshipId)
    } else {
      listMatchSeasonsForEdit(match.seasonId).catch(() => undefined)
    }
  }

  /**
   * Localiza o campeonato ao qual pertence uma temporada.
   *
   * Mantém o comportamento existente para partidas
   * cuja temporada não está carregada nos filtros.
   */
  async function listMatchSeasonsForEdit(seasonId: string) {
    try {
      const result = await listMatchChampionships()

      setChampionships(result)

      const seasonResult = await Promise.all(
        result.map(async (championship) => ({
          championshipId: championship.id,
          seasons: await listMatchSeasons(championship.id),
        })),
      )

      const owner = seasonResult.find((item) =>
        item.seasons.some((season) => season.id === seasonId),
      )

      if (owner) {
        setChampionshipId(owner.championshipId)
        setSeasons(owner.seasons)
      } else {
        setError('Não foi possível localizar o campeonato da partida.')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível localizar o campeonato da partida.',
      )
    }
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleChampionshipChange(value: string) {
    setChampionshipId(value)
    setSelectedSeasonId('')
    setSeasons([])

    setForm((current) => ({
      ...current,
      seasonId: '',
      phaseId: '',
      groupId: '',
      roundId: '',
      homeRegistrationId: '',
      awayRegistrationId: '',
    }))
  }

  function handleSeasonChange(value: string) {
    setSelectedSeasonId(value)

    setForm((current) => ({
      ...current,
      seasonId: value,
      phaseId: '',
      groupId: '',
      roundId: '',
      homeRegistrationId: '',
      awayRegistrationId: '',
    }))
  }

  function handlePhaseChange(value: string) {
    setForm((current) => ({
      ...current,
      phaseId: value,
      groupId: '',
      roundId: '',
    }))
  }

  function handleGroupChange(value: string) {
    setForm((current) => ({
      ...current,
      groupId: value,
      roundId: '',
    }))
  }

  /**
   * Salva uma partida nova ou atualizada.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        await updateMatch(editingId, form)
        setSuccess('Partida atualizada com sucesso.')
      } else {
        await createMatch(form)
        setSuccess('Partida cadastrada com sucesso.')
      }

      closeForm()
      await loadMatches()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a partida.',
      )
    } finally {
      setSaving(false)
    }
  }

  /**
   * Exclui uma partida.
   */
  async function handleDelete(match: Match) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a partida entre ${match.homeTeamName} e ${match.awayTeamName}?`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await deleteMatch(match.id)

      if (selectedMatch?.id === match.id) {
        setSelectedMatch(null)
      }

      setMatches((current) =>
        current.filter((item) => item.id !== match.id),
      )

      setSuccess('Partida excluída com sucesso.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a partida.',
      )
    }
  }

  /**
   * Abre o gerenciamento da partida selecionada.
   */
  function openManagement(match: Match) {
    setSelectedMatch(match)
    setFormOpen(false)
    setEditingId(null)
    setError('')
    setSuccess('')
  }

  /**
   * Atualiza somente a partida gerenciada.
   *
   * Não consulta novamente toda a listagem.
   */
  async function refreshManagedMatch() {
    if (!selectedMatch) return

    try {
      const updated = await findMatchById(selectedMatch.id)

      if (!updated) {
        setSelectedMatch(null)

        setMatches((current) =>
          current.filter((item) => item.id !== selectedMatch.id),
        )

        return
      }

      setSelectedMatch(updated)

      // Se a partida não corresponde mais ao filtro de status,
      // remove o cartão da listagem filtrada.
      if (
        statusFilter !== 'all' &&
        updated.status !== statusFilter
      ) {
        setMatches((current) =>
          current.filter((item) => item.id !== updated.id),
        )

        setSelectedMatch(null)
        return
      }

      // Atualiza apenas o registro alterado.
      setMatches((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar os dados da partida.',
      )
    }
  }

  function closeManagement() {
    setSelectedMatch(null)
    setSuccess('')
  }

  return (
    <div className="admin-module-page matches-page">
      <AdminPageHeader
        title="Partidas"
        description="Gerenciamento e acompanhamento das partidas."
      />

      <section className="matches-toolbar">
        <MatchesFilters
          championships={championships}
          seasons={seasons}
          championshipId={championshipId}
          selectedSeasonId={selectedSeasonId}
          search={search}
          statusFilter={statusFilter}
          onChampionshipChange={handleChampionshipChange}
          onSeasonChange={handleSeasonChange}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
        />

        <div className="matches-toolbar__actions">
          <button
            type="button"
            className="matches-button matches-button--secondary"
            onClick={() => loadMatches().catch(() => undefined)}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Atualizar
          </button>

          <button
            type="button"
            className="matches-button matches-button--primary"
            onClick={openNewForm}
          >
            <CirclePlus size={18} />
            Nova partida
          </button>
        </div>
      </section>

      {error && (
        <div className="matches-feedback matches-feedback--error">
          {error}
        </div>
      )}

      {success && (
        <div className="matches-feedback matches-feedback--success">
          {success}
        </div>
      )}

      {formOpen && (
        <MatchForm
          sectionRef={formSectionRef}
          championships={championships}
          seasons={seasons}
          phases={phases}
          groups={groups}
          rounds={rounds}
          teams={teams}
          championshipId={championshipId}
          form={form}
          editingId={editingId}
          loadingOptions={loadingOptions}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={closeForm}
          onChampionshipChange={handleChampionshipChange}
          onSeasonChange={handleSeasonChange}
          onPhaseChange={handlePhaseChange}
          onGroupChange={handleGroupChange}
          onFieldChange={(field, value) => updateField(field, value)}
        />
      )}

      <section className="matches-list-section">
        <div className="matches-list-section__header">
          <div>
            <h2>Partidas cadastradas</h2>
            <p>Consulte e gerencie os jogos da competição.</p>
          </div>

          <span className="matches-count">
            {matches.length}{' '}
            {matches.length === 1 ? 'partida' : 'partidas'}
          </span>
        </div>

        {loading ? (
          <div className="matches-empty">
            <RefreshCw size={24} />
            <p>Carregando partidas...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="matches-empty">
            <ClipboardList size={32} />
            <h3>Nenhuma partida encontrada</h3>
            <p>Cadastre uma partida para começar o gerenciamento.</p>
          </div>
        ) : (
          <div className="matches-list">
            {orderedMatches.map((match) => (
              <div className="match-list-item" key={match.id}>
                <article
                  className={`match-card match-card--${match.status}`}
                >
                  <div className="match-card__top">
                    <span className="match-card__phase">
                      {match.phaseName}
                    </span>

                    <span
                      className={`match-status match-status--${match.status}`}
                    >
                      {statusLabels[match.status]}
                    </span>
                  </div>

                  <div className="match-card__main">
                    <div className="match-card__team match-card__team--home">
                      <strong>{match.homeTeamName}</strong>
                      <small>Mandante</small>
                    </div>

                    <div className="match-card__score">
                      {match.status === 'finished' ||
                      match.status === 'live' ? (
                        <>
                          <strong>{match.homeScore}</strong>
                          <span>×</span>
                          <strong>{match.awayScore}</strong>
                        </>
                      ) : (
                        <span className="match-card__versus">VS</span>
                      )}
                    </div>

                    <div className="match-card__team match-card__team--away">
                      <strong>{match.awayTeamName}</strong>
                      <small>Visitante</small>
                    </div>
                  </div>

                  <div className="match-card__details">
                    <span>
                      <CalendarDays size={15} />
                      {formatDate(match.scheduledAt)}
                    </span>

                    {(match.city || match.venue) && (
                      <span>
                        <MapPin size={15} />
                        {[match.venue, match.city]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </div>

                  <div className="match-card__actions">
                    <button
                      type="button"
                      className="matches-button matches-button--small matches-button--primary"
                      onClick={() => openManagement(match)}
                      aria-expanded={selectedMatch?.id === match.id}
                    >
                      <Activity size={15} />
                      {selectedMatch?.id === match.id
                        ? 'Gerenciamento aberto'
                        : 'Gerenciar partida'}
                    </button>

                    <button
                      type="button"
                      className="matches-button matches-button--small matches-button--secondary"
                      onClick={() => openEditForm(match)}
                      disabled={
                        match.status === 'live' ||
                        match.status === 'finished'
                      }
                    >
                      <Edit size={15} />
                      Editar
                    </button>

                    <button
                      type="button"
                      className="matches-button matches-button--small matches-button--danger"
                      onClick={() => handleDelete(match).catch(() => undefined)}
                      disabled={
                        match.status !== 'scheduled' &&
                        match.status !== 'cancelled'
                      }
                    >
                      <Trash2 size={15} />
                      Excluir
                    </button>
                  </div>
                </article>

                {selectedMatch?.id === match.id && (
                  <section className="match-expanded-panel">
                    <div className="match-expanded-panel__header">
                      <div>
                        <span>DETALHES DA PARTIDA</span>
                        <h3>
                          {match.homeTeamName} × {match.awayTeamName}
                        </h3>
                      </div>

                      <span
                        className={`match-status match-status--${selectedMatch.status}`}
                      >
                        {statusLabels[selectedMatch.status]}
                      </span>
                    </div>

                    <div className="match-expanded-panel__summary">
                      <div>
                        <span>COMPETIÇÃO / FASE</span>
                        <strong>{match.phaseName}</strong>
                      </div>

                      <div>
                        <span>MANDANTE</span>
                        <strong>{match.homeTeamName}</strong>
                      </div>

                      <div>
                        <span>VISITANTE</span>
                        <strong>{match.awayTeamName}</strong>
                      </div>

                      <div>
                        <span>DATA E HORÁRIO</span>
                        <strong>{formatDate(match.scheduledAt)}</strong>
                      </div>

                      <div>
                        <span>LOCAL</span>
                        <strong>
                          {[match.venue, match.city]
                            .filter(Boolean)
                            .join(' · ') || 'Não informado'}
                        </strong>
                      </div>

                      <div>
                        <span>PLACAR ATUAL</span>
                        <strong>
                          {selectedMatch.homeScore} × {selectedMatch.awayScore}
                        </strong>
                      </div>

                      <div className="match-expanded-panel__notes">
                        <span>OBSERVAÇÕES</span>
                        <strong>
                          {match.notes || 'Nenhuma observação cadastrada.'}
                        </strong>
                      </div>
                    </div>

                    <MatchManagement
                      key={selectedMatch.id}
                      match={selectedMatch}
                      onClose={closeManagement}
                      onUpdated={() =>
                        refreshManagedMatch().catch(() => undefined)
                      }
                    />
                  </section>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
