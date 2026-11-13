
import {
  Activity,
  CalendarDays,
  Clock3,
  MapPin,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Square,
  Trash2,
  X,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

import type {
  Match,
  MatchEvent,
  MatchEventFormData,
  MatchEventType,
} from '../../../../../backend/modules/matches/matches.types'

import {
  createMatchEvent,
  deleteMatchEvent,
  finishMatch,
  listMatchEvents,
  startMatch,
} from '../../../../../services/matches/matchService'

interface MatchManagementProps {
  match: Match
  onClose: () => void
  onUpdated: () => void
}

const eventLabels: Record<MatchEventType, string> = {
  goal: 'Gol',
  own_goal: 'Gol contra',
  yellow_card: 'Cartão amarelo',
  red_card: 'Cartão vermelho',
  substitution: 'Substituição',
  penalty_goal: 'Gol de pênalti',
  penalty_miss: 'Pênalti perdido',
  other: 'Outro evento',
}

const emptyEvent: MatchEventFormData = {
  teamRegistrationId: '',
  playerRegistrationId: '',
  relatedPlayerRegistrationId: '',
  eventType: 'goal',
  minute: 0,
  addedTime: 0,
  description: '',
}

function getElapsedSeconds(startedAt: string | null) {
  if (!startedAt) return 0

  const start = new Date(startedAt).getTime()

  if (Number.isNaN(start)) return 0

  return Math.max(0, Math.floor((Date.now() - start) / 1000))
}

function formatDate(value: string | null) {
  if (!value) return 'Não informada'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Data inválida'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export default function MatchManagement({
  match,
  onClose,
  onUpdated,
}: MatchManagementProps) {
  // A partida atual vem das props. A página pai atualiza esse objeto
  // depois de consultar novamente o registro no serviço.
  const currentMatch = match

  const [events, setEvents] = useState<MatchEvent[]>([])
  const [eventForm, setEventForm] =
    useState<MatchEventFormData>(emptyEvent)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [elapsedSeconds, setElapsedSeconds] = useState(
    () => getElapsedSeconds(match.startedAt),
  )

  // A pausa é somente visual/local. O status oficial da partida
  // continua sendo controlado pelo serviço.
  const [clockPaused, setClockPaused] = useState(false)

  const clockRunning =
    currentMatch.status === 'live' && !clockPaused

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await listMatchEvents(match.id)
      setEvents(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os eventos.',
      )
    } finally {
      setLoading(false)
    }
  }, [match.id])

  useEffect(() => {
  void Promise.resolve().then(() => loadEvents())
}, [loadEvents])

  // O relógio só executa enquanto a partida está ao vivo
  // e o usuário não pausou sua exibição nesta tela.
  useEffect(() => {
    if (!clockRunning) return

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [clockRunning])

  const currentMinute = Math.floor(elapsedSeconds / 60)

  const formattedClock = [
    String(Math.floor(elapsedSeconds / 60)).padStart(2, '0'),
    String(elapsedSeconds % 60).padStart(2, '0'),
  ].join(':')

  function updateEventField<K extends keyof MatchEventFormData>(
    field: K,
    value: MatchEventFormData[K],
  ) {
    setEventForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleStart() {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updated = await startMatch(currentMatch.id)

      setElapsedSeconds(getElapsedSeconds(updated.startedAt))
      setClockPaused(false)

      setEventForm((current) => ({
        ...current,
        minute: 0,
      }))

      setSuccess('Partida iniciada.')
      onUpdated()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível iniciar a partida.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleFinish() {
    const confirmed = window.confirm(
      'Deseja realmente encerrar esta partida?',
    )

    if (!confirmed) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await finishMatch(currentMatch.id)

      setClockPaused(true)
      setSuccess('Partida encerrada.')
      onUpdated()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível encerrar a partida.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!eventForm.teamRegistrationId) {
      setError('Selecione a equipe do evento.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await createMatchEvent(currentMatch.id, {
        ...eventForm,
        minute: eventForm.minute,
      })

      setEventForm({
        ...emptyEvent,
        teamRegistrationId: eventForm.teamRegistrationId,
        minute: currentMinute,
      })

      await loadEvents()
      onUpdated()

      setSuccess('Evento registrado com sucesso.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível registrar o evento.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteEvent(eventId: string) {
    const confirmed = window.confirm(
      'Deseja excluir este evento da partida?',
    )

    if (!confirmed) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await deleteMatchEvent(currentMatch.id, eventId)
      await loadEvents()
      onUpdated()
      setSuccess('Evento excluído com sucesso.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir o evento.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="match-management">
      <header className="match-management__header">
        <div className="match-management__heading">
          <span className="match-management__eyebrow">
            <Activity size={14} />
            CENTRAL DE CONTROLE
          </span>

          <h2>Gerenciamento da partida</h2>

          <p>
            {currentMatch.homeTeamName} × {currentMatch.awayTeamName}
          </p>
        </div>

        <button
          type="button"
          className="match-management__close"
          onClick={onClose}
          aria-label="Fechar gerenciamento"
        >
          <X size={20} />
        </button>
      </header>

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

      <div className="match-management__details">
        <div>
          <CalendarDays size={16} />
          <span>
            <small>Data e horário</small>
            <strong>{formatDate(currentMatch.scheduledAt)}</strong>
          </span>
        </div>

        <div>
          <MapPin size={16} />
          <span>
            <small>Local</small>
            <strong>
              {[currentMatch.venue, currentMatch.city]
                .filter(Boolean)
                .join(' · ') || 'Não informado'}
            </strong>
          </span>
        </div>

        <div>
          <Activity size={16} />
          <span>
            <small>Fase</small>
            <strong>{currentMatch.phaseName}</strong>
          </span>
        </div>
      </div>

      <section className="match-management__score-panel">
        <span className="match-management__section-label">
          PLACAR DA PARTIDA
        </span>

        <div className="match-management__score">
          <div className="match-management__score-team">
            <strong>{currentMatch.homeTeamName}</strong>
            <span>{currentMatch.homeScore}</span>
            <small>Mandante</small>
          </div>

          <b>×</b>

          <div className="match-management__score-team">
            <strong>{currentMatch.awayTeamName}</strong>
            <span>{currentMatch.awayScore}</span>
            <small>Visitante</small>
          </div>
        </div>
      </section>

      <section className="match-management__clock">
        <div className="match-management__clock-heading">
          <Clock3 size={18} />
          <span>Tempo de jogo</span>
        </div>

        <strong className="match-management__clock-value">
          {formattedClock}
        </strong>

        <small>
          {currentMatch.status === 'live'
            ? clockRunning
              ? 'Partida em andamento'
              : 'Relógio pausado nesta tela'
            : currentMatch.status === 'finished'
              ? 'Partida encerrada'
              : 'Partida ainda não iniciada'}
        </small>

        <div className="match-management__clock-actions">
          {(currentMatch.status === 'scheduled' ||
            currentMatch.status === 'postponed') && (
            <button
              type="button"
              onClick={() => handleStart().catch(() => undefined)}
              disabled={saving}
              className="match-management__action match-management__action--primary"
            >
              <Play size={16} />
              Iniciar partida
            </button>
          )}

          {currentMatch.status === 'live' && (
            <>
              <button
                type="button"
                onClick={() => setClockPaused((value) => !value)}
                disabled={saving}
                className="match-management__action match-management__action--secondary"
              >
                {clockRunning ? (
                  <>
                    <Pause size={16} />
                    Pausar relógio
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Retomar relógio
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleFinish().catch(() => undefined)}
                disabled={saving}
                className="match-management__action match-management__action--danger"
              >
                <Square size={16} />
                Encerrar partida
              </button>
            </>
          )}
        </div>
      </section>

      {currentMatch.status === 'live' && (
        <form
          className="match-management__event-form"
          onSubmit={handleCreateEvent}
        >
          <div className="match-management__section-heading">
            <div>
              <span className="match-management__section-label">
                ACONTECIMENTOS
              </span>
              <h3>Registrar evento</h3>
              <p>Adicione gols, cartões, substituições e outros eventos.</p>
            </div>
          </div>

          <div className="match-management__form-grid">
            <label>
              Equipe
              <select
                value={eventForm.teamRegistrationId}
                onChange={(event) =>
                  updateEventField(
                    'teamRegistrationId',
                    event.target.value,
                  )
                }
                required
              >
                <option value="">Selecione a equipe</option>
                <option value={currentMatch.homeRegistrationId}>
                  {currentMatch.homeTeamName}
                </option>
                <option value={currentMatch.awayRegistrationId}>
                  {currentMatch.awayTeamName}
                </option>
              </select>
            </label>

            <label>
              Tipo de evento
              <select
                value={eventForm.eventType}
                onChange={(event) =>
                  updateEventField(
                    'eventType',
                    event.target.value as MatchEventType,
                  )
                }
              >
                {Object.entries(eventLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Minuto
              <input
                type="number"
                min="0"
                value={eventForm.minute}
                onChange={(event) =>
                  updateEventField('minute', Number(event.target.value))
                }
              />
            </label>

            <label>
              Acréscimos
              <input
                type="number"
                min="0"
                value={eventForm.addedTime}
                onChange={(event) =>
                  updateEventField('addedTime', Number(event.target.value))
                }
              />
            </label>

            <label className="match-management__field--wide">
              ID da inscrição do jogador (opcional)
              <input
                value={eventForm.playerRegistrationId}
                onChange={(event) =>
                  updateEventField(
                    'playerRegistrationId',
                    event.target.value,
                  )
                }
                placeholder="ID da inscrição do jogador"
              />
            </label>

            {eventForm.eventType === 'substitution' && (
              <label className="match-management__field--wide">
                ID da inscrição do jogador substituído
                <input
                  value={eventForm.relatedPlayerRegistrationId}
                  onChange={(event) =>
                    updateEventField(
                      'relatedPlayerRegistrationId',
                      event.target.value,
                    )
                  }
                  placeholder="ID da inscrição"
                />
              </label>
            )}

            <label className="match-management__field--wide">
              Descrição
              <textarea
                value={eventForm.description}
                onChange={(event) =>
                  updateEventField('description', event.target.value)
                }
                rows={3}
                maxLength={500}
                placeholder="Informações adicionais sobre o evento..."
              />
            </label>
          </div>

          <div className="match-management__form-actions">
            <button
              type="submit"
              disabled={saving}
              className="match-management__action match-management__action--primary"
            >
              <Plus size={16} />
              Registrar evento
            </button>
          </div>
        </form>
      )}

      <section className="match-management__events">
        <div className="match-management__events-header">
          <div>
            <span className="match-management__section-label">
              HISTÓRICO
            </span>
            <h3>Eventos da partida</h3>
          </div>

          <button
            type="button"
            onClick={() => loadEvents().catch(() => undefined)}
            disabled={loading}
            className="match-management__refresh"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="match-management__events-empty">
            <RefreshCw size={20} />
            <p>Carregando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="match-management__events-empty">
            <Activity size={24} />
            <p>Nenhum evento registrado nesta partida.</p>
          </div>
        ) : (
          <ul className="match-management__events-list">
            {events.map((item) => (
              <li key={item.id}>
                <div className="match-management__event-time">
                  {item.minute}'
                  {item.addedTime > 0 ? ` + ${item.addedTime}` : ''}
                </div>

                <div className="match-management__event-content">
                  <strong>{eventLabels[item.eventType]}</strong>
                  <small>
                    {item.description || 'Sem descrição'}
                  </small>
                </div>

                {currentMatch.status !== 'finished' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteEvent(item.id).catch(() => undefined)
                    }
                    disabled={saving}
                    aria-label="Excluir evento"
                    className="match-management__event-delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
