
-- ============================================================
-- SITE ESPORTE
-- 0001_initial_schema.sql
-- Estrutura inicial consolidada
-- ============================================================
-- PRINCÍPIOS:
-- 1. Campeonato, temporada e regulamento: somente proprietário.
-- 2. Equipes permanentes por campeonato.
-- 3. Inscrições de equipes e jogadores por temporada.
-- 4. Partidas e eventos são a fonte oficial dos resultados.
-- 5. Classificação calculada a partir das partidas.
-- 6. RLS habilitado em todas as tabelas públicas.
-- 7. Atualização em tempo real de partidas e eventos.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. ENUMS
-- ============================================================

create type public.user_role as enum (
  'owner',
  'admin',
  'organizer',
  'editor',
  'viewer'
);

create type public.championship_status as enum (
  'draft',
  'published',
  'completed',
  'archived'
);

create type public.season_status as enum (
  'draft',
  'published',
  'active',
  'in_progress',
  'completed',
  'archived'
);

create type public.regulation_status as enum (
  'draft',
  'published'
);

create type public.registration_status as enum (
  'pending',
  'active',
  'rejected',
  'withdrawn',
  'suspended'
);

create type public.team_status as enum (
  'active',
  'inactive',
  'suspended'
);

create type public.player_position as enum (
  'goalkeeper',
  'defender',
  'midfielder',
  'forward',
  'other'
);

create type public.player_status as enum (
  'active',
  'inactive',
  'suspended'
);

create type public.phase_type as enum (
  'league',
  'groups',
  'knockout',
  'final',
  'other'
);

create type public.match_status as enum (
  'scheduled',
  'live',
  'finished',
  'postponed',
  'cancelled'
);

create type public.match_event_type as enum (
  'goal',
  'own_goal',
  'yellow_card',
  'red_card',
  'substitution',
  'penalty_goal',
  'penalty_miss',
  'other'
);

create type public.staff_role as enum (
  'president',
  'coach',
  'assistant_coach',
  'manager',
  'physiotherapist',
  'doctor',
  'other'
);

-- ============================================================
-- 2. FUNÇÕES GERAIS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 3. PERFIS, PERMISSÕES E AUDITORIA
-- ============================================================

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique
    references auth.users(id) on delete cascade,
  full_name text not null,
  cpf text,
  email text,
  phone text,
  role public.user_role not null default 'viewer',
  position text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role public.user_role not null,
  permission_id uuid not null
    references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role, permission_id)
);

create table public.access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  description text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. FUNÇÕES DE AUTORIZAÇÃO
-- Criadas depois das tabelas das quais dependem.
-- ============================================================

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.user_id = (select auth.uid())
    and p.is_active = true
  limit 1;
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = (select auth.uid())
      and p.role = 'owner'
      and p.is_active = true
  );
$$;

create or replace function public.has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_owner()
    or exists (
      select 1
      from public.profiles p
      join public.role_permissions rp
        on rp.role = p.role
      join public.permissions pm
        on pm.id = rp.permission_id
      where p.user_id = (select auth.uid())
        and p.is_active = true
        and pm.key = permission_key
    );
$$;

-- ============================================================
-- 5. CAMPEONATOS
-- ============================================================

create table public.championships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  acronym varchar(20),
  description text,
  status public.championship_status not null default 'draft',
  logo_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 6. TEMPORADAS
-- ============================================================

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null
    references public.championships(id) on delete restrict,
  name text not null,
  edition integer,
  year integer not null default extract(year from current_date)::integer,
  description text,
  start_date date,
  end_date date,
  status public.season_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (championship_id, name),
  unique (id, championship_id),

  check (year between 1900 and 2200),
  check (
    end_date is null
    or start_date is null
    or end_date >= start_date
  )
);

-- ============================================================
-- 7. REGULAMENTOS
-- Uma configuração principal por temporada.
-- ============================================================

