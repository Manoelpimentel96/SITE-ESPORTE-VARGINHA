
import { Eye } from 'lucide-react'

import type { AuditLog } from '../../../../../backend/modules/audit/audit.types'

interface AuditTableProps {
  records: AuditLog[]
  loading: boolean
  onView: (record: AuditLog) => void
}

const actionLabels: Record<string, string> = {
  login: 'Entrada',
  logout: 'Saída',
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  status_change: 'Alteração de status',
  permission_change: 'Alteração de permissão',
  other: 'Outra ação',
}

const moduleLabels: Record<string, string> = {
  championships: 'Campeonatos',
  seasons: 'Temporadas',
  regulations: 'Regulamentos',
  teams: 'Equipes',
  players: 'Jogadores',
  registrations: 'Inscrições e elencos',
  phases: 'Fases e grupos',
  matches: 'Partidas',
  standings: 'Classificação',
  collaborators: 'Colaboradores',
  profile: 'Perfil',
  auth: 'Autenticação',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AuditTable({
  records,
  loading,
  onView,
}: AuditTableProps) {
  if (loading) {
    return (
      <div className="audit-table__state">
        Carregando registros de auditoria...
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="audit-table__state">
        <strong>Nenhum registro encontrado.</strong>
        <span>Os registros aparecerão aqui quando houver eventos de auditoria.</span>
      </div>
    )
  }

  return (
    <div className="audit-table__wrapper">
      <table className="audit-table">
        <thead>
          <tr>
            <th>Data e horário</th>
            <th>Responsável</th>
            <th>Ação</th>
            <th>Módulo</th>
            <th>Descrição</th>
            <th className="audit-table__action-column">Detalhes</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td className="audit-table__date">
                {formatDate(record.createdAt)}
              </td>

              <td>
                <strong>{record.userName}</strong>
                {record.userEmail && (
                  <span className="audit-table__secondary">
                    {record.userEmail}
                  </span>
                )}
              </td>

              <td>
                <span className="audit-action">
                  {actionLabels[record.action] ?? record.action}
                </span>
              </td>

              <td>
                {moduleLabels[record.module] ?? record.module}
              </td>

              <td className="audit-table__description">
                {record.description || 'Sem descrição'}
              </td>

              <td className="audit-table__action-column">
                <button
                  type="button"
                  className="audit-icon-button"
                  onClick={() => onView(record)}
                  aria-label={`Ver detalhes do registro ${record.id}`}
                  title="Ver detalhes"
                >
                  <Eye size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
