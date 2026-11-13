
import { X } from 'lucide-react'

import type { AuditLog } from '../../../../../backend/modules/audit/audit.types'

interface AuditDetailsProps {
  record: AuditLog | null
  onClose: () => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date(value))
}

export default function AuditDetails({
  record,
  onClose,
}: AuditDetailsProps) {
  if (!record) {
    return null
  }

  return (
    <div className="audit-modal__overlay" onClick={onClose}>
      <section
        className="audit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="audit-modal__header">
          <div>
            <h2 id="audit-modal-title">Detalhes do registro</h2>
            <p>Informações completas do evento de auditoria.</p>
          </div>

          <button
            type="button"
            className="audit-icon-button"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </header>

        <div className="audit-modal__content">
          <div className="audit-detail">
            <span>Identificador</span>
            <strong>{record.id}</strong>
          </div>

          <div className="audit-detail">
            <span>Responsável</span>
            <strong>{record.userName}</strong>
          </div>

          <div className="audit-detail">
            <span>E-mail</span>
            <strong>{record.userEmail || 'Não informado'}</strong>
          </div>

          <div className="audit-detail">
            <span>Identificador do usuário</span>
            <strong>{record.userId || 'Não informado'}</strong>
          </div>

          <div className="audit-detail">
            <span>Ação</span>
            <strong>{record.action}</strong>
          </div>

          <div className="audit-detail">
            <span>Módulo</span>
            <strong>{record.module}</strong>
          </div>

          <div className="audit-detail">
            <span>Descrição</span>
            <strong>{record.description || 'Sem descrição'}</strong>
          </div>

          <div className="audit-detail">
            <span>Tipo de registro relacionado</span>
            <strong>{record.entityType || 'Não informado'}</strong>
          </div>

          <div className="audit-detail">
            <span>Identificador do registro relacionado</span>
            <strong>{record.entityId || 'Não informado'}</strong>
          </div>

          <div className="audit-detail">
            <span>Endereço IP</span>
            <strong>{record.ipAddress || 'Não registrado'}</strong>
          </div>

          <div className="audit-detail">
            <span>Data e horário</span>
            <strong>{formatDate(record.createdAt)}</strong>
          </div>

          <div className="audit-detail audit-detail--full">
            <span>Navegador e dispositivo</span>
            <strong>{record.userAgent || 'Não registrado'}</strong>
          </div>
        </div>

        <footer className="audit-modal__footer">
          <button
            type="button"
            className="audit-button audit-button--secondary"
            onClick={onClose}
          >
            Fechar
          </button>
        </footer>
      </section>
    </div>
  )
}
