import { Activity, Clock3 } from 'lucide-react'

import type { DashboardActivity as DashboardActivityType } from '../../../../../backend/modules/dashboard/dashboard.types'

interface DashboardActivityProps {
  activities: DashboardActivityType[]
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function DashboardActivity({
  activities,
}: DashboardActivityProps) {
  return (
    <section className="dashboard-panel dashboard-activity-panel">
      <div className="dashboard-panel-header">
        <div>
          <h2>Atividades recentes</h2>
          <p>Últimas ações registradas no sistema.</p>
        </div>

        <Activity size={20} />
      </div>

      {activities.length === 0 ? (
        <div className="dashboard-empty">
          Nenhuma atividade registrada.
        </div>
      ) : (
        <div className="dashboard-activity-list">
          {activities.map((activity) => (
            <article
              className="dashboard-activity-item"
              key={activity.id}
            >
              <div className="dashboard-activity-icon">
                <Activity size={17} />
              </div>

              <div className="dashboard-activity-content">
                <strong>{activity.description || activity.action}</strong>

                <span>
                  {activity.userName} · {activity.module}
                </span>

                <small>
                  <Clock3 size={13} />
                  {formatDate(activity.createdAt)}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