create table public.competition_regulations (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null unique
    references public.seasons(id) on delete restrict,

  status public.regulation_status not null default 'draft',
  format text,

  general_settings jsonb not null default '{}'::jsonb,
  scoring_settings jsonb not null default '{}'::jsonb,
  classification_settings jsonb not null default '{}'::jsonb,
  teams_settings jsonb not null default '{}'::jsonb,
  phase_settings jsonb not null default '[]'::jsonb,
  match_settings jsonb not null default '{}'::jsonb,
  knockout_settings jsonb not null default '{}'::jsonb,
  discipline_settings jsonb not null default '{}'::jsonb,
  substitution_settings jsonb not null default '{}'::jsonb,
  final_provisions jsonb not null default '{}'::jsonb,

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 8. EQUIPES
-- Cadastro permanente dentro do campeonato.
-- ============================================================

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null
    references public.championships(id) on delete restrict,
  name text not null,
  short_name varchar(8),
  city text,
  primary_color varchar(7),
  founded_year integer,
  crest_url text,
  status public.team_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, championship_id),

  check (
    founded_year is null
    or founded_year between 1800 and 2200
  ),

  check (
    primary_color is null
    or primary_color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

-- ============================================================
-- 9. INSCRIÇÕES DE EQUIPES POR TEMPORADA
-- ============================================================

create table public.season_team_registrations (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null
    references public.seasons(id) on delete restrict,
  team_id uuid not null
    references public.teams(id) on delete restrict,
  status public.registration_status not null default 'pending',
  registration_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (season_id, team_id),
  unique (id, season_id),
  unique (id, team_id, season_id)
);

-- ============================================================
-- 10. JOGADORES
-- Cadastro independente da participação em temporadas.
-- ============================================================

create table public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  position public.player_position,
  photo_url text,
  status public.player_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.validate_player_birth_date()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.birth_date is not null and new.birth_date > current_date then
    raise exception 'A data de nascimento não pode estar no futuro.';
  end if;
  return new;
end;
$$;

create trigger players_validate_birth_date
before insert or update on public.players
for each row execute function public.validate_player_birth_date();

-- ============================================================
-- 11. INSCRIÇÕES DE JOGADORES POR TEMPORADA
-- ============================================================

create table public.season_player_registrations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null
    references public.players(id) on delete restrict,
  team_registration_id uuid not null,
  season_id uuid not null,
  team_id uuid not null,
  shirt_number integer,
  status public.registration_status not null default 'pending',
  registration_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  foreign key (team_registration_id, team_id, season_id)
    references public.season_team_registrations(id, team_id, season_id)
    on delete restrict,

  unique (player_id, season_id),
  unique (id, season_id),

  check (
    shirt_number is null
    or shirt_number between 0 and 99
  )
);

-- ============================================================
-- 12. COMISSÃO TÉCNICA
-- Presidente vinculado à equipe.
-- Demais funções vinculadas à participação na temporada.
-- ============================================================

create table public.team_staff (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null
    references public.teams(id) on delete restrict,
  team_registration_id uuid
    references public.season_team_registrations(id) on delete restrict,
  role public.staff_role not null,
  full_name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    (role = 'president' and team_registration_id is null)
    or
    (role <> 'president' and team_registration_id is not null)
  )
);

-- ============================================================
-- 13. FASES
-- ============================================================

create table public.competition_phases (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null
    references public.seasons(id) on delete restrict,
  name text not null,
  phase_type public.phase_type not null,
  order_number integer not null default 1,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, season_id),
  unique (season_id, order_number)
);

-- ============================================================
-- 14. GRUPOS
-- ============================================================

create table public.competition_groups (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null,
  season_id uuid not null,
  name text not null,
  order_number integer not null default 1,
  created_at timestamptz not null default now(),

  foreign key (phase_id, season_id)
    references public.competition_phases(id, season_id)
    on delete restrict,

  unique (id, season_id),
  unique (phase_id, name)
);

-- ============================================================
-- 15. RODADAS
-- ============================================================

create table public.competition_rounds (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null,
  season_id uuid not null,
  group_id uuid,
  name text not null,
  round_number integer not null,
  scheduled_date date,
  created_at timestamptz not null default now(),

  foreign key (phase_id, season_id)
    references public.competition_phases(id, season_id)
    on delete restrict,

  foreign key (group_id, season_id)
    references public.competition_groups(id, season_id)
    on delete restrict,

  unique (id, season_id),
  unique (phase_id, group_id, round_number)
);

