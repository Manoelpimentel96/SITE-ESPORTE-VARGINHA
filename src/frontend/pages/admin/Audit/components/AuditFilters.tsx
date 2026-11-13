
import type { FormEvent } from 'react'

import type { AuditFilters } from '../../../../../backend/modules/audit/audit.types'

interface AuditFiltersProps {
  filters: AuditFilters
  onChange: (field: keyof AuditFilters, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
}

export default function AuditFilters({
  filters,
  onChange,
  onSubmit,
  onClear,
}: AuditFiltersProps) {
  return (
    <form className="audit-filters" onSubmit={onSubmit}>
      <div className="audit-filters__grid">
        <div className="audit-field audit-field--search">
          <label htmlFor="audit-search">Responsável</label>
          <input
            id="audit-search"
            type="search"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Pesquisar pelo nome"
          />
        </div>

        <div className="audit-field">
          <label htmlFor="audit-module">Módulo</label>
          <select
            id="audit-module"
            value={filters.module}
            onChange={(event) => onChange('module', event.target.value)}
          >
            <option value="">Todos os módulos</option>
            <option value="championships">Campeonatos</option>
            <option value="seasons">Temporadas</option>
            <option value="regulations">Regulamentos</option>
            <option value="teams">Equipes</option>
            <option value="players">Jogadores</option>
            <option value="registrations">Inscrições e elencos</option>
            <option value="phases">Fases e grupos</option>
            <option value="matches">Partidas</option>
            <option value="standings">Classificação</option>
            <option value="collaborators">Colaboradores</option>
            <option value="profile">Perfil</option>
            <option value="auth">Autenticação</option>
          </select>
        </div>

        <div className="audit-field">
          <label htmlFor="audit-action">Tipo de ação</label>
          <select
            id="audit-action"
            value={filters.action}
            onChange={(event) => onChange('action', event.target.value)}
          >
            <option value="">Todas as ações</option>
            <option value="login">Entrada</option>
            <option value="logout">Saída</option>
            <option value="create">Criação</option>
            <option value="update">Atualização</option>
            <option value="delete">Exclusão</option>
            <option value="status_change">Alteração de status</option>
            <option value="permission_change">Alteração de permissão</option>
            <option value="other">Outras</option>
          </select>
        </div>

        <div className="audit-field">
          <label htmlFor="audit-start-date">Data inicial</label>
          <input
            id="audit-start-date"
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
          />
        </div>

        <div className="audit-field">
          <label htmlFor="audit-end-date">Data final</label>
          <input
            id="audit-end-date"
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange('endDate', event.target.value)}
          />
        </div>
      </div>

      <div className="audit-filters__actions">
        <button type="button" className="audit-button audit-button--secondary" onClick={onClear}>
          Limpar filtros
        </button>

        <button type="submit" className="audit-button">
          Aplicar filtros
        </button>
      </div>
    </form>
  )
}
