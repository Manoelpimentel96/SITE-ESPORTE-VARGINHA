import type {
    ChangeEvent,
    FormEvent,
} from 'react'

import type {
    ChampionshipOption,
    SeasonOption,
    TeamFormData,
} from '../../../../../services/teams/teamService'

interface TeamFormProps {
  form: TeamFormData
  championships: ChampionshipOption[]
  seasons: SeasonOption[]
  isEditing: boolean
  isSubmitting: boolean
  onChange: (form: TeamFormData) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export default function TeamForm({
  form,
  championships,
  seasons,
  isEditing,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}: TeamFormProps) {
  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    onChange({
      ...form,
      [name]: value,
    })
  }

  function handleCrestChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...form,
      crest: event.target.files?.[0] ?? null,
    })
  }

  return (
    <form className="team-form" onSubmit={onSubmit}>
      <section className="team-form-section">
        <div className="team-form-section-header">
          <div>
            <span className="team-section-number">01</span>
            <h3>Vínculo da equipe</h3>
          </div>

          <p>Selecione o campeonato e, se desejar, a temporada.</p>
        </div>

        <div className="team-form-grid">
          <label className="team-field team-field-full">
            <span>Campeonato</span>

            <select
              name="championshipId"
              value={form.championshipId}
              onChange={handleFieldChange}
              required
            >
              <option value="">Selecione o campeonato</option>

              {championships.map((championship) => (
                <option key={championship.id} value={championship.id}>
                  {championship.name}
                </option>
              ))}
            </select>
          </label>

          <label className="team-field team-field-full">
            <span>Temporada</span>

            <select
              name="seasonId"
              value={form.seasonId}
              onChange={handleFieldChange}
              disabled={!form.championshipId}
            >
              <option value="">Sem vínculo com temporada</option>

              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>

            <small>
              A equipe poderá ser vinculada a uma temporada agora ou posteriormente.
            </small>
          </label>
        </div>
      </section>

      <section className="team-form-section">
        <div className="team-form-section-header">
          <div>
            <span className="team-section-number">02</span>
            <h3>Dados da equipe</h3>
          </div>

          <p>Informações de identificação da equipe participante.</p>
        </div>

        <div className="team-form-grid">
          <label className="team-field team-field-full">
            <span>Nome da equipe</span>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFieldChange}
              placeholder="Ex.: Boa Ideia FC"
              required
            />
          </label>

          <label className="team-field">
            <span>Nome abreviado</span>

            <input
              type="text"
              name="shortName"
              value={form.shortName}
              onChange={handleFieldChange}
              placeholder="Ex.: BIFC"
            />
          </label>

          <label className="team-field">
            <span>Ano de fundação</span>

            <input
              type="number"
              name="foundedYear"
              value={form.foundedYear}
              onChange={handleFieldChange}
              placeholder="Ex.: 2010"
            />
          </label>

          <label className="team-field team-field-full">
            <span>Cidade ou comunidade</span>

            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleFieldChange}
              placeholder="Informe a cidade ou comunidade"
            />
          </label>

          <label className="team-field">
            <span>Cor principal</span>

            <div className="team-color-input">
              <input
                type="color"
                name="primaryColor"
                value={form.primaryColor || '#176b45'}
                onChange={handleFieldChange}
              />

              <span>{form.primaryColor || '#176b45'}</span>
            </div>
          </label>

          <label className="team-field">
            <span>Escudo da equipe</span>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleCrestChange}
            />

            <small>PNG, JPEG ou WEBP.</small>
          </label>
        </div>
      </section>

      <section className="team-form-section">
        <div className="team-form-section-header">
          <div>
            <span className="team-section-number">03</span>
            <h3>Responsáveis</h3>
          </div>

          <p>Identificação dos responsáveis pela equipe.</p>
        </div>

        <div className="team-form-grid">
          <label className="team-field">
            <span>Presidente</span>

            <input
              type="text"
              name="president"
              value={form.president}
              onChange={handleFieldChange}
              placeholder="Nome do presidente"
            />
          </label>

          <label className="team-field">
            <span>Técnico / responsável técnico</span>

            <input
              type="text"
              name="coach"
              value={form.coach}
              onChange={handleFieldChange}
              placeholder="Nome do técnico"
            />
          </label>
        </div>

        <p className="team-form-note">
          O presidente é vinculado à equipe. O técnico é registrado para a
          temporada selecionada.
        </p>
      </section>

      <div className="team-form-actions">
        <button
          type="button"
          className="team-button team-button-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="team-button team-button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Enviando...'
            : isEditing
              ? 'Salvar alterações'
              : 'Cadastrar equipe'}
        </button>
      </div>
    </form>
  )
}