-- ============================================================
-- 16. PARTIDAS
-- ============================================================

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null
    references public.seasons(id) on delete restrict,

  phase_id uuid not null,
  group_id uuid,
  round_id uuid,

  home_registration_id uuid not null,
  away_registration_id uuid not null,

  city text,
  venue text,

  scheduled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,

  home_score integer not null default 0,
  away_score integer not null default 0,

  status public.match_status not null default 'scheduled',
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  foreign key (phase_id, season_id)
    references public.competition_phases(id, season_id)
    on delete restrict,

  foreign key (group_id, season_id)
    references public.competition_groups(id, season_id)
    on delete restrict,

  foreign key (round_id, season_id)
    references public.competition_rounds(id, season_id)
    on delete restrict,

  foreign key (home_registration_id, season_id)
    references public.season_team_registrations(id, season_id)
    on delete restrict,

  foreign key (away_registration_id, season_id)
    references public.season_team_registrations(id, season_id)
    on delete restrict,

  check (home_registration_id <> away_registration_id),
  check (home_score >= 0 and away_score >= 0)
);

-- ============================================================
-- 17. INTEGRIDADE DAS PARTIDAS
-- ============================================================

create or replace function public.validate_match_integrity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_season_championship uuid;
  v_home_championship uuid;
  v_away_championship uuid;
  v_home_status public.registration_status;
  v_away_status public.registration_status;
  v_group_phase uuid;
  v_round_phase uuid;
  v_round_group uuid;
begin
  select s.championship_id
  into v_season_championship
  from public.seasons s
  where s.id = new.season_id;

  if not found then
    raise exception 'A temporada informada não existe.';
  end if;

  if not exists (
    select 1
    from public.competition_phases p
    where p.id = new.phase_id
      and p.season_id = new.season_id
  ) then
    raise exception 'A fase não pertence à temporada selecionada.';
  end if;

  if new.group_id is not null then
    select g.phase_id
    into v_group_phase
    from public.competition_groups g
    where g.id = new.group_id
      and g.season_id = new.season_id;

    if not found or v_group_phase <> new.phase_id then
      raise exception 'O grupo não pertence à fase selecionada.';
    end if;
  end if;

  if new.round_id is not null then
    select r.phase_id, r.group_id
    into v_round_phase, v_round_group
    from public.competition_rounds r
    where r.id = new.round_id
      and r.season_id = new.season_id;

    if not found then
      raise exception 'A rodada não pertence à temporada selecionada.';
    end if;

    if v_round_phase <> new.phase_id then
      raise exception 'A rodada não pertence à fase selecionada.';
    end if;

    if v_round_group is distinct from new.group_id then
      raise exception 'A rodada não corresponde ao grupo selecionado.';
    end if;
  end if;

  select s.championship_id, r.status
  into v_home_championship, v_home_status
  from public.season_team_registrations r
  join public.teams t on t.id = r.team_id
  join public.seasons s on s.id = r.season_id
  where r.id = new.home_registration_id
    and r.season_id = new.season_id
    and t.championship_id = s.championship_id;

  if not found then
    raise exception 'A equipe mandante não está vinculada corretamente à temporada.';
  end if;

  if v_home_status <> 'active' then
    raise exception 'A equipe mandante não possui inscrição ativa.';
  end if;

  select s.championship_id, r.status
  into v_away_championship, v_away_status
  from public.season_team_registrations r
  join public.teams t on t.id = r.team_id
  join public.seasons s on s.id = r.season_id
  where r.id = new.away_registration_id
    and r.season_id = new.season_id
    and t.championship_id = s.championship_id;

  if not found then
    raise exception 'A equipe visitante não está vinculada corretamente à temporada.';
  end if;

  if v_away_status <> 'active' then
    raise exception 'A equipe visitante não possui inscrição ativa.';
  end if;

  if v_home_championship <> v_season_championship
     or v_away_championship <> v_season_championship then
    raise exception 'As equipes precisam pertencer ao campeonato da temporada.';
  end if;

  if new.home_registration_id = new.away_registration_id then
    raise exception 'Uma equipe não pode jogar contra ela mesma.';
  end if;

  if new.status = 'scheduled'
     and new.scheduled_at is not null
     and new.scheduled_at < now() then
    raise exception 'Não é permitido agendar uma partida em uma data passada.';
  end if;

  if new.status = 'live' and new.started_at is null then
    new.started_at = now();
  end if;

  if new.status = 'finished' and new.finished_at is null then
    new.finished_at = now();
  end if;

  return new;
end;
$$;

create trigger matches_validate_integrity
before insert or update on public.matches
for each row
execute function public.validate_match_integrity();

-- ============================================================
-- 18. PROTEÇÃO DE PARTIDAS FINALIZADAS
-- Correções exigem autorização específica.
-- ============================================================

create or replace function public.protect_finished_match()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status = 'finished'
     and not public.has_permission('matches.correct_finished') then
    raise exception
      'Partida finalizada. Somente o proprietário ou usuário autorizado pode corrigir este registro.';
  end if;

  return new;
