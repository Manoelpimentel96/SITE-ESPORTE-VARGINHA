
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  AlertCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Trophy,
} from 'lucide-react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import {
  deleteChampionship,
  listChampionships,
  type Championship,
  type ChampionshipStatus,
} from '../../../../services/championships/championshipService'

import {
  getErrorMessage,
} from '../../../../lib/errors/AppError'

import '../../../../styles/admin/ChampionshipsPage.css'

type StatusFilter = 'all' | ChampionshipStatus

const statusLabels: Record<ChampionshipStatus, string> = {
  draft: 'Em planejamento',
  published: 'Publicado',
  completed: 'Concluído',
  archived: 'Arquivado',
}

export default function ChampionshipsPage() {
  const navigate = useNavigate()

  const [championships, setChampionships] = useState<Championship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')

  // =========================================================
  // CARREGAMENTO AUTOMÁTICO
  // =========================================================

  useEffect(() => {
    let active = true

    listChampionships({
      search,
      status: statusFilter,
    })
      .then((result) => {
        if (!active) return

        setChampionships(result)
        setLoadError('')
      })
      .catch((error) => {
        if (!active) return

        setLoadError(getErrorMessage(error))
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [search, statusFilter])

  // =========================================================
  // ATUALIZAÇÃO MANUAL
  // =========================================================

  const loadChampionships = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const result = await listChampionships({
        search,
        status: statusFilter,
      })

      setChampionships(result)
    } catch (error) {
      setLoadError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter])

  // =========================================================
  // EDIÇÃO
  // =========================================================

  function handleEdit(championship: Championship) {
    navigate(`/admin/campeonatos/${championship.id}/editar`)
  }

  // =========================================================
  // EXCLUSÃO
  // =========================================================

  async function handleDelete(championship: Championship) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o campeonato "${championship.name}"?`,
    )

    if (!confirmed) return

    setActionError('')
    setDeletingId(championship.id)

    try {
      await deleteChampionship(championship.id)
      await loadChampionships()
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
    <div className="admin-module-page championship-page">
      <AdminPageHeader
        title="Campeonatos"
        description="Gerencie os campeonatos e suas respectivas temporadas."
      />

      <div className="championship-list-toolbar">
        <div className="championship-list-search">
          <Search size={19} />

          <input
            type="search"
            placeholder="Pesquisar campeonato..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="championship-submit-button"
          onClick={() => navigate('/admin/campeonatos/novo')}
        >
          <Plus size={19} />
          Novo campeonato
        </button>
      </div>

      <section className="championship-list-card">
        <div className="championship-list-heading">
          <div>
            <h2>Campeonatos cadastrados</h2>
            <p>Consulte e gerencie as competições do sistema.</p>
          </div>

          <Trophy size={25} />
        </div>

        <div className="championship-list-filters">
          <label htmlFor="championship-filter-status">
            Situação:
          </label>

          <select
            id="championship-filter-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
          >
            <option value="all">Todas</option>
            <option value="draft">Em planejamento</option>
            <option value="published">Publicado</option>
            <option value="completed">Concluído</option>
            <option value="archived">Arquivado</option>
          </select>

          <button
            type="button"
            onClick={() => void loadChampionships()}
            disabled={isLoading}
            title="Atualizar listagem"
          >
            <RefreshCw size={17} />
            Atualizar
          </button>
        </div>

        {actionError && (
          <div
            className="championship-feedback championship-feedback-error"
            role="alert"
          >
            <AlertCircle size={19} />
            <span>{actionError}</span>
          </div>
        )}

        <div className="championship-table-wrapper">
          <table className="championship-table">
            <thead>
              <tr>
                <th>Campeonato</th>
                <th>Sigla</th>
                <th>Situação</th>
                <th>Temporadas</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="championship-empty-state">
                      <p>Carregando campeonatos...</p>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5}>
                    <div className="championship-empty-state">
                      <AlertCircle size={30} />

                      <h3>Não foi possível carregar os campeonatos</h3>
                      <p>{loadError}</p>

                      <button
                        type="button"
                        className="championship-empty-button"
                        onClick={() => void loadChampionships()}
                      >
                        <RefreshCw size={17} />
                        Tentar novamente
                      </button>
                    </div>
                  </td>
                </tr>
              ) : championships.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="championship-empty-state">
                      <div className="championship-empty-icon">
                        <Trophy size={30} />
                      </div>

                      <h3>Nenhum campeonato encontrado</h3>

                      <p>
                        {search.trim() || statusFilter !== 'all'
                          ? 'Nenhum campeonato corresponde aos filtros informados.'
                          : 'Ainda não existem campeonatos cadastrados.'}
                      </p>

                      {!search.trim() && statusFilter === 'all' && (
                        <button
                          type="button"
                          className="championship-empty-button"
                          onClick={() =>
                            navigate('/admin/campeonatos/novo')
                          }
                        >
                          <Plus size={17} />
                          Cadastrar primeiro campeonato
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                championships.map((championship) => (
                  <tr key={championship.id}>
                    <td>
                      <strong>{championship.name}</strong>

                      {championship.description && (
                        <small>{championship.description}</small>
                      )}
                    </td>

                    <td>{championship.acronym || '—'}</td>

                    <td>{statusLabels[championship.status]}</td>

                    <td>Gerenciar em Temporadas</td>

                    <td>
                      <div className="championship-row-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(championship)}
                          disabled={deletingId === championship.id}
                          title="Editar campeonato"
                          aria-label={`Editar campeonato ${championship.name}`}
                        >
                          <Pencil size={17} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(championship)}
                          disabled={deletingId === championship.id}
                          title="Excluir campeonato"
                          aria-label={`Excluir campeonato ${championship.name}`}
                        >
                          <Trash2 size={17} />

                          {deletingId === championship.id
                            ? 'Excluindo...'
                            : 'Excluir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
