
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
} from 'lucide-react'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  CompetitionPhase,
  Regulation,
  RegulationFormData,
  RegulationFormat,
  TieBreaker,
} from '../../../../services/regulations/regulationService'

import {
  getRegulationBySeasonId,
  publishRegulation,
  saveRegulation,
  validateRegulation,
} from '../../../../services/regulations/regulationService'

import { listChampionships } from '../../../../services/championships/championshipService'
import { listSeasons } from '../../../../services/seasons/seasonService'

import '../../../../styles/admin/RegistrationsPage.css'

type ChampionshipList = Awaited<ReturnType<typeof listChampionships>>
type SeasonList = Awaited<ReturnType<typeof listSeasons>>

const defaultTieBreakers: TieBreaker[] = [
  'wins',
  'goal_difference',
  'goals_for',
  'head_to_head',
]

const initialForm = (seasonId: string): RegulationFormData => ({
  seasonId,
  status: 'draft',
  format: 'league_home_away',

  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,

  tieBreakers: [...defaultTieBreakers],

  groupSettings: {
    groupCount: 2,
    teamsPerGroup: null,
    matchesPerPairing: 'single',
    qualifiedPerGroup: 2,
    bestThirdPlaceCount: 0,
    distribution: 'balanced',
  },

  classificationSettings: {
    totalQualified: null,
    orderBy: [...defaultTieBreakers],
    headToHeadMiniTable: true,
  },

  knockoutSettings: {
    firstRound: 'Quartas de final',
    legs: 'single',
    aggregateEnabled: false,
    awayGoalsRule: false,
    extraTimeEnabled: false,
    penaltyShootoutEnabled: true,
    finalSingleMatch: true,
  },

  matchSettings: {
    legs: 'home_away',
    homeAdvantage: true,
    matchDurationMinutes: 90,
    halfDurationMinutes: 45,
    intervalMinutes: 15,
    allowSameDayMatches: false,
    minimumRestHours: 48,
  },

  phases: [
    {
      key: 'fase_inicial',
      name: 'Fase inicial',
      type: 'league',
      order: 1,
      legs: 'home_away',
    },
  ],

  disciplineSettings: {
    yellowCardSuspensionAfter: 3,
    yellowCardsResetAtStage: false,
    yellowCardsResetAtKnockout: true,
    redCardAutomaticSuspension: true,
    redCardSuspensionMatches: 1,
    disciplinaryReview: true,
    notes: '',
  },

  substitutionSettings: {
    limit: 5,
    windows: 3,
    halftimeDoesNotCountAsWindow: true,
    specialRules: '',
  },

  generalSettings: {
    participationRequirements: '',
    administrativeProcedures: '',
    additionalProvisions: '',
    officialText: '',
  },
})

const formatOptions: {
  value: RegulationFormat
  label: string
}[] = [
  {
    value: 'league_home_away',
    label: 'Pontos corridos — ida e volta',
  },
  {
    value: 'league_single',
    label: 'Pontos corridos — jogo único',
  },
  {
    value: 'groups',
    label: 'Grupos — jogo único ou ida e volta',
  },
  {
    value: 'knockout',
    label: 'Mata-mata',
  },
  {
    value: 'groups_knockout',
    label: 'Grupos + mata-mata',
  },
  {
    value: 'league_knockout',
    label: 'Pontos corridos + mata-mata',
  },
  {
    value: 'custom',
    label: 'Formato personalizado',
  },
]

const tieLabels: Record<TieBreaker, string> = {
  wins: 'Maior número de vitórias',
  goal_difference: 'Saldo de gols',
  goals_for: 'Gols marcados',
  head_to_head: 'Confronto direto',
  fewest_goals_against: 'Menor número de gols sofridos',
  fair_play: 'Fair play / disciplina',
  draw: 'Sorteio',
}