end;
$$;

create trigger matches_protect_finished
before update on public.matches
for each row
execute function public.protect_finished_match();

-- ============================================================
-- 19. ESCALAÇÕES
-- ============================================================

create table public.match_lineups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null
    references public.matches(id) on delete cascade,
  player_registration_id uuid not null
    references public.season_player_registrations(id) on delete restrict,
  team_registration_id uuid not null
    references public.season_team_registrations(id) on delete restrict,
  is_starter boolean not null default false,
  created_at timestamptz not null default now(),

  unique (match_id, player_registration_id)
);

-- ============================================================
-- 20. EVENTOS DE PARTIDAS
-- ============================================================

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null
    references public.matches(id) on delete cascade,

  team_registration_id uuid
    references public.season_team_registrations(id) on delete restrict,

  player_registration_id uuid
    references public.season_player_registrations(id) on delete restrict,

  related_player_registration_id uuid
    references public.season_player_registrations(id) on delete restrict,

  event_type public.match_event_type not null,
  minute integer,
  added_time integer,
  description text,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),

  check (minute is null or minute >= 0),
  check (added_time is null or added_time >= 0)
);

-- ============================================================
-- 21. INTEGRIDADE DOS EVENTOS
-- ============================================================

create or replace function public.validate_match_event_integrity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_season_id uuid;
  v_home_registration_id uuid;
  v_away_registration_id uuid;
  v_player_team_registration_id uuid;
  v_related_player_team_registration_id uuid;
begin
  select
    m.season_id,
    m.home_registration_id,
    m.away_registration_id
  into
    v_season_id,
    v_home_registration_id,
    v_away_registration_id
  from public.matches m
  where m.id = new.match_id;

  if not found then
    raise exception 'A partida do evento não existe.';
  end if;

  if new.team_registration_id is not null
     and new.team_registration_id not in (
       v_home_registration_id,
       v_away_registration_id
     ) then
    raise exception 'A equipe do evento não participa desta partida.';
  end if;

  if new.player_registration_id is not null then
    select spr.team_registration_id
    into v_player_team_registration_id
    from public.season_player_registrations spr
    where spr.id = new.player_registration_id
      and spr.season_id = v_season_id;

    if not found then
      raise exception 'O jogador não está inscrito nesta temporada.';
    end if;

    if v_player_team_registration_id not in (
      v_home_registration_id,
      v_away_registration_id
    ) then
      raise exception 'O jogador não pertence a uma das equipes da partida.';
    end if;

    if new.team_registration_id is not null
       and new.team_registration_id <> v_player_team_registration_id then
      raise exception 'O jogador não pertence à equipe informada no evento.';
    end if;
  end if;

  if new.related_player_registration_id is not null then
    select spr.team_registration_id
    into v_related_player_team_registration_id
    from public.season_player_registrations spr
    where spr.id = new.related_player_registration_id
      and spr.season_id = v_season_id;

    if not found then
      raise exception 'O jogador relacionado não está inscrito nesta temporada.';
    end if;

    if v_related_player_team_registration_id not in (
      v_home_registration_id,
      v_away_registration_id
    ) then
      raise exception 'O jogador relacionado não participa desta partida.';
    end if;
  end if;

  return new;
end;
$$;

create trigger match_events_validate_integrity
before insert or update on public.match_events
for each row
execute function public.validate_match_event_integrity();

-- ============================================================
-- 22. INTEGRIDADE DAS ESCALAÇÕES
-- ============================================================

create or replace function public.validate_match_lineup_integrity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_season_id uuid;
  v_home_registration_id uuid;
  v_away_registration_id uuid;
  v_player_team_registration_id uuid;
  v_player_season_id uuid;
begin
  select
    m.season_id,
    m.home_registration_id,
    m.away_registration_id
  into
    v_season_id,
    v_home_registration_id,
    v_away_registration_id
  from public.matches m
  where m.id = new.match_id;

  if not found then
    raise exception 'A partida da escalação não existe.';
  end if;

  if new.team_registration_id not in (
    v_home_registration_id,
    v_away_registration_id
  ) then
    raise exception 'A equipe informada não participa desta partida.';
  end if;

  select spr.team_registration_id, spr.season_id
  into v_player_team_registration_id, v_player_season_id
  from public.season_player_registrations spr
  where spr.id = new.player_registration_id;

  if not found then
    raise exception 'A inscrição do jogador não existe.';
  end if;

  if v_player_season_id <> v_season_id
     or v_player_team_registration_id <> new.team_registration_id then
    raise exception 'O jogador não pertence à equipe ou temporada da escalação.';
  end if;

  return new;
