
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { publicService } from '../../../services/public/publicService'
import type {
  PublicChampionship,
  PublicSeason,
} from '../../../backend/modules/public/public.types'

import '../../../styles/public/PublicLayout.css'

const navigation = [
  { label: 'Visão geral', to: '' },
  { label: 'Equipes', to: 'equipes' },
  { label: 'Partidas', to: 'partidas' },
  { label: 'Classificação', to: 'classificacao' },
  { label: 'Jogadores', to: 'jogadores' },
  { label: 'Estatísticas', to: 'estatisticas' },
  { label: 'Edições anteriores', to: 'edicoes-anteriores' },
]

export default function PublicLayout() {
  const [championships, setChampionships] = useState<PublicChampionship[]>([])
  const [seasons, setSeasons] = useState<PublicSeason[]>([])

  const [championshipId, setChampionshipId] = useState('')
  const [seasonId, setSeasonId] = useState('')
  const [seasonsChampionshipId, setSeasonsChampionshipId] = useState('')

  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let active = true

    publicService
      .listChampionships()
      .then((items) => {
        if (!active) return

        setChampionships(items)
        setError('')

        if (items[0]) {
          setChampionshipId(items[0].id)
        }
      })
      .catch((reason: unknown) => {
        if (!active) return

        setError(
          reason instanceof Error
            ? reason.message
            : 'Não foi possível carregar os campeonatos.',
        )
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!championshipId) return

    let active = true

    publicService
      .listSeasons(championshipId)
      .then((items) => {
        if (!active) return

        setSeasons(items)
        setSeasonsChampionshipId(championshipId)
        setError('')
        setSeasonId(items[0]?.id ?? '')
      })
      .catch((reason: unknown) => {
        if (!active) return

        setSeasons([])
        setSeasonsChampionshipId(championshipId)
        setSeasonId('')
        setError(
          reason instanceof Error
            ? reason.message
            : 'Não foi possível carregar as temporadas.',
        )
      })

    return () => {
      active = false
    }
  }, [championshipId])

  const seasonsLoaded = seasonsChampionshipId === championshipId
  const selectedSeasonIsAvailable = seasons.some(
    (season) => season.id === seasonId,
  )

  return (
    <div className="public-site">
      <header className="public-header">
        <div className="public-topline">
          <Link to="/portal" className="public-community">
            Portal Esportivo Vila de Varginha
          </Link>

          <Link to="/login" className="public-admin-link">
            Área administrativa ↗
          </Link>
        </div>

        <div className="public-brand-row">
          <Link to="/portal" className="public-brand">
            <span className="public-brand-mark">EV</span>

            <span>
              <strong>ESPORTE VARGINHA</strong>
              <small>CAMPEONATOS · RESULTADOS · CLASSIFICAÇÃO</small>
            </span>
          </Link>

          <div className="public-context">
            <label htmlFor="public-championship">
              Campeonato
            </label>

            <select
              id="public-championship"
              value={championshipId}
              onChange={(event) => setChampionshipId(event.target.value)}
              disabled={!championships.length}
            >
              {championships.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <label htmlFor="public-season">
              Temporada
            </label>

            <select
              id="public-season"
              value={seasonId}
              onChange={(event) => setSeasonId(event.target.value)}
              disabled={!seasonsLoaded || !seasons.length}
            >
              {seasons.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="public-menu-toggle"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-label={
              menuOpen
                ? 'Fechar menu de navegação'
                : 'Abrir menu de navegação'
            }
          >
            {menuOpen ? 'Fechar' : 'Menu'}
          </button>
        </div>

        <nav
          className={`public-nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Navegação pública"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              end={item.to === ''}
              to={item.to ? `/portal/${item.to}` : '/portal'}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="public-main">
        {error && (
          <div className="public-error" role="alert">
            {error}
          </div>
        )}

        {!championships.length && !error && (
          <div className="public-empty">
            Carregando campeonatos publicados...
          </div>
        )}

        {!championships.length && error && (
          <div className="public-empty">
            Não foi possível apresentar os campeonatos.
          </div>
        )}

        {championships.length > 0 &&
          seasonsLoaded &&
          !seasons.length &&
          !error && (
            <div className="public-empty">
              Nenhuma temporada ativa disponível para este campeonato.
            </div>
          )}

        {seasonsLoaded && selectedSeasonIsAvailable && !error && (
          <Outlet
            context={{
              championshipId,
              seasonId,
            }}
          />
        )}

        {championshipId && !seasonsLoaded && !error && (
          <div className="public-empty">
            Carregando temporadas...
          </div>
        )}
      </main>

      <footer className="public-footer">
        <strong>
          ESPORTE VARGINHA
        </strong>

        <span className="public-footer-credit">
          Desenvolvido por{' '}
        <span className="public-footer-author">
          Manoel Pimentel
        </span>
         .
        </span>
      </footer>
    </div>
  )
}