function regulationToForm(
  regulation: Regulation,
): RegulationFormData {
  return {
    seasonId: regulation.seasonId,
    status: regulation.status,
    format: regulation.format,

    pointsWin: regulation.pointsWin,
    pointsDraw: regulation.pointsDraw,
    pointsLoss: regulation.pointsLoss,

    tieBreakers: [...regulation.tieBreakers],

    groupSettings: { ...regulation.groupSettings },

    classificationSettings: {
      ...regulation.classificationSettings,
      orderBy: [...regulation.classificationSettings.orderBy],
    },

    knockoutSettings: { ...regulation.knockoutSettings },
    matchSettings: { ...regulation.matchSettings },

    phases: regulation.phases.map((phase) => ({ ...phase })),

    disciplineSettings: { ...regulation.disciplineSettings },
    substitutionSettings: { ...regulation.substitutionSettings },
    generalSettings: { ...regulation.generalSettings },
  }
}

export default function RegulationsPage() {
  const [championships, setChampionships] =
    useState<ChampionshipList>([])

  const [seasons, setSeasons] =
    useState<SeasonList>([])

  const [championshipId, setChampionshipId] = useState('')
  const [seasonId, setSeasonId] = useState('')

  const [regulation, setRegulation] =
    useState<Regulation | null>(null)

  const [form, setForm] =
    useState<RegulationFormData>(initialForm(''))

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedSeason = useMemo(
    () => seasons.find((season) => season.id === seasonId),
    [seasons, seasonId],
  )

  const loadChampionships = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const rows = await listChampionships()
      setChampionships(rows)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar os campeonatos.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregamento inicial dos campeonatos.
  useEffect(() => {
    let active = true

    Promise.resolve().then(async () => {
      if (!active) return

      setLoading(true)
      setError('')

      try {
        const rows = await listChampionships()

        if (active) {
          setChampionships(rows)
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar os campeonatos.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })

    return () => {
      active = false
    }
  }, [])

  // Carregamento das temporadas do campeonato selecionado.
  useEffect(() => {
    if (!championshipId) return

    let active = true

    Promise.resolve().then(async () => {
      if (!active) return

      setLoading(true)
      setError('')

      try {
        const rows = await listSeasons({ championshipId })

        if (active) {
          setSeasons(rows)
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar as temporadas.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })

    return () => {
      active = false
    }
  }, [championshipId])

  // Carregamento do regulamento da temporada selecionada.
  useEffect(() => {
    if (!seasonId) return

    let active = true

    Promise.resolve().then(async () => {
      if (!active) return

      setLoading(true)
      setError('')

      try {
        const result = await getRegulationBySeasonId(seasonId)

        if (!active) return

        setRegulation(result)

        setForm(
          result
            ? regulationToForm(result)
            : initialForm(seasonId),
        )

        setMessage('')
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar o regulamento.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })

    return () => {
      active = false
    }
  }, [seasonId])

  function handleChampionshipChange(value: string) {
    setChampionshipId(value)

    setSeasons([])
    setSeasonId('')
    setRegulation(null)
    setForm(initialForm(''))

    setError('')
    setMessage('')
  }

  function handleSeasonChange(value: string) {
    setSeasonId(value)

    setRegulation(null)
    setForm(initialForm(value))

    setError('')
    setMessage('')
  }

  function update<K extends keyof RegulationFormData>(
    key: K,
    value: RegulationFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function updateNested<
    K extends
      | 'groupSettings'
      | 'classificationSettings'
      | 'knockoutSettings'
      | 'matchSettings'
      | 'disciplineSettings'
      | 'substitutionSettings'
      | 'generalSettings',
  >(
    key: K,
    value: Partial<RegulationFormData[K]>,
  ) {
    setForm((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...value,
      },
    }))
  }

  function updateTieBreakers(next: TieBreaker[]) {
    setForm((current) => ({
      ...current,
      tieBreakers: next,
      classificationSettings: {
        ...current.classificationSettings,
        orderBy: [...next],
      },
    }))
  }

  function moveTieBreaker(
    index: number,
    direction: -1 | 1,
  ) {
    const nextIndex = index + direction

    if (
      nextIndex < 0 ||
      nextIndex >= form.tieBreakers.length
    ) {
      return
    }

    const next = [...form.tieBreakers]

    const [item] = next.splice(index, 1)

    next.splice(nextIndex, 0, item)

    updateTieBreakers(next)
  }

  async function handleSave() {
    if (!seasonId) {
      setError('Selecione uma temporada.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const saved = await saveRegulation(
        { ...form, seasonId },
        regulation?.id,
      )

      setRegulation(saved)
      setForm(regulationToForm(saved))

      setMessage(
        'Regulamento salvo. O formulário continua aberto para edição.',
      )
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar o regulamento.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleValidate() {
    setError('')
    setMessage('')

    try {
      await validateRegulation({
        ...form,
        seasonId,
      })

      setMessage(
        'Validação concluída. Todas as configurações obrigatórias estão preenchidas.',
      )
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Existem configurações inválidas.',
      )
    }
  }

  async function handlePublish() {
    if (!regulation) {
      setError('Salve o regulamento antes de publicar.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const saved = await saveRegulation(
        { ...form, seasonId },
        regulation.id,
      )

      const published = await publishRegulation(saved.id)

      setRegulation(published)
      setForm(regulationToForm(published))

      setMessage(
        'Regulamento publicado. O formulário permanece aberto.',
      )
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível publicar o regulamento.',
      )
    } finally {
      setSaving(false)
    }
  }

  function addPhase() {
    const order = form.phases.length + 1

    const phase: CompetitionPhase = {
      key: `fase_${Date.now()}`,
      name: `Nova fase ${order}`,
      type: 'knockout',
      order,
      legs: 'single',
    }

    update('phases', [...form.phases, phase])
  }

  function updatePhase(
    index: number,
    patch: Partial<CompetitionPhase>,
  ) {
    update(
      'phases',
      form.phases.map((phase, currentIndex) =>
        currentIndex === index
          ? { ...phase, ...patch }
          : phase,
      ),
    )
  }

  function removePhase(index: number) {
    const remaining = form.phases
      .filter((_, currentIndex) => currentIndex !== index)
      .map((phase, currentIndex) => ({
        ...phase,
        order: currentIndex + 1,
      }))

    update('phases', remaining)
  }

  const usesGroups =
    ['groups', 'groups_knockout'].includes(form.format) ||
    form.phases.some((phase) => phase.type === 'groups')

  const usesKnockout =
    [
      'knockout',
      'groups_knockout',
      'league_knockout',
    ].includes(form.format) ||
    form.phases.some((phase) =>
      ['knockout', 'final'].includes(phase.type),
    )

  return (
    <main className="registrations-page">
      <header className="regulations-heading">
        <div>
          <span className="eyebrow">
            CONFIGURAÇÃO ESPORTIVA
          </span>

          <h1>Regulamentos</h1>

          <p>
            Defina as regras que orientarão fases, partidas,
            classificação e disciplina.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => void loadChampionships()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </header>

      {error && (
        <div className="feedback error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div className="feedback success">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <section className="selection-panel">
        <label>
          1. Campeonato

          <select
            value={championshipId}
            onChange={(event) =>
              handleChampionshipChange(event.target.value)
            }
          >
            <option value="">
              Selecione o campeonato
            </option>

            {championships.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          2. Temporada

          <select
            value={seasonId}
            disabled={!championshipId}
            onChange={(event) =>
              handleSeasonChange(event.target.value)
            }
          >
            <option value="">
              Selecione a temporada
            </option>

            {seasons.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.year}
              </option>
            ))}
          </select>
        </label>

        {selectedSeason && (
          <div className="regulation-status">
            <span>Status do regulamento</span>

            <strong>
              {!regulation
                ? 'Não cadastrado'
                : regulation.status === 'published'
                  ? 'Publicado'
                  : 'Em preparação'}
            </strong>
          </div>
        )}
      </section>

      {loading && (
        <p className="section-help">
          Carregando informações...
        </p>
      )}

      {!seasonId ? (
        <div className="empty-regulation">
          Selecione primeiro um campeonato e depois uma
          temporada para configurar o regulamento.
        </div>
      ) : (
        <>
          <section className="regulation-section">
            <h2>1. Modelo de disputa</h2>

            <div className="field-grid">
              <label>
                Formato

                <select
                  value={form.format}
                  onChange={(event) =>
                    update(
                      'format',
                      event.target.value as RegulationFormat,
                    )
                  }
                >
                  {formatOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {[
                'league_home_away',
                'league_single',
              ].includes(form.format) && (
                <label>
                  Confrontos

                  <select
                    value={form.matchSettings.legs}
                    onChange={(event) =>
                      updateNested('matchSettings', {
                        legs: event.target.value as
                          | 'single'
                          | 'home_away',
                      })
                    }
                  >
                    <option value="single">
                      Jogo único
                    </option>

                    <option value="home_away">
                      Ida e volta
                    </option>
                  </select>
                </label>
              )}
            </div>
          </section>

          <section className="regulation-section">
            <h2>2. Pontuação</h2>

            <p className="section-help">
              A pontuação será utilizada pelo cálculo automático
              da classificação.
            </p>

            <div className="field-grid compact">
              <label>
                Vitória

                <input
                  type="number"
                  min="0"
                  value={form.pointsWin}
                  onChange={(event) =>
                    update('pointsWin', Number(event.target.value))
                  }
                />
              </label>

              <label>
                Empate

                <input
                  type="number"
                  min="0"
                  value={form.pointsDraw}
                  onChange={(event) =>
                    update('pointsDraw', Number(event.target.value))
                  }
                />
              </label>

              <label>
                Derrota

                <input
                  type="number"
                  min="0"
                  value={form.pointsLoss}
                  onChange={(event) =>
                    update('pointsLoss', Number(event.target.value))
                  }
                />
              </label>
            </div>
          </section>

          <section className="regulation-section">
            <h2>3. Classificação e critérios de desempate</h2>

            <div className="field-grid">
              <label>
                Total de classificados (opcional)

                <input
                  type="number"
                  min="1"
                  value={
                    form.classificationSettings.totalQualified ?? ''
                  }
                  onChange={(event) =>
                    updateNested('classificationSettings', {
                      totalQualified: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                />
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={
                    form.classificationSettings.headToHeadMiniTable
                  }
                  onChange={(event) =>
                    updateNested('classificationSettings', {
                      headToHeadMiniTable: event.target.checked,
                    })
                  }
                />

                Usar minitabela de confronto direto
              </label>
            </div>

            <p className="section-help">
              Marque os critérios que serão utilizados e ajuste
              a ordem de prioridade pelos controles ao lado.
            </p>

            <div className="check-list">
              {(Object.keys(tieLabels) as TieBreaker[])
                .filter((key) => form.tieBreakers.includes(key))
                .map((key) => {
                  const index = form.tieBreakers.indexOf(key)

                  return (
                    <div className="tie-breaker-row" key={key}>
                      <label className="check-field">
                        <input
                          type="checkbox"
                          checked
                          onChange={() =>
                            updateTieBreakers(
                              form.tieBreakers.filter(
                                (item) => item !== key,
                              ),
                            )
                          }
                        />

                        {index + 1}. {tieLabels[key]}
                      </label>

                      <div className="tie-breaker-actions">
                        <button
                          type="button"
                          className="icon-button"
                          aria-label="Subir critério"
                          disabled={index === 0}
                          onClick={() =>
                            moveTieBreaker(index, -1)
                          }
                        >
                          <ArrowUp size={16} />
                        </button>

                        <button
                          type="button"
                          className="icon-button"
                          aria-label="Descer critério"
                          disabled={
                            index === form.tieBreakers.length - 1
                          }
                          onClick={() =>
                            moveTieBreaker(index, 1)
                          }
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}

              {(Object.keys(tieLabels) as TieBreaker[])
                .filter((key) => !form.tieBreakers.includes(key))
                .map((key) => (
                  <label key={key} className="check-field">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() =>
                        updateTieBreakers([
                          ...form.tieBreakers,
                          key,
                        ])
                      }
                    />

                    {tieLabels[key]}
                  </label>
                ))}
            </div>
          </section>

          {usesGroups && (
            <section className="regulation-section">
              <h2>4. Equipes e grupos</h2>

              <div className="field-grid">
                <label>
                  Quantidade de grupos

                  <input
                    type="number"
                    min="1"
                    value={form.groupSettings.groupCount}
                    onChange={(event) =>
                      updateNested('groupSettings', {
                        groupCount: Number(event.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  Equipes por grupo

                  <input
                    type="number"
                    min="2"
                    value={
                      form.groupSettings.teamsPerGroup ?? ''
                    }
                    onChange={(event) =>
                      updateNested('groupSettings', {
                        teamsPerGroup: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  />
                </label>

                <label>
                  Classificados por grupo

                  <input
                    type="number"
                    min="1"
                    value={
                      form.groupSettings.qualifiedPerGroup
                    }
                    onChange={(event) =>
                      updateNested('groupSettings', {
                        qualifiedPerGroup: Number(
                          event.target.value,
                        ),
                      })
                    }
                  />
                </label>

                <label>
                  Melhores terceiros colocados

                  <input
                    type="number"
                    min="0"
                    value={
                      form.groupSettings.bestThirdPlaceCount
                    }
                    onChange={(event) =>
                      updateNested('groupSettings', {
                        bestThirdPlaceCount: Number(
                          event.target.value,
                        ),
                      })
                    }
                  />
                </label>

                <label>
                  Confrontos dentro do grupo

                  <select
                    value={
                      form.groupSettings.matchesPerPairing
                    }
                    onChange={(event) =>
                      updateNested('groupSettings', {
                        matchesPerPairing: event.target.value as
                          | 'single'
                          | 'home_away',
                      })
                    }
                  >
                    <option value="single">Jogo único</option>
                    <option value="home_away">Ida e volta</option>
                  </select>
                </label>

                <label>
                  Distribuição

                  <select
                    value={form.groupSettings.distribution}
                    onChange={(event) =>
                      updateNested('groupSettings', {
                        distribution: event.target.value as
                          | 'balanced'
                          | 'manual',
                      })
                    }
                  >
                    <option value="balanced">
                      Automática equilibrada
                    </option>

                    <option value="manual">
                      Manual
                    </option>
                  </select>
                </label>
              </div>
            </section>
          )}

          <section className="regulation-section">
            <h2>5. Fases da competição</h2>

            <p className="section-help">
              Cadastre a sequência de fases da competição.
            </p>

            {form.phases.map((phase, index) => (
              <div className="phase-row" key={phase.key}>
                <label>
                  Nome

                  <input
                    value={phase.name}
                    onChange={(event) =>
                      updatePhase(index, {
                        name: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Tipo

                  <select
                    value={phase.type}
                    onChange={(event) =>
                      updatePhase(index, {
                        type: event.target.value as
                          CompetitionPhase['type'],
                      })
                    }
                  >
                    <option value="league">Liga</option>
                    <option value="groups">Grupos</option>
                    <option value="knockout">Eliminatória</option>
                    <option value="final">Final</option>
                    <option value="other">Outra</option>
                  </select>
                </label>

                <label>
                  Ordem

                  <input
                    type="number"
                    min="1"
                    value={phase.order}
                    onChange={(event) =>
                      updatePhase(index, {
                        order: Number(event.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  Confrontos

                  <select
                    value={phase.legs}
                    onChange={(event) =>
                      updatePhase(index, {
                        legs: event.target.value as
                          | 'single'
                          | 'home_away',
                      })
                    }
                  >
                    <option value="single">Jogo único</option>
                    <option value="home_away">Ida e volta</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="icon-button danger"
                  aria-label="Remover fase"
                  onClick={() => removePhase(index)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}

            <button
              type="button"
              className="secondary-button"
              onClick={addPhase}
            >
              <Plus size={16} />
              Adicionar fase
            </button>
          </section>

          {usesKnockout && (
            <section className="regulation-section">
              <h2>6. Regras do mata-mata</h2>

              <div className="field-grid">
                <label>
                  Primeira fase eliminatória

                  <input
                    value={form.knockoutSettings.firstRound}
                    onChange={(event) =>
                      updateNested('knockoutSettings', {
                        firstRound: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Confrontos

                  <select
                    value={form.knockoutSettings.legs}
                    onChange={(event) =>
                      updateNested('knockoutSettings', {
                        legs: event.target.value as
                          | 'single'
                          | 'home_away',
                      })
                    }
                  >
                    <option value="single">Jogo único</option>
                    <option value="home_away">Ida e volta</option>
                  </select>
                </label>

                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={
                      form.knockoutSettings.aggregateEnabled
                    }
                    onChange={(event) =>
                      updateNested('knockoutSettings', {
                        aggregateEnabled: event.target.checked,
                      })
                    }
                  />

                  Considerar placar agregado
                </label>

                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={
                      form.knockoutSettings.awayGoalsRule
                    }
                    onChange={(event) =>
                      updateNested('knockoutSettings', {
                        awayGoalsRule: event.target.checked,
                      })
                    }
                  />

                  Critério de gol fora
                </label>

                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={
                      form.knockoutSettings.extraTimeEnabled
                    }
                    onChange={(event) =>
                      updateNested('knockoutSettings', {
                        extraTimeEnabled: event.target.checked,
                      })
                    }
                  />

                  Prorrogação
                </label>

                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={
                      form.knockoutSettings.penaltyShootoutEnabled
                    }
                    onChange={(event) =>
                      updateNested('knockoutSettings', {
                        penaltyShootoutEnabled:
                          event.target.checked,
                      })
                    }
                  />

                  Disputa por pênaltis
                </label>

                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={
                      form.knockoutSettings.finalSingleMatch
                    }
                    onChange={(event) =>
                      updateNested('knockoutSettings', {
                        finalSingleMatch: event.target.checked,
                      })
                    }
                  />

                  Final em partida única
                </label>
              </div>
            </section>
          )}

          <section className="regulation-section">
            <h2>7. Configuração das partidas</h2>

            <div className="field-grid">
              <label>
                Duração total (minutos)

                <input
                  type="number"
                  min="1"
                  value={
                    form.matchSettings.matchDurationMinutes
                  }
                  onChange={(event) =>
                    updateNested('matchSettings', {
                      matchDurationMinutes: Number(
                        event.target.value,
                      ),
                    })
                  }
                />
              </label>

              <label>
                Duração de cada tempo

                <input
                  type="number"
                  min="1"
                  value={
                    form.matchSettings.halfDurationMinutes
                  }
                  onChange={(event) =>
                    updateNested('matchSettings', {
                      halfDurationMinutes: Number(
                        event.target.value,
                      ),
                    })
                  }
                />
              </label>

              <label>
                Intervalo (minutos)

                <input
                  type="number"
                  min="0"
                  value={form.matchSettings.intervalMinutes}
                  onChange={(event) =>
                    updateNested('matchSettings', {
                      intervalMinutes: Number(
                        event.target.value,
                      ),
                    })
                  }
                />
              </label>

              <label>
                Descanso mínimo entre partidas (horas)

                <input
                  type="number"
                  min="0"
                  value={
                    form.matchSettings.minimumRestHours
                  }
                  onChange={(event) =>
                    updateNested('matchSettings', {
                      minimumRestHours: Number(
                        event.target.value,
                      ),
                    })
                  }
                />
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={form.matchSettings.homeAdvantage}
                  onChange={(event) =>
                    updateNested('matchSettings', {
                      homeAdvantage: event.target.checked,
                    })
                  }
                />

                Definir mando de campo
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={
                    form.matchSettings.allowSameDayMatches
                  }
                  onChange={(event) =>
                    updateNested('matchSettings', {
                      allowSameDayMatches: event.target.checked,
                    })
                  }
                />

                Permitir jogos no mesmo dia
              </label>
            </div>
          </section>

          <section className="regulation-section">
            <h2>8. Disciplina e cartões</h2>

            <div className="field-grid">
              <label>
                Suspensão após quantos amarelos

                <input
                  type="number"
                  min="0"
                  value={
                    form.disciplineSettings.yellowCardSuspensionAfter
                  }
                  onChange={(event) =>
                    updateNested('disciplineSettings', {
                      yellowCardSuspensionAfter: Number(
                        event.target.value,
                      ),
                    })
                  }
                />
              </label>

              <label>
                Partidas de suspensão por vermelho

                <input
                  type="number"
                  min="0"
                  value={
                    form.disciplineSettings.redCardSuspensionMatches
                  }
                  onChange={(event) =>
                    updateNested('disciplineSettings', {
                      redCardSuspensionMatches: Number(
                        event.target.value,
                      ),
                    })
                  }
                />
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={
                    form.disciplineSettings.yellowCardsResetAtStage
                  }
                  onChange={(event) =>
                    updateNested('disciplineSettings', {
                      yellowCardsResetAtStage:
                        event.target.checked,
                    })
                  }
                />

                Zerar amarelos a cada fase
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={
                    form.disciplineSettings.yellowCardsResetAtKnockout
                  }
                  onChange={(event) =>
                    updateNested('disciplineSettings', {
                      yellowCardsResetAtKnockout:
                        event.target.checked,
                    })
                  }
                />

                Zerar amarelos no mata-mata
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={
                    form.disciplineSettings.redCardAutomaticSuspension
                  }
                  onChange={(event) =>
                    updateNested('disciplineSettings', {
                      redCardAutomaticSuspension:
                        event.target.checked,
                    })
                  }
                />

                Suspensão automática por vermelho
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={
                    form.disciplineSettings.disciplinaryReview
                  }
                  onChange={(event) =>
                    updateNested('disciplineSettings', {
                      disciplinaryReview: event.target.checked,
                    })
                  }
                />

                Permitir análise disciplinar
              </label>
            </div>

            <label>
              Observações disciplinares

              <textarea
                value={form.disciplineSettings.notes}
                onChange={(event) =>
                  updateNested('disciplineSettings', {
                    notes: event.target.value,
                  })
                }
              />
            </label>
          </section>

          <section className="regulation-section">
            <h2>9. Substituições</h2>

            <div className="field-grid">
              <label>
                Limite de substituições

                <input
                  type="number"
                  min="0"
                  value={form.substitutionSettings.limit}
                  onChange={(event) =>
                    updateNested('substitutionSettings', {
                      limit: Number(event.target.value),
                    })
                  }
                />
              </label>

              <label>
                Janelas de substituição

                <input
                  type="number"
                  min="0"
                  value={
                    form.substitutionSettings.windows ?? ''
                  }
                  onChange={(event) =>
                    updateNested('substitutionSettings', {
                      windows: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                />
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={
                    form.substitutionSettings
                      .halftimeDoesNotCountAsWindow
                  }
                  onChange={(event) =>
                    updateNested('substitutionSettings', {
                      halftimeDoesNotCountAsWindow:
                        event.target.checked,
                    })
                  }
                />

                Intervalo não conta como janela
              </label>
            </div>

            <label>
              Regras especiais

              <textarea
                value={
                  form.substitutionSettings.specialRules
                }
                onChange={(event) =>
                  updateNested('substitutionSettings', {
                    specialRules: event.target.value,
                  })
                }
              />
            </label>
          </section>

          <section className="regulation-section">
            <h2>10. Disposições gerais e texto oficial</h2>

            <label>
              Requisitos de participação

              <textarea
                value={
                  form.generalSettings.participationRequirements
                }
                onChange={(event) =>
                  updateNested('generalSettings', {
                    participationRequirements: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Procedimentos administrativos

              <textarea
                value={
                  form.generalSettings.administrativeProcedures
                }
                onChange={(event) =>
                  updateNested('generalSettings', {
                    administrativeProcedures: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Disposições adicionais

              <textarea
                value={
                  form.generalSettings.additionalProvisions
                }
                onChange={(event) =>
                  updateNested('generalSettings', {
                    additionalProvisions: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Texto oficial completo

              <textarea
                className="official-text"
                value={form.generalSettings.officialText}
                onChange={(event) =>
                  updateNested('generalSettings', {
                    officialText: event.target.value,
                  })
                }
              />
            </label>
          </section>

          <footer className="regulation-actions">
            <span>
              {regulation?.status === 'published'
                ? 'Regulamento publicado'
                : 'Alterações ainda não publicadas'}
            </span>

            <div>
              <button
                type="button"
                className="secondary-button"
                disabled={saving}
                onClick={() => void handleValidate()}
              >
                <CheckCircle2 size={16} />
                Validar
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar rascunho'}
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={saving}
                onClick={() => void handlePublish()}
              >
                <Send size={16} />
                Publicar
              </button>
            </div>
          </footer>
        </>
      )}
    </main>
  )
}