end;
$$;

create trigger match_lineups_validate_integrity
before insert or update on public.match_lineups
for each row
execute function public.validate_match_lineup_integrity();

-- ============================================================
-- 23. HISTÓRICO DE TÍTULOS
-- ============================================================

create table public.championship_titles (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null
    references public.seasons(id) on delete restrict,
  team_registration_id uuid not null,
  title_name text not null default 'Campeão',
  awarded_at date,
  notes text,
  created_at timestamptz not null default now(),

  foreign key (team_registration_id, season_id)
    references public.season_team_registrations(id, season_id)
    on delete restrict,

  unique (season_id, title_name)
);

-- ============================================================
-- 24. ÍNDICES
-- ============================================================

create index idx_seasons_championship
  on public.seasons(championship_id);

create index idx_regulations_season
  on public.competition_regulations(season_id);

create index idx_teams_championship
  on public.teams(championship_id);

create index idx_team_registrations_season
  on public.season_team_registrations(season_id);

create index idx_team_registrations_team
  on public.season_team_registrations(team_id);

create index idx_team_registrations_status
  on public.season_team_registrations(season_id, status);

create index idx_players_name
  on public.players using gin (to_tsvector('simple', full_name));

create index idx_player_registrations_team_season
  on public.season_player_registrations(team_id, season_id);

create index idx_phases_season
  on public.competition_phases(season_id);

create index idx_groups_phase
  on public.competition_groups(phase_id);

create index idx_rounds_phase
  on public.competition_rounds(phase_id);

create index idx_matches_season_status
  on public.matches(season_id, status);

create index idx_matches_season_phase_group
  on public.matches(season_id, phase_id, group_id);

create index idx_matches_schedule
  on public.matches(scheduled_at);

create index idx_matches_home_registration
  on public.matches(home_registration_id);

create index idx_matches_away_registration
  on public.matches(away_registration_id);

create index idx_match_events_match
  on public.match_events(match_id);

create index idx_match_events_match_type
  on public.match_events(match_id, event_type);

create index idx_match_events_team
  on public.match_events(team_registration_id);

create index idx_match_lineups_match
  on public.match_lineups(match_id);

create index idx_audit_logs_entity
  on public.audit_logs(entity_table, entity_id);

create index idx_access_logs_user
  on public.access_logs(user_id, created_at desc);

-- ============================================================
-- 25. TRIGGERS updated_at
-- ============================================================

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger championships_updated_at
before update on public.championships
for each row execute function public.set_updated_at();

create trigger seasons_updated_at
before update on public.seasons
for each row execute function public.set_updated_at();

create trigger regulations_updated_at
before update on public.competition_regulations
for each row execute function public.set_updated_at();

create trigger teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger team_registrations_updated_at
before update on public.season_team_registrations
for each row execute function public.set_updated_at();

create trigger players_updated_at
before update on public.players
for each row execute function public.set_updated_at();

create trigger player_registrations_updated_at
before update on public.season_player_registrations
for each row execute function public.set_updated_at();

create trigger team_staff_updated_at
before update on public.team_staff
for each row execute function public.set_updated_at();

create trigger phases_updated_at
before update on public.competition_phases
for each row execute function public.set_updated_at();

create trigger matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

-- ============================================================
-- 26. PERMISSÕES INICIAIS
-- ============================================================

insert into public.permissions (key, description) values
  ('championships.manage', 'Gerenciar campeonatos'),
  ('seasons.manage', 'Gerenciar temporadas'),
  ('regulations.manage', 'Gerenciar regulamentos'),
  ('teams.manage', 'Gerenciar equipes'),
  ('players.manage', 'Gerenciar jogadores'),
  ('matches.manage', 'Gerenciar partidas'),
  ('matches.update_live', 'Atualizar partidas em andamento'),
  ('matches.correct_finished', 'Corrigir partidas finalizadas'),
  ('standings.read', 'Consultar classificação'),
  ('staff.manage', 'Gerenciar comissão técnica'),
  ('collaborators.manage', 'Gerenciar colaboradores'),
  ('audit.read', 'Consultar auditoria'),
  ('titles.manage', 'Gerenciar histórico de títulos')
