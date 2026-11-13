
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import { auditService } from '../../../../services/audit/auditService'

import type {
  AuditFilters,
  AuditLog,
} from '../../../../backend/modules/audit/audit.types'

import AuditFiltersComponent from './components/AuditFilters'
import AuditTable from './components/AuditTable'
import AuditDetails from './components/AuditDetails'

import '../../../../styles/admin/AuditPage.css'

const initialFilters: AuditFilters = {
  search: '',
  module: '',
  action: '',
  startDate: '',
  endDate: '',
  page: 1,
  pageSize: 20,
}

export default function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] =
    useState<AuditFilters>(initialFilters)

  const [records, setRecords] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRecord, setSelectedRecord] = useState<AuditLog | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const totalPages = Math.max(
    1,
    Math.ceil(total / appliedFilters.pageSize),
  )

  const loadRecords = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await auditService.list(appliedFilters)

      setRecords(result.data)
      setTotal(result.total)
    } catch (err) {
      setRecords([])
      setTotal(0)

      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os registros de auditoria.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [appliedFilters])

  useEffect(() => {
    let active = true

    async function fetchRecords() {
      try {
        const result = await auditService.list(appliedFilters)

        if (!active) return

        setRecords(result.data)
        setTotal(result.total)
        setError('')
      } catch (err) {
        if (!active) return

        setRecords([])
        setTotal(0)

        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os registros de auditoria.',
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void fetchRecords()

    return () => {
      active = false
    }
  }, [appliedFilters])

  function handleFilterChange(
    field: keyof AuditFilters,
    value: string,
  ) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleApplyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setAppliedFilters({
      ...filters,
      page: 1,
    })
  }

  function handleClearFilters() {
    setFilters(initialFilters)
    setAppliedFilters(initialFilters)
  }

  function handlePageChange(page: number) {
    setAppliedFilters((current) => ({
      ...current,
      page,
    }))

    setFilters((current) => ({
      ...current,
      page,
    }))
  }

  return (
    <div className="admin-module-page audit-page">
      <AdminPageHeader
        title="Auditoria"
        description="Registro de acessos e ações administrativas."
      />

      <section className="audit-summary">
        <div>
          <span>Total de registros encontrados</span>
          <strong>{total.toLocaleString('pt-BR')}</strong>
        </div>

        <button
          type="button"
          className="audit-button audit-button--secondary"
          onClick={() => void loadRecords()}
          disabled={isLoading}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </section>

      <section className="audit-panel">
        <div className="audit-panel__heading">
          <div>
            <h2>Histórico de atividades</h2>
            <p>
              Consulte os acessos e as ações realizadas no painel
              administrativo.
            </p>
          </div>
        </div>

        <AuditFiltersComponent
          filters={filters}
          onChange={handleFilterChange}
          onSubmit={handleApplyFilters}
          onClear={handleClearFilters}
        />

        {error && (
          <div className="audit-error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        <AuditTable
          records={records}
          loading={isLoading}
          onView={setSelectedRecord}
        />

        <div className="audit-pagination">
          <span>
            Página {appliedFilters.page} de {totalPages}
          </span>

          <div className="audit-pagination__actions">
            <button
              type="button"
              className="audit-button audit-button--secondary"
              onClick={() => handlePageChange(appliedFilters.page - 1)}
              disabled={isLoading || appliedFilters.page <= 1}
            >
              Anterior
            </button>

            <button
              type="button"
              className="audit-button audit-button--secondary"
              onClick={() => handlePageChange(appliedFilters.page + 1)}
              disabled={isLoading || appliedFilters.page >= totalPages}
            >
              Próxima
            </button>
          </div>
        </div>
      </section>

      <AuditDetails
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  )
}
