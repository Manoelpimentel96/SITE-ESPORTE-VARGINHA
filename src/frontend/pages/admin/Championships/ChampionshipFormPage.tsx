
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Save,
  Trophy,
} from 'lucide-react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import {
  createChampionship,
  getChampionshipById,
  updateChampionship,
  validateChampionship,
  type ChampionshipFormData,
  type ChampionshipStatus,
} from '../../../../services/championships/championshipService'

import {
  getErrorMessage,
} from '../../../../lib/errors/AppError'

import '../../../../styles/admin/ChampionshipsPage.css'

const initialForm: ChampionshipFormData = {
  name: '',
  acronym: '',
  description: '',
  status: 'draft',
}

export default function ChampionshipFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const isEditing = Boolean(id)

  const [form, setForm] = useState<ChampionshipFormData>(initialForm)

  const [errors, setErrors] = useState<
    Partial<Record<keyof ChampionshipFormData, string>>
  >({})

  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<
    'success' | 'error' | ''
  >('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditing)
  const [loadFailed, setLoadFailed] = useState(false)

  // =========================================================
  // CARREGAMENTO DO CAMPEONATO PARA EDIÇÃO
  // =========================================================

  useEffect(() => {
    if (!id) return

    let active = true

    async function loadChampionship() {
      setIsLoadingRecord(true)
      setLoadFailed(false)
      setFeedback('')
      setFeedbackType('')

      try {
        const championship = await getChampionshipById(id!)

        if (!active) return

        if (!championship) {
          throw new Error('Campeonato não encontrado.')
        }

        setForm({
          name: championship.name ?? '',
          acronym: championship.acronym ?? '',
          description: championship.description ?? '',
          status: championship.status,
        })
      } catch (error) {
        if (!active) return

        setLoadFailed(true)
        setFeedback(getErrorMessage(error))
        setFeedbackType('error')
      } finally {
        if (active) {
          setIsLoadingRecord(false)
        }
      }
    }

    void loadChampionship()

    return () => {
      active = false
    }
  }, [id])

  // =========================================================
  // ATUALIZAÇÃO DOS CAMPOS
  // =========================================================

  function updateField<K extends keyof ChampionshipFormData>(
    field: K,
    value: ChampionshipFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }))

    setFeedback('')
    setFeedbackType('')
  }

  // =========================================================
  // CADASTRO OU ATUALIZAÇÃO
  // =========================================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting || isLoadingRecord || loadFailed) return

    setFeedback('')
    setFeedbackType('')

    const validationErrors = await validateChampionship(form)

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setFeedback(
        'Verifique os campos destacados antes de continuar.',
      )
      setFeedbackType('error')
      return
    }

    setIsSubmitting(true)

    try {
      const championship = isEditing && id
        ? await updateChampionship(id, form)
        : await createChampionship(form)

      setFeedback(
        isEditing
          ? `Campeonato "${championship.name}" atualizado com sucesso.`
          : `Campeonato "${championship.name}" cadastrado com sucesso.`,
      )

      setFeedbackType('success')
    } catch (error) {
      setFeedback(getErrorMessage(error))
      setFeedbackType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================
  // SAÍDA DO FORMULÁRIO
  // =========================================================

  function handleExit() {
    navigate('/admin/campeonatos')
  }

  const formDisabled = isSubmitting || isLoadingRecord || loadFailed

  // =========================================================
  // INTERFACE
  // =========================================================

  return (
    <div className="admin-module-page championship-page">
      <AdminPageHeader
        title={isEditing ? 'Editar campeonato' : 'Cadastro de campeonato'}
        description={
          isEditing
            ? 'Atualize as informações e a situação do campeonato.'
            : 'Cadastre e configure as informações principais do campeonato.'
        }
      />

      <div className="championship-breadcrumb">
        <button
          type="button"
          onClick={handleExit}
          className="championship-back-button"
          disabled={isSubmitting}
        >
          <ArrowLeft size={17} />
          Voltar aos campeonatos
        </button>

        <span>/</span>
        <span>Campeonatos</span>
        <span>/</span>
        <strong>
          {isEditing ? 'Editar campeonato' : 'Novo campeonato'}
        </strong>
      </div>

      {isLoadingRecord && (
        <div className="championship-information">
          <Info size={19} />
          <div>
            <strong>Carregando campeonato...</strong>
            <p>Aguarde enquanto os dados são carregados.</p>
          </div>
        </div>
      )}

      <form
        className="championship-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <section className="championship-form-card">
          <div className="championship-section-heading">
            <div className="championship-section-icon">
              <Trophy size={21} />
            </div>

            <div>
              <h2>Identificação do campeonato</h2>

              <p>
                Informe os dados principais para identificar a competição.
              </p>
            </div>
          </div>

          <div className="championship-form-grid">
            <div className="championship-field championship-field-full">
              <label htmlFor="championship-name">
                Nome do campeonato <span>*</span>
              </label>

              <input
                id="championship-name"
                type="text"
                placeholder="Nome do campeonato"
                value={form.name}
                maxLength={120}
                onChange={(event) =>
                  updateField('name', event.target.value)
                }
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? 'championship-name-error' : undefined
                }
                disabled={formDisabled}
              />

              {errors.name && (
                <small
                  id="championship-name-error"
                  className="championship-field-error"
                >
                  {errors.name}
                </small>
              )}
            </div>

            <div className="championship-field">
              <label htmlFor="championship-acronym">
                Sigla
              </label>

              <input
                id="championship-acronym"
                type="text"
                placeholder="Ex.: CV"
                value={form.acronym}
                maxLength={12}
                onChange={(event) =>
                  updateField(
                    'acronym',
                    event.target.value.toUpperCase(),
                  )
                }
                aria-invalid={Boolean(errors.acronym)}
                aria-describedby={
                  errors.acronym
                    ? 'championship-acronym-error'
                    : undefined
                }
                disabled={formDisabled}
              />

              {errors.acronym && (
                <small
                  id="championship-acronym-error"
                  className="championship-field-error"
                >
                  {errors.acronym}
                </small>
              )}
            </div>

            <div className="championship-field">
              <label htmlFor="championship-status">
                Situação <span>*</span>
              </label>

              <select
                id="championship-status"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    'status',
                    event.target.value as ChampionshipStatus,
                  )
                }
                aria-invalid={Boolean(errors.status)}
                disabled={formDisabled}
              >
                <option value="draft">Em planejamento</option>
                <option value="published">Publicado</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>

              {errors.status && (
                <small className="championship-field-error">
                  {errors.status}
                </small>
              )}
            </div>

            <div className="championship-field championship-field-full">
              <label htmlFor="championship-description">
                Descrição
              </label>

              <textarea
                id="championship-description"
                placeholder="Descreva o campeonato, sua finalidade e suas características."
                rows={5}
                maxLength={1000}
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                aria-invalid={Boolean(errors.description)}
                disabled={formDisabled}
              />

              <div className="championship-character-count">
                {form.description.length}/1000 caracteres
              </div>

              {errors.description && (
                <small className="championship-field-error">
                  {errors.description}
                </small>
              )}
            </div>
          </div>
        </section>

        <div className="championship-information">
          <Info size={19} />

          <div>
            <strong>
              Cadastro organizado por campeonato e temporada
            </strong>

            <p>
              As temporadas serão cadastradas separadamente. O mesmo
              campeonato poderá ter várias edições, preservando seu histórico.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`championship-feedback championship-feedback-${feedbackType}`}
            role={feedbackType === 'error' ? 'alert' : 'status'}
          >
            {feedbackType === 'success' ? (
              <CheckCircle2 size={19} />
            ) : (
              <AlertCircle size={19} />
            )}

            <span>{feedback}</span>
          </div>
        )}

        <div className="championship-form-actions">
          <button
            type="button"
            className="championship-cancel-button"
            onClick={handleExit}
            disabled={isSubmitting}
          >
            {isEditing ? 'Voltar' : 'Sair do cadastro'}
          </button>

          <button
            type="submit"
            className="championship-submit-button"
            disabled={formDisabled}
          >
            <Save size={18} />

            {isLoadingRecord
              ? 'Carregando...'
              : isSubmitting
                ? 'Salvando campeonato...'
                : isEditing
                  ? 'Atualizar campeonato'
                  : 'Salvar campeonato'}
          </button>
        </div>
      </form>
    </div>
  )
}