on conflict (key) do nothing;

-- Administradores recebem as permissões operacionais,
-- mas não recebem automaticamente a permissão de corrigir
-- partidas finalizadas.
insert into public.role_permissions (role, permission_id)
select 'admin', p.id
from public.permissions p
where p.key not in (
  'matches.correct_finished',
  'championships.manage',
  'seasons.manage',
  'regulations.manage'
)
on conflict do nothing;

insert into public.role_permissions (role, permission_id)
select 'organizer', p.id
from public.permissions p
where p.key in (
  'teams.manage',
  'players.manage',
  'matches.manage',
  'matches.update_live',
  'staff.manage',
  'standings.read'
)
on conflict do nothing;

insert into public.role_permissions (role, permission_id)
select 'editor', p.id
from public.permissions p
where p.key in (
  'players.manage',
  'matches.update_live',
  'standings.read'
)
on conflict do nothing;

insert into public.role_permissions (role, permission_id)
select 'viewer', p.id
from public.permissions p
where p.key = 'standings.read'
on conflict do nothing;

-- ============================================================
-- 27. RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.access_logs enable row level security;
alter table public.audit_logs enable row level security;

alter table public.championships enable row level security;
alter table public.seasons enable row level security;
alter table public.competition_regulations enable row level security;

alter table public.teams enable row level security;
alter table public.season_team_registrations enable row level security;

alter table public.players enable row level security;
alter table public.season_player_registrations enable row level security;

alter table public.team_staff enable row level security;

alter table public.competition_phases enable row level security;
alter table public.competition_groups enable row level security;
alter table public.competition_rounds enable row level security;

alter table public.matches enable row level security;
alter table public.match_lineups enable row level security;
alter table public.match_events enable row level security;

alter table public.championship_titles enable row level security;

-- ============================================================
-- 28. RLS - PERFIS
-- ============================================================

create policy "profiles_read_self_or_owner"
on public.profiles
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_owner()
  or public.has_permission('collaborators.manage')
);

create policy "profiles_owner_manage"
on public.profiles
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- ============================================================
-- 29. RLS - PERMISSÕES
-- ============================================================

create policy "permissions_authenticated_read"
on public.permissions
for select
to authenticated
using (true);

create policy "role_permissions_authenticated_read"
on public.role_permissions
for select
to authenticated
using (true);

create policy "role_permissions_owner_manage"
on public.role_permissions
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- ============================================================
-- 30. RLS - LOGS
-- ============================================================

create policy "access_logs_owner_read"
on public.access_logs
for select
to authenticated
using (
  public.is_owner()
  or public.has_permission('audit.read')
);

create policy "access_logs_user_insert"
on public.access_logs
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "audit_logs_owner_read"
on public.audit_logs
for select
to authenticated
using (
  public.is_owner()
  or public.has_permission('audit.read')
);

create policy "audit_logs_authenticated_insert"
on public.audit_logs
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  or public.is_owner()
);

-- ============================================================
-- 31. RLS - CAMPEONATOS
-- Visitantes leem somente campeonatos publicados.
-- Somente proprietário/colaborador com permissão administra.
-- ============================================================

create policy "championships_read"
on public.championships for select to anon, authenticated
using (
  status = 'published'
  or public.is_owner()
);

create policy "championships_owner_manage"
on public.championships for all to authenticated
using (public.is_owner())
with check (public.is_owner());

-- ============================================================
-- 32. RLS - TEMPORADAS
-- ============================================================

create policy "seasons_read"
on public.seasons for select to anon, authenticated
using (
  (
    status in ('active', 'published', 'in_progress', 'completed')
    and exists (
      select 1 from public.championships c
      where c.id = championship_id and c.status = 'published'
    )
  )
  or public.is_owner()
);

create policy "seasons_owner_manage"
on public.seasons for all to authenticated
using (public.is_owner())
with check (public.is_owner());

-- ============================================================
-- 33. RLS - REGULAMENTOS
-- O regulamento publicado é integralmente consultável pelo visitante.
-- As configurações internas das fases ficam em tabelas separadas.
-- ============================================================

create policy "regulations_read"
on public.competition_regulations for select to anon, authenticated
using (
  (
    status = 'published'
    and exists (
      select 1
      from public.seasons s
      join public.championships c on c.id = s.championship_id
      where s.id = season_id
        and s.status in ('active', 'published', 'in_progress', 'completed')
        and c.status = 'published'
    )
  )
  or public.is_owner()
);

