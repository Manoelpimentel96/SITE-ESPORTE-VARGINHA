
import { Plus, Search, Users } from 'lucide-react'
import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'
import PlayerForm from './components/PlayerForm'
import PlayerList from './components/PlayerList'

import {
  deletePlayer,
  listChampionships,
  listPlayers,
  listSeasons,
  listTeams,
  savePlayer,
} from '../../../../services/players/playerService'

import type {
  Player,
  PlayerChampionshipOption,
  PlayerFormData,
  PlayerSeasonOption,
  PlayerTeamOption,
} from '../../../../services/players/playerService'

import '../../../../styles/admin/PlayersPage.css'

const emptyForm: PlayerFormData = {
  championshipId: '',
  seasonId: '',
  teamId: '',
  fullName: '',
  birthDate: '',
  position: '',
  shirtNumber: '',
  photo: null,
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [championships, setChampionships] = useState<PlayerChampionshipOption[]>([])
  const [seasons, setSeasons] = useState<PlayerSeasonOption[]>([])
  const [teams, setTeams] = useState<PlayerTeamOption[]>([])

  const [form, setForm] = useState<PlayerFormData>(emptyForm)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadPlayers = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await listPlayers({ search })
      setPlayers(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os jogadores.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    let active = true

    async function loadInitialData() {
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

    void loadInitialData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function fetchPlayers() {
      try {
        const result = await listPlayers({ search })

        if (active) {
          setPlayers(result)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar os jogadores.',
          )
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void fetchPlayers()

    return () => {
      active = false
    }
  }, [search])

  useEffect(() => {
    let active = true

    async function loadOptions() {
      try {
        const result = form.championshipId
          ? await listSeasons(form.championshipId)
          : await Promise.resolve([])

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

    void loadOptions()

    return () => {
      active = false
    }
  }, [form.championshipId])

  useEffect(() => {
    let active = true

    async function loadOptions() {
      try {
        const result = form.seasonId
          ? await listTeams(form.seasonId)
          : await Promise.resolve([])

        if (active) {
          setTeams(result)
        }
      } catch (err) {
        if (active) {
          setTeams([])
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as equipes.',
          )
        }
      }
    }

    void loadOptions()

    return () => {
      active = false
    }
  }, [form.seasonId])

  function openNewForm() {
    setEditingPlayer(null)
    setForm(emptyForm)
    setMessage('')
    setError('')
    setShowForm(true)
  }

  function openEditForm(player: Player) {
    setEditingPlayer(player)

    setForm({
      ...emptyForm,
      id: player.id,
      fullName: player.fullName,
      birthDate: player.birthDate ?? '',
      position: player.position ?? '',
      shirtNumber: player.shirtNumber?.toString() ?? '',
    })

    setMessage('')
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingPlayer(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setError('')

    try {
      const result = await savePlayer(form)

      if (!result.success) {
        setError(result.message)
        return
      }

      setMessage(result.message)
      closeForm()
      await loadPlayers()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o jogador.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(player: Player) {
    if (!window.confirm(`Deseja realmente excluir "${player.fullName}"?`)) {
      return
    }

    setError('')
    setMessage('')

    try {
      const result = await deletePlayer(player.id)

      if (!result.success) {
        setError(result.message)
        return
      }

      setMessage(result.message)
      await loadPlayers()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir o jogador.',
      )
    }
  }

  return (
    <div className="admin-module-page players-page">
      <AdminPageHeader
        title="Jogadores"
        description="Cadastro e gerenciamento dos jogadores inscritos."
      />

      <section className="players-summary">
        <div className="players-summary-icon">
          <Users size={23} />
        </div>
        <div>
          <span>Jogadores encontrados</span>
          <strong>{players.length}</strong>
        </div>
      </section>

      {message && (
        <div className="players-feedback players-feedback-success">
          {message}
        </div>
      )}

      {error && (
        <div className="players-feedback players-feedback-error">
          {error}
        </div>
      )}

      <section className="players-toolbar">
        <div className="players-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Pesquisar jogador..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="player-button player-button-primary"
          onClick={openNewForm}
        >
          <Plus size={18} />
          Novo jogador
        </button>
      </section>

      {showForm && (
        <section className="players-form-container">
          <div className="players-section-heading">
            <div>
              <h2>{editingPlayer ? 'Editar jogador' : 'Cadastrar jogador'}</h2>
              <p>Preencha os dados e selecione a inscrição na temporada.</p>
            </div>
          </div>

          <PlayerForm
            form={form}
            championships={championships}
            seasons={seasons}
            teams={teams}
            isEditing={Boolean(editingPlayer)}
            isSubmitting={isSubmitting}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </section>
      )}

      <section className="players-list-container">
        <div className="players-section-heading">
          <div>
            <h2>Jogadores cadastrados</h2>
            <p>Consulte e gerencie os jogadores.</p>
          </div>
        </div>

        <PlayerList
          players={players}
          isLoading={isLoading}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      </section>
    </div>
  )
}
