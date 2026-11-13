
import type { ChangeEvent, FormEvent } from 'react'

import type {
  PlayerFormData,
  PlayerChampionshipOption,
  PlayerSeasonOption,
  PlayerTeamOption,
} from '../../../../../services/players/playerService'

interface PlayerFormProps {
  form: PlayerFormData
  championships: PlayerChampionshipOption[]
  seasons: PlayerSeasonOption[]
  teams: PlayerTeamOption[]
  isEditing: boolean
  isSubmitting: boolean
  onChange: (form: PlayerFormData) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export default function PlayerForm({
  form,
  championships,
  seasons,
  teams,
  isEditing,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}: PlayerFormProps) {
  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    onChange({
      ...form,
      [name]: value,
      ...(name === 'championshipId' ? { seasonId: '', teamId: '' } : {}),
      ...(name === 'seasonId' ? { teamId: '' } : {}),
    })
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...form,
      photo: event.target.files?.[0] ?? null,
    })
  }

  return (
    <form className="player-form" onSubmit={onSubmit}>
      <section className="player-form-section">
        <div className="player-form-section-heading">
          <span>01</span>
          <div>
            <h3>Inscrição na temporada</h3>
            <p>Selecione onde o jogador participará.</p>
          </div>
        </div>

        <div className="player-form-grid">
          <label className="player-field player-field-full">
            <span>Campeonato</span>
            <select
              name="championshipId"
              value={form.championshipId}
              onChange={handleFieldChange}
              required
            >
              <option value="">Selecione o campeonato</option>
              {championships.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="player-field">
            <span>Temporada</span>
            <select
              name="seasonId"
              value={form.seasonId}
              onChange={handleFieldChange}
              disabled={!form.championshipId}
              required
            >
              <option value="">Selecione a temporada</option>
              {seasons.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="player-field">
            <span>Equipe</span>
            <select
              name="teamId"
              value={form.teamId}
              onChange={handleFieldChange}
              disabled={!form.seasonId}
              required
            >
              <option value="">Selecione a equipe</option>
              {teams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="player-form-section">
        <div className="player-form-section-heading">
          <span>02</span>
          <div>
            <h3>Dados do jogador</h3>
            <p>Informações de identificação e cadastro.</p>
          </div>
        </div>

        <div className="player-form-grid">
          <label className="player-field player-field-full">
            <span>Nome completo</span>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleFieldChange}
              placeholder="Nome completo do jogador"
              required
            />
          </label>

          <label className="player-field">
            <span>Data de nascimento</span>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleFieldChange}
            />
          </label>

          <label className="player-field">
            <span>Posição</span>
            <select
              name="position"
              value={form.position}
              onChange={handleFieldChange}
            >
              <option value="">Selecione a posição</option>
              <option value="goalkeeper">Goleiro</option>
              <option value="defender">Defensor</option>
              <option value="midfielder">Meio-campista</option>
              <option value="forward">Atacante</option>
              <option value="other">Outra</option>
            </select>
          </label>

          <label className="player-field">
            <span>Número da camisa</span>
            <input
              type="number"
              name="shirtNumber"
              min="0"
              max="99"
              value={form.shirtNumber}
              onChange={handleFieldChange}
              placeholder="Ex.: 10"
            />
          </label>

          <label className="player-field">
            <span>Foto do jogador</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
            />
            <small>PNG, JPEG ou WEBP.</small>
          </label>
        </div>
      </section>

      <div className="player-form-actions">
        <button
          type="button"
          className="player-button player-button-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="player-button player-button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Enviando...'
            : isEditing
              ? 'Salvar alterações'
              : 'Cadastrar jogador'}
        </button>
      </div>
    </form>
  )
}