create policy "regulations_owner_manage"
on public.competition_regulations for all to authenticated
using (public.is_owner())
with check (public.is_owner());

-- ============================================================
-- 34. RLS - EQUIPES E INSCRIÇÕES
-- ============================================================

create policy "teams_read"
on public.teams for select to anon, authenticated
using (
  exists (
    select 1
    from public.season_team_registrations r
    join public.seasons s on s.id = r.season_id
    join public.championships c on c.id = s.championship_id
    where r.team_id = teams.id
      and r.status = 'active'
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
  or public.has_permission('teams.manage')
  or public.has_permission('players.manage')
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "teams_manage"
on public.teams for all to authenticated
using (public.has_permission('teams.manage'))
with check (public.has_permission('teams.manage'));

create policy "team_registrations_read"
on public.season_team_registrations for select to anon, authenticated
using (
  (
    status = 'active'
    and exists (
      select 1 from public.seasons s
      join public.championships c on c.id = s.championship_id
      where s.id = season_id
        and s.status in ('active', 'published', 'in_progress', 'completed')
        and c.status = 'published'
    )
  )
  or public.has_permission('teams.manage')
  or public.has_permission('players.manage')
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "team_registrations_manage"
on public.season_team_registrations for all to authenticated
using (public.has_permission('teams.manage'))
with check (public.has_permission('teams.manage'));

-- ============================================================
-- 35. RLS - JOGADORES E INSCRIÇÕES
-- ============================================================

create policy "players_read"
on public.players for select to anon, authenticated
using (
  exists (
    select 1
    from public.season_player_registrations pr
    join public.seasons s on s.id = pr.season_id
    join public.championships c on c.id = s.championship_id
    where pr.player_id = players.id
      and pr.status = 'active'
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
  or public.has_permission('players.manage')
);

create policy "players_manage"
on public.players for all to authenticated
using (public.has_permission('players.manage'))
with check (public.has_permission('players.manage'));

create policy "player_registrations_read"
on public.season_player_registrations for select to anon, authenticated
using (
  (
    status = 'active'
    and exists (
      select 1 from public.seasons s
      join public.championships c on c.id = s.championship_id
      where s.id = season_id
        and s.status in ('active', 'published', 'in_progress', 'completed')
        and c.status = 'published'
    )
  )
  or public.has_permission('players.manage')
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "player_registrations_manage"
on public.season_player_registrations for all to authenticated
using (public.has_permission('players.manage'))
with check (public.has_permission('players.manage'));

-- ============================================================
-- 36. RLS - COMISSÃO TÉCNICA
-- ============================================================

create policy "team_staff_read"
on public.team_staff for select to anon, authenticated
using (
  exists (
    select 1
    from public.season_team_registrations r
    join public.seasons s on s.id = r.season_id
    join public.championships c on c.id = s.championship_id
    where r.team_id = team_staff.team_id
      and r.status = 'active'
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
  or public.has_permission('staff.manage')
);

create policy "team_staff_manage"
on public.team_staff for all to authenticated
using (public.has_permission('staff.manage'))
with check (public.has_permission('staff.manage'));

-- ============================================================
-- 37. RLS - FASES, GRUPOS E RODADAS
-- Nunca são consultáveis por visitantes. Colaboradores precisam
-- da permissão operacional de gerenciamento de partidas.
-- ============================================================

create policy "phases_read"
on public.competition_phases for select to authenticated
using (public.has_permission('matches.manage'));

create policy "phases_manage"
on public.competition_phases for all to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

create policy "groups_read"
on public.competition_groups for select to authenticated
using (public.has_permission('matches.manage'));

create policy "groups_manage"
on public.competition_groups for all to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

create policy "rounds_read"
on public.competition_rounds for select to authenticated
using (public.has_permission('matches.manage'));

create policy "rounds_manage"
on public.competition_rounds for all to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

-- ============================================================
-- 38. RLS - PARTIDAS
-- ============================================================

create policy "matches_read"
on public.matches for select to anon, authenticated
using (
  exists (
    select 1 from public.seasons s
    join public.championships c on c.id = s.championship_id
    where s.id = season_id
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "matches_manage"
on public.matches for all to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

-- ============================================================
-- 39. RLS - ESCALAÇÕES
-- ============================================================

create policy "lineups_read"
on public.match_lineups for select to anon, authenticated
using (
  exists (
    select 1
    from public.matches m
    join public.seasons s on s.id = m.season_id
    join public.championships c on c.id = s.championship_id
    where m.id = match_id
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "lineups_manage"
on public.match_lineups for all to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

-- ============================================================
-- 40. RLS - EVENTOS
-- ============================================================

create policy "events_read"
on public.match_events for select to anon, authenticated
using (
  exists (
    select 1
    from public.matches m
    join public.seasons s on s.id = m.season_id
    join public.championships c on c.id = s.championship_id
    where m.id = match_id
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "events_manage"
on public.match_events for all to authenticated
using (
  public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
)
with check (
  public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

-- ============================================================
-- 41. RLS - HISTÓRICO DE TÍTULOS
-- ============================================================

create policy "titles_read"
on public.championship_titles for select to anon, authenticated
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c on c.id = s.championship_id
    where s.id = season_id
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
  or public.has_permission('titles.manage')
);

create policy "titles_manage"
on public.championship_titles for all to authenticated
using (public.has_permission('titles.manage'))
with check (public.has_permission('titles.manage'));

-- Public grants are deliberately column-limited. Internal phase/group/round
-- tables receive no anonymous SELECT privilege at any point.
revoke all privileges on all tables in schema public from anon;
grant usage on schema public to anon, authenticated, service_role;

grant select (id, name, acronym, description, status, logo_url)
  on public.championships to anon;
grant select (id, championship_id, name, edition, year, description, start_date, end_date, status)
  on public.seasons to anon;
grant select (id, season_id, status, format, general_settings, scoring_settings,
  classification_settings, teams_settings, phase_settings, match_settings,
  knockout_settings, discipline_settings, substitution_settings, final_provisions,
  published_at, created_at, updated_at)
  on public.competition_regulations to anon;
grant select (id, championship_id, name, short_name, city, primary_color,
  founded_year, crest_url, status, created_at)
  on public.teams to anon;
grant select (id, season_id, team_id, status, registration_date, created_at)
  on public.season_team_registrations to anon;
grant select (id, full_name, position, photo_url, status, created_at)
  on public.players to anon;
grant select (id, player_id, team_registration_id, season_id, team_id,
  shirt_number, status, created_at)
  on public.season_player_registrations to anon;
grant select (id, team_id, team_registration_id, full_name, role, created_at)
  on public.team_staff to anon;
grant select (id, season_id, phase_id, group_id, round_id, home_registration_id,
  away_registration_id, city, venue, scheduled_at, started_at, finished_at,
  home_score, away_score, status, created_at, updated_at)
  on public.matches to anon;
grant select (id, match_id, player_registration_id, team_registration_id,
  is_starter, created_at)
  on public.match_lineups to anon;
grant select (id, match_id, team_registration_id, player_registration_id,
  related_player_registration_id, event_type, minute, added_time, created_at)
  on public.match_events to anon;
grant select (id, season_id, team_registration_id, title_name, awarded_at, created_at)
  on public.championship_titles to anon;

-- ============================================================
-- 42. REALTIME
-- Partidas e eventos atualizam a classificação.
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'matches'
  ) then
    alter publication supabase_realtime
      add table public.matches;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'match_events'
  ) then
    alter publication supabase_realtime
      add table public.match_events;
  end if;
end;
$$;

-- ============================================================
-- 43. STORAGE
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'team-crests',
    'team-crests',
    true,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'player-photos',
    'player-photos',
    true,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp']
  )
on conflict (id) do nothing;

-- Escudos das equipes

create policy "team_crests_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'team-crests');

create policy "team_crests_authorized_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'team-crests'
  and public.has_permission('teams.manage')
);

create policy "team_crests_authorized_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'team-crests'
  and public.has_permission('teams.manage')
)
with check (
  bucket_id = 'team-crests'
  and public.has_permission('teams.manage')
);

create policy "team_crests_authorized_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'team-crests'
  and public.has_permission('teams.manage')
);

-- Fotos dos jogadores

create policy "player_photos_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'player-photos');

create policy "player_photos_authorized_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'player-photos'
  and public.has_permission('players.manage')
);

create policy "player_photos_authorized_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'player-photos'
  and public.has_permission('players.manage')
)
with check (
  bucket_id = 'player-photos'
  and public.has_permission('players.manage')
);

create policy "player_photos_authorized_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'player-photos'
  and public.has_permission('players.manage')
);

-- ============================================================
-- FIM DA MIGRAÇÃO INICIAL
-- ============================================================
