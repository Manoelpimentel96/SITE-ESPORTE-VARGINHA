import type { FormEvent, Ref } from 'react'
import { X } from 'lucide-react'

import type {
  ChampionshipOption,
  GroupOption,
  MatchFormData,
  MatchTeamOption,
  PhaseOption,
  RoundOption,
  SeasonOption,
} from '../../../../../backend/modules/matches/matches.types'

interface MatchFormProps {
  // Referência do cartão do formulário, usada pela página para rolar até ele.
  sectionRef?: Ref<HTMLElement>

  championships: ChampionshipOption[]
  seasons: SeasonOption[]
  phases: PhaseOption[]
  groups: GroupOption[]
  rounds: RoundOption[]
  teams: MatchTeamOption[]

  championshipId: string
  form: MatchFormData
  editingId: string | null

  loadingOptions: boolean
  saving: boolean

  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onChampionshipChange: (value: string) => void
  onSeasonChange: (value: string) => void
  onPhaseChange: (value: string) => void
  onGroupChange: (value: string) => void
  onFieldChange: (field: keyof MatchFormData, value: string) => void
}

export default function MatchForm({
  sectionRef,
  championships,
  seasons,
  phases,
  groups,
  rounds,
  teams,
  championshipId,
  form,
  editingId,
  loadingOptions,
  saving,
  onSubmit,
  onClose,
  onChampionshipChange,
  onSeasonChange,
  onPhaseChange,
  onGroupChange,
  onFieldChange,
}: MatchFormProps) {
  return (
    <section
      ref={sectionRef}
      className="matches-form-card"
      // Deixa um respiro no topo ao rolar, para o título não encostar na borda.
      style={{ scrollMarginTop: '1.5rem' }}
    >
      <div className="matches-form-card__header">
        <div>
          <h2>{editingId ? 'Editar partida' : 'Cadastrar partida'}</h2>
          <p>
            Informe os dados da partida e sua vinculação à temporada.
          </p>
        </div>

        <button
          type="button"
          className="matches-icon-button"
          onClick={onClose}
          aria-label="Fechar formulário"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="matches-form-grid">
          <label className="matches-field">
            <span>Campeonato</span>

            <select
              value={championshipId}
              onChange={(event) => onChampionshipChange(event.target.value)}
              required
            >
              <option value="">Selecione</option>

              {championships.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="matches-field">
            <span>Temporada</span>

            <select
              value={form.seasonId}
              onChange={(event) => onSeasonChange(event.target.value)}
              required
              disabled={!championshipId}
            >
              <option value="">Selecione</option>

              {seasons.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="matches-field">
            <span>Fase</span>

            <select
              value={form.phaseId}
              onChange={(event) => onPhaseChange(event.target.value)}
              required
              disabled={!form.seasonId || loadingOptions}
            >
              <option value="">Selecione</option>

              {phases.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="matches-field">
            <span>Grupo</span>

            <select
              value={form.groupId}
              onChange={(event) => onGroupChange(event.target.value)}
              disabled={!form.phaseId}
            >
              <option value="">Sem grupo</option>

              {groups.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="matches-field">
            <span>Rodada</span>

            <select
              value={form.roundId}
              onChange={(event) =>
                onFieldChange('roundId', event.target.value)
              }
              disabled={!form.phaseId}
            >
              <option value="">Sem rodada</option>

              {rounds.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="matches-field">
            <span>Equipe mandante</span>

            <select
              value={form.homeRegistrationId}
              onChange={(event) =>
                onFieldChange('homeRegistrationId', event.target.value)
              }
              required
              disabled={!form.seasonId || loadingOptions}
            >
              <option value="">Selecione a equipe</option>

              {teams.map((team) => (
                <option
                  key={team.registrationId}
                  value={team.registrationId}
                >
                  {team.teamName}
                </option>
              ))}
            </select>
          </label>

          <label className="matches-field">
            <span>Equipe visitante</span>

            <select
              value={form.awayRegistrationId}
              onChange={(event) =>
                onFieldChange('awayRegistrationId', event.target.value)
              }
              required
              disabled={!form.seasonId || loadingOptions}
            >
              <option value="">Selecione a equipe</option>

              {teams.map((team) => (
                <option
                  key={team.registrationId}
                  value={team.registrationId}
                >
                  {team.teamName}
                </option>
              ))}
            </select>
          </label>

          <label className="matches-field">
            <span>Data e horário</span>

            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) =>
                onFieldChange('scheduledAt', event.target.value)
              }
              required
            />
          </label>

          <label className="matches-field">
            <span>Cidade</span>

            <input
              value={form.city}
              onChange={(event) =>
                onFieldChange('city', event.target.value)
              }
              maxLength={120}
              placeholder="Ex.: Baião - PA"
            />
          </label>

          <label className="matches-field">
            <span>Campo / local</span>

            <input
              value={form.venue}
              onChange={(event) =>
                onFieldChange('venue', event.target.value)
              }
              maxLength={160}
              placeholder="Nome do campo ou estádio"
            />
          </label>

          <label className="matches-field matches-field--full">
            <span>Observações</span>

            <textarea
              value={form.notes}
              onChange={(event) =>
                onFieldChange('notes', event.target.value)
              }
              rows={3}
              maxLength={2000}
              placeholder="Informações adicionais sobre a partida..."
            />
          </label>
        </div>

        <div className="matches-form-actions">
          <button
            type="button"
            className="matches-button matches-button--secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="matches-button matches-button--primary"
            disabled={saving}
          >
            {saving
              ? 'Salvando...'
              : editingId
                ? 'Salvar alterações'
                : 'Cadastrar partida'}
          </button>
        </div>
      </form>
    </section>
  )
}
