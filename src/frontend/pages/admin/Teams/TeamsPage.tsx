
import { Plus, Search, Users } from 'lucide-react'
import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import TeamForm from './components/TeamForm'
import TeamList from './components/TeamList'

import {
  deleteTeam,
  listChampionships,
  listSeasons,
  listTeams,
  saveTeam,
} from '../../../../services/teams/teamService'

import type {
  ChampionshipOption,
  SeasonOption,
  Team,
  TeamFormData,
} from '../../../../services/teams/teamService'

import '../../../../styles/admin/TeamsPage.css'

const emptyForm: TeamFormData = {
  championshipId: '',
  seasonId: '',
  name: '',
  shortName: '',
  city: '',
  primaryColor: '#176b45',
  foundedYear: '',
  crest: null,
  president: '',
  coach: '',
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [championships, setChampionships] = useState<ChampionshipOption[]>([])
  const [seasons, setSeasons] = useState<SeasonOption[]>([])

  const [form, setForm] = useState<TeamFormData>(emptyForm)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadTeams = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await listTeams({ search })
      setTeams(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as equipes.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [search])

  // Carregamento inicial dos campeonatos.
  useEffect(() => {
    let active = true

    async function fetchChampionships() {
      try {
        const result = await listChampionships()

        if (active) {
          setChampionships(result)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os campeonatos.',
          )
        }
      }
    }

    void fetchChampionships()

    return () => {
      active = false
    }
  }, [])

  // Carregamento da lista de equipes.
  useEffect(() => {
    let active = true

    async function fetchTeams() {
      try {
        const result = await listTeams({ search })

        if (active) {
          setTeams(result)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as equipes.',
          )
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void fetchTeams()

    return () => {
      active = false
    }
  }, [search])

  // Carregamento das temporadas do campeonato selecionado.
  useEffect(() => {
    let active = true

    async function fetchSeasons() {
      if (!form.championshipId) {
        await Promise.resolve()

        if (active) {
          setSeasons([])
        }

        return
      }

      try {
        const result = await listSeasons(form.championshipId)

        if (active) {
          setSeasons(result)
        }
      } catch (err) {
        if (active) {
          setSeasons([])
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as temporadas.',
          )
        }
      }
    }

    void fetchSeasons()

    return () => {
      active = false
    }
  }, [form.championshipId])

  function openNewForm() {
    setEditingTeam(null)
    setForm(emptyForm)
    setMessage('')
    setError('')
    setShowForm(true)
  }

  function openEditForm(team: Team) {
    setEditingTeam(team)

    setForm({
      ...emptyForm,
      id: team.id,
      championshipId: team.championshipId,
      name: team.name,
      shortName: team.shortName ?? '',
      city: team.city ?? '',
      primaryColor: team.primaryColor ?? '#176b45',
      foundedYear: team.foundedYear?.toString() ?? '',
    })

    setMessage('')
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTeam(null)
    setForm(emptyForm)
    setMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setMessage('')
    setError('')

    try {
      const result = await saveTeam(form)

      if (!result.success) {
        setError(result.message)
        return
      }

      setMessage(result.message)
      closeForm()
      await loadTeams()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a equipe.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(team: Team) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a equipe "${team.name}"?`,
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      const result = await deleteTeam(team.id)

      if (!result.success) {
        setError(result.message)
        return
      }

      setMessage(result.message)
      await loadTeams()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a equipe.',
      )
    }
  }

  return (
    <div className="admin-module-page teams-page">
      <AdminPageHeader
        title="Equipes"
        description="Gerenciamento das equipes participantes."
      />

      <section className="teams-summary">
        <div className="teams-summary-icon">
          <Users size={23} />
        </div>

        <div>
          <span>Equipes cadastradas</span>
          <strong>{teams.length}</strong>
        </div>
      </section>

      {message && (
        <div className="teams-feedback teams-feedback-success">
          {message}
        </div>
      )}

      {error && (
        <div className="teams-feedback teams-feedback-error">
          {error}
        </div>
      )}

      <section className="teams-toolbar">
        <div className="teams-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Pesquisar equipe..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="team-button team-button-primary"
          onClick={openNewForm}
        >
          <Plus size={18} />
          Nova equipe
        </button>
      </section>

      {showForm && (
        <section className="teams-form-container">
          <div className="teams-content-heading">
            <div>
              <h2>
                {editingTeam ? 'Editar equipe' : 'Cadastrar equipe'}
              </h2>

              <p>
                Preencha os dados de identificação e participação da equipe.
              </p>
            </div>
          </div>

          <TeamForm
            form={form}
            championships={championships}
            seasons={seasons}
            isEditing={Boolean(editingTeam)}
            isSubmitting={isSubmitting}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </section>
      )}

      <section className="teams-list-container">
        <div className="teams-content-heading">
          <div>
            <h2>Equipes cadastradas</h2>
            <p>Consulte e gerencie as equipes do campeonato.</p>
          </div>
        </div>

        <TeamList
          teams={teams}
          isLoading={isLoading}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      </section>
    </div>
  )
}
