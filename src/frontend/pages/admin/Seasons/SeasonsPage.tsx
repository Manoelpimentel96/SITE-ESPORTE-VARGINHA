
import { useEffect, useState } from 'react'

import {
  Plus,
  Search,
  CalendarDays,
  RefreshCw,
  Trash2,
  Pencil,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import {
  listSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
  type Season,
  type SeasonFormData,
  type SeasonStatus,
  type SeasonValidationErrors,
} from '../../../../services/seasons/seasonService'

import {
  listChampionships,
  type Championship,
} from '../../../../services/championships/championshipService'

import {
  getErrorMessage,
} from '../../../../lib/errors/AppError'

import '../../../../styles/admin/SeasonsPage.css'

type StatusFilter = 'all' | SeasonStatus

const statusLabels: Record<SeasonStatus, string> = {
  draft: 'Em planejamento',
  published: 'Publicado',
  active: 'Ativa',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  archived: 'Arquivado',
}

const initialForm: SeasonFormData = {
  championshipId: '',
  name: '',
  year: new Date().getFullYear(),
  startDate: '',
  endDate: '',
  status: 'draft',
}

function formatDate(value: string | null): string {
  if (!value) return '—'

  const [year, month, day] = value.split('-')

  return `${day}/${month}/${year}`
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingChampionships, setIsLoadingChampionships] =
    useState(true)

  const [loadError, setLoadError] = useState('')
  const [championshipError, setChampionshipError] = useState('')
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')
  const [championshipFilter, setChampionshipFilter] =
    useState('all')

  const [reloadToken, setReloadToken] = useState(0)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SeasonFormData>(initialForm)
  const [errors, setErrors] = useState<SeasonValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // =========================================================
  // CARREGAMENTO DOS CAMPEONATOS
  // =========================================================

  useEffect(() => {
    let active = true

    async function loadChampionshipsData() {
      setIsLoadingChampionships(true)
      setChampionshipError('')

      try {
        const result = await listChampionships()

        if (active) {
          setChampionships(result)
        }
      } catch (error) {
        if (active) {
          setChampionshipError(getErrorMessage(error))
        }
      } finally {
        if (active) {
          setIsLoadingChampionships(false)
        }
      }
    }

    void loadChampionshipsData()

    return () => {
      active = false
    }
  }, [])

  // =========================================================
  // CARREGAMENTO DAS TEMPORADAS
  // =========================================================

  useEffect(() => {
    let active = true

    async function loadSeasonsData() {
      setIsLoading(true)
      setLoadError('')

      try {
        const result = await listSeasons({
          search,
          status: statusFilter,
          championshipId: championshipFilter,
        })

        if (active) {
          setSeasons(result)
        }
      } catch (error) {
        if (active) {
          setLoadError(getErrorMessage(error))
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadSeasonsData()

    return () => {
      active = false
    }
  }, [search, statusFilter, championshipFilter, reloadToken])

  // =========================================================
  // ABRIR FORMULÁRIO
  // =========================================================

  function openCreateForm() {
    setEditingId(null)
    setForm({
      ...initialForm,
      championshipId: championships[0]?.id ?? '',
    })
    setErrors({})
    setActionError('')
    setFeedback('')
    setIsFormOpen(true)
  }

  function openEditForm(season: Season) {
    setEditingId(season.id)

    setForm({
      championshipId: season.championshipId,
      name: season.name,
      year: season.year,
      startDate: season.startDate ?? '',
      endDate: season.endDate ?? '',
      status: season.status,
    })

    setErrors({})
    setActionError('')
    setFeedback('')
    setIsFormOpen(true)
  }

  function closeForm() {
    if (isSubmitting) return

    setIsFormOpen(false)
    setEditingId(null)
    setErrors({})
    setActionError('')
    setFeedback('')
  }

  function updateField<K extends keyof SeasonFormData>(
    field: K,
    value: SeasonFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }))

    setActionError('')
    setFeedback('')
  }

  // =========================================================
  // CADASTRO E EDIÇÃO
  // =========================================================

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrors({})
    setActionError('')
    setFeedback('')
    setIsSubmitting(true)

    try {
      let savedSeason: Season

      if (editingId) {
        savedSeason = await updateSeason(editingId, form)
        setFeedback('Temporada atualizada com sucesso.')
      } else {
        savedSeason = await createSeason(form)
        setFeedback('Temporada cadastrada com sucesso.')
      }

      // Mantém o formulário aberto e os dados salvos disponíveis.
      setEditingId(savedSeason.id)
      setForm({
        championshipId: savedSeason.championshipId,
        name: savedSeason.name,
        year: savedSeason.year,
        startDate: savedSeason.startDate ?? '',
        endDate: savedSeason.endDate ?? '',
        status: savedSeason.status,
      })

      setReloadToken((current) => current + 1)
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================
  // EXCLUSÃO
  // =========================================================

  async function handleDelete(season: Season) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a temporada "${season.name}"?`,
    )

    if (!confirmed) return

    setDeletingId(season.id)
    setActionError('')

    try {
      await deleteSeason(season.id)

      setFeedback('Temporada excluída com sucesso.')
      setReloadToken((current) => current + 1)

      if (editingId === season.id) {
        closeForm()
      }
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  // =========================================================
  // INTERFACE
  // =========================================================

  return (
    <div className="admin-module-page seasons-page">
      <AdminPageHeader
        title="Temporadas"
        description="Gerencie as temporadas e suas configurações por campeonato."
      />

      {/* BARRA DE PESQUISA E CADASTRO */}

      <div className="season-list-toolbar">
        <div className="season-list-search">
          <Search size={19} />

          <input
            type="search"
            placeholder="Pesquisar temporada..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="season-primary-button"
          onClick={openCreateForm}
          disabled={isLoadingChampionships || championships.length === 0}
        >
          <Plus size={19} />
          Nova temporada
        </button>
      </div>

      {/* MENSAGENS */}

      {feedback && (
        <div className="season-feedback season-feedback-success" role="status">
          <CheckCircle2 size={19} />
          <span>{feedback}</span>
        </div>
      )}

      {actionError && !isFormOpen && (
        <div className="season-feedback season-feedback-error" role="alert">
          <AlertCircle size={19} />
          <span>{actionError}</span>
        </div>
      )}

      {championshipError && (
        <div className="season-feedback season-feedback-error" role="alert">
          <AlertCircle size={19} />
          <span>{championshipError}</span>
        </div>
      )}

      {!isLoadingChampionships && championships.length === 0 && (
        <div className="season-feedback season-feedback-warning">
          <AlertCircle size={19} />
          <span>
            Cadastre um campeonato antes de criar uma temporada.
          </span>
        </div>
      )}

      {/* FORMULÁRIO */}

      {isFormOpen && (
        <section className="season-form-card">
          <div className="season-form-heading">
            <div>
              <h2>
                {editingId ? 'Editar temporada' : 'Cadastrar temporada'}
              </h2>

              <p>
                Informe os dados gerais da temporada. O regulamento
                específico será configurado separadamente.
              </p>
            </div>

            <button
              type="button"
              className="season-close-button"
              onClick={closeForm}
              disabled={isSubmitting}
              aria-label="Fechar formulário"
            >
              <X size={21} />
            </button>
          </div>

          {actionError && (
            <div className="season-feedback season-feedback-error" role="alert">
              <AlertCircle size={19} />
              <span>{actionError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="season-form-grid">
              <div className="season-form-field season-field-full">
                <label htmlFor="season-championship">
                  Campeonato *
                </label>

                <select
                  id="season-championship"
                  value={form.championshipId}
                  onChange={(event) =>
                    updateField('championshipId', event.target.value)
                  }
                  disabled={isSubmitting || Boolean(editingId)}
                  aria-invalid={Boolean(errors.championshipId)}
                >
                  <option value="">Selecione o campeonato</option>

                  {championships.map((championship) => (
                    <option key={championship.id} value={championship.id}>
                      {championship.name}
                    </option>
                  ))}
                </select>

                {errors.championshipId && (
                  <small className="season-field-error">
                    {errors.championshipId}
                  </small>
                )}
              </div>

              <div className="season-form-field">
                <label htmlFor="season-name">
                  Nome da temporada *
                </label>

                <input
                  id="season-name"
                  type="text"
                  maxLength={100}
                  placeholder="Ex.: Temporada 2026"
                  value={form.name}
                  onChange={(event) =>
                    updateField('name', event.target.value)
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.name)}
                />

                {errors.name && (
                  <small className="season-field-error">
                    {errors.name}
                  </small>
                )}
              </div>

              <div className="season-form-field">
                <label htmlFor="season-year">Ano *</label>

                <input
                  id="season-year"
                  type="number"
                  min={1900}
                  max={2200}
                  value={form.year}
                  onChange={(event) =>
                    updateField('year', Number(event.target.value))
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.year)}
                />

                {errors.year && (
                  <small className="season-field-error">
                    {errors.year}
                  </small>
                )}
              </div>

              <div className="season-form-field">
                <label htmlFor="season-start-date">
                  Data de início
                </label>

                <input
                  id="season-start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField('startDate', event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="season-form-field">
                <label htmlFor="season-end-date">
                  Data de encerramento
                </label>

                <input
                  id="season-end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    updateField('endDate', event.target.value)
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.endDate)}
                />

                {errors.endDate && (
                  <small className="season-field-error">
                    {errors.endDate}
                  </small>
                )}
              </div>

              <div className="season-form-field">
                <label htmlFor="season-status">Situação *</label>

                <select
                  id="season-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField('status', event.target.value as SeasonStatus)
                  }
                  disabled={isSubmitting}
                >
                  <option value="draft">Em planejamento</option>
                  <option value="published">Publicado</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
            </div>

            <div className="season-form-actions">
              <button
                type="button"
                className="season-secondary-button"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                Fechar
              </button>

              <button
                type="submit"
                className="season-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Salvando...'
                  : editingId
                    ? 'Salvar alterações'
                    : 'Cadastrar temporada'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* LISTAGEM */}

      <section className="season-list-card">
        <div className="season-list-heading">
          <div>
            <h2>Temporadas cadastradas</h2>
            <p>Consulte e gerencie as temporadas dos campeonatos.</p>
          </div>

          <CalendarDays size={25} />
        </div>

        {/* FILTROS */}

        <div className="season-list-filters">
          <div className="season-filter-field">
            <label htmlFor="season-filter-championship">
              Campeonato:
            </label>

            <select
              id="season-filter-championship"
              value={championshipFilter}
              onChange={(event) =>
                setChampionshipFilter(event.target.value)
              }
            >
              <option value="all">Todos os campeonatos</option>

              {championships.map((championship) => (
                <option key={championship.id} value={championship.id}>
                  {championship.name}
                </option>
              ))}
            </select>
          </div>

          <div className="season-filter-field">
            <label htmlFor="season-filter-status">Situação:</label>

            <select
              id="season-filter-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="all">Todas</option>
              <option value="draft">Em planejamento</option>
              <option value="published">Publicado</option>
              <option value="in_progress">Em andamento</option>
              <option value="completed">Concluído</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>

          <button
            type="button"
            className="season-refresh-button"
            onClick={() => setReloadToken((current) => current + 1)}
            disabled={isLoading}
            title="Atualizar listagem"
          >
            <RefreshCw size={17} />
            Atualizar
          </button>
        </div>

        {/* TABELA */}

        <div className="season-table-wrapper">
          <table className="season-table">
            <thead>
              <tr>
                <th>Temporada</th>
                <th>Campeonato</th>
                <th>Período</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="season-empty-state">
                      Carregando temporadas...
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5}>
                    <div className="season-empty-state">
                      <AlertCircle size={30} />
                      <h3>Não foi possível carregar as temporadas</h3>
                      <p>{loadError}</p>

                      <button
                        type="button"
                        className="season-secondary-button"
                        onClick={() =>
                          setReloadToken((current) => current + 1)
                        }
                      >
                        <RefreshCw size={17} />
                        Tentar novamente
                      </button>
                    </div>
                  </td>
                </tr>
              ) : seasons.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="season-empty-state">
                      <CalendarDays size={32} />
                      <h3>Nenhuma temporada encontrada</h3>

                      <p>
                        {search.trim() ||
                        statusFilter !== 'all' ||
                        championshipFilter !== 'all'
                          ? 'Nenhuma temporada corresponde aos filtros informados.'
                          : 'Ainda não existem temporadas cadastradas.'}
                      </p>

                      {championships.length > 0 && (
                        <button
                          type="button"
                          className="season-primary-button"
                          onClick={openCreateForm}
                        >
                          <Plus size={17} />
                          Cadastrar primeira temporada
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                seasons.map((season) => {
                  const championship = championships.find(
                    (item) => item.id === season.championshipId,
                  )

                  return (
                    <tr key={season.id}>
                      <td>
                        <strong>{season.name}</strong>
                        <small>{season.year}</small>
                      </td>

                      <td>
                        {championship?.name ?? 'Campeonato não localizado'}
                      </td>

                      <td>
                        {formatDate(season.startDate)}
                        {' até '}
                        {formatDate(season.endDate)}
                      </td>

                      <td>
                        <span
                          className={`season-status season-status-${season.status}`}
                        >
                          {statusLabels[season.status]}
                        </span>
                      </td>

                      <td>
                        <div className="season-row-actions">
                          <button
                            type="button"
                            onClick={() => openEditForm(season)}
                            title="Editar temporada"
                            aria-label={`Editar temporada ${season.name}`}
                            disabled={Boolean(deletingId)}
                          >
                            <Pencil size={17} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(season)}
                            title="Excluir temporada"
                            aria-label={`Excluir temporada ${season.name}`}
                            disabled={Boolean(deletingId)}
                          >
                            <Trash2 size={17} />
                            {deletingId === season.id
                              ? 'Excluindo...'
                              : 'Excluir'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
