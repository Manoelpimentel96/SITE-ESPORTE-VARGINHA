-- ============================================================
-- SITE ESPORTE
-- 0002_security_and_contract_alignment.sql
-- Executar somente depois de 0001_initial_schema.sql
-- ============================================================

-- ============================================================
-- 1. AUDITORIA
-- ============================================================

alter table public.audit_logs
  add column if not exists user_name text,
  add column if not exists user_email text,
  add column if not exists module text,
  add column if not exists entity_type text,
  add column if not exists user_agent text;

update public.audit_logs
set
  module = coalesce(module, entity_table),
  entity_type = coalesce(entity_type, entity_table)
where module is null or entity_type is null;

create index if not exists idx_audit_logs_module_created
  on public.audit_logs(module, created_at desc);

-- ============================================================
-- 2. UNICIDADE DA COMISSÃO TÉCNICA
-- ============================================================

create unique index if not exists uq_team_staff_president
  on public.team_staff(team_id)
  where role = 'president'
    and team_registration_id is null;

create unique index if not exists uq_team_staff_registration_role
  on public.team_staff(team_registration_id, role)
  where team_registration_id is not null;

-- ============================================================
-- 3. PERFIL AUTOMÁTICO PARA NOVOS USUÁRIOS
-- ============================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    user_id,
    full_name,
    email,
    role,
    is_active
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'Usuário'
    ),
    new.email,
    'viewer'::public.user_role,
    true
  )
  on conflict (user_id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- ============================================================
-- 4. REMOÇÃO DAS POLÍTICAS ANTERIORES
-- ============================================================

drop policy if exists "championships_read" on public.championships;
drop policy if exists "championships_owner_manage" on public.championships;
drop policy if exists "seasons_read" on public.seasons;
drop policy if exists "seasons_owner_manage" on public.seasons;
drop policy if exists "regulations_read" on public.competition_regulations;
drop policy if exists "regulations_owner_manage" on public.competition_regulations;
drop policy if exists "teams_read" on public.teams;
drop policy if exists "teams_manage" on public.teams;
drop policy if exists "team_registrations_read" on public.season_team_registrations;
drop policy if exists "team_registrations_manage" on public.season_team_registrations;
drop policy if exists "players_read" on public.players;
drop policy if exists "players_manage" on public.players;
drop policy if exists "player_registrations_read" on public.season_player_registrations;
drop policy if exists "player_registrations_manage" on public.season_player_registrations;
drop policy if exists "team_staff_read" on public.team_staff;
drop policy if exists "team_staff_manage" on public.team_staff;
drop policy if exists "phases_read" on public.competition_phases;
drop policy if exists "phases_manage" on public.competition_phases;
drop policy if exists "groups_read" on public.competition_groups;
drop policy if exists "groups_manage" on public.competition_groups;
drop policy if exists "rounds_read" on public.competition_rounds;
drop policy if exists "rounds_manage" on public.competition_rounds;
drop policy if exists "matches_read" on public.matches;
drop policy if exists "matches_manage" on public.matches;
drop policy if exists "lineups_read" on public.match_lineups;
drop policy if exists "lineups_manage" on public.match_lineups;
drop policy if exists "events_read" on public.match_events;
drop policy if exists "events_manage" on public.match_events;
drop policy if exists "titles_read" on public.championship_titles;
drop policy if exists "titles_manage" on public.championship_titles;

-- Remove também as políticas finais caso a migration precise
-- ser reaplicada após uma execução parcial.

drop policy if exists "championships_public_or_manage" on public.championships;
drop policy if exists "championships_manage" on public.championships;
drop policy if exists "seasons_public_or_manage" on public.seasons;
drop policy if exists "seasons_manage" on public.seasons;
drop policy if exists "regulations_public_or_manage" on public.competition_regulations;
drop policy if exists "regulations_manage" on public.competition_regulations;
drop policy if exists "teams_public_or_manage" on public.teams;
drop policy if exists "team_registrations_public_or_manage" on public.season_team_registrations;
drop policy if exists "team_registrations_manage" on public.season_team_registrations;
drop policy if exists "players_public_or_manage" on public.players;
drop policy if exists "player_registrations_public_or_manage" on public.season_player_registrations;
drop policy if exists "player_registrations_manage" on public.season_player_registrations;
drop policy if exists "team_staff_public_or_manage" on public.team_staff;
drop policy if exists "team_staff_manage" on public.team_staff;
drop policy if exists "matches_public_or_manage" on public.matches;
drop policy if exists "matches_authenticated_manage" on public.matches;
drop policy if exists "matches_manage" on public.matches;
drop policy if exists "lineups_public_or_manage" on public.match_lineups;
drop policy if exists "lineups_manage" on public.match_lineups;
drop policy if exists "events_public_or_manage" on public.match_events;
drop policy if exists "events_manage" on public.match_events;
drop policy if exists "titles_public_or_manage" on public.championship_titles;
drop policy if exists "titles_manage" on public.championship_titles;

-- ============================================================
-- 5. CAMPEONATOS
-- ============================================================

create policy "championships_public_or_manage"
on public.championships
for select
to anon, authenticated
using (
  status = 'published'
  or public.is_owner()
);

create policy "championships_manage"
on public.championships
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- ============================================================
-- 6. TEMPORADAS
-- ============================================================

create policy "seasons_public_or_manage"
on public.seasons
for select
to anon, authenticated
using (
  (
    status in ('active', 'published', 'in_progress', 'completed')
    and exists (
      select 1
      from public.championships c
      where c.id = championship_id
        and c.status = 'published'
    )
  )
  or public.is_owner()
);

create policy "seasons_manage"
on public.seasons
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- ============================================================
-- 7. REGULAMENTOS
-- O regulamento publicado permanece integralmente público.
-- Inclui phase_settings e final_provisions.
-- ============================================================

create policy "regulations_public_or_manage"
on public.competition_regulations
for select
to anon, authenticated
using (
  (
    status = 'published'
    and exists (
      select 1
      from public.seasons s
      join public.championships c
        on c.id = s.championship_id
      where s.id = season_id
        and s.status in (
          'active',
          'published',
          'in_progress',
          'completed'
        )
        and c.status = 'published'
    )
  )
  or public.is_owner()
);

create policy "regulations_manage"
on public.competition_regulations
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- ============================================================
-- 8. EQUIPES
-- ============================================================

create policy "teams_public_or_manage"
on public.teams
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.season_team_registrations r
    join public.seasons s on s.id = r.season_id
    join public.championships c on c.id = s.championship_id
    where r.team_id = teams.id
      and r.status = 'active'
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
  or public.has_permission('teams.manage')
  or public.has_permission('players.manage')
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "teams_manage"
on public.teams
for all
to authenticated
using (public.has_permission('teams.manage'))
with check (public.has_permission('teams.manage'));

-- ============================================================
-- 9. INSCRIÇÕES DE EQUIPES
-- ============================================================

create policy "team_registrations_public_or_manage"
on public.season_team_registrations
for select
to anon, authenticated
using (
  (
    status = 'active'
    and exists (
      select 1
      from public.seasons s
      join public.championships c on c.id = s.championship_id
      where s.id = season_id
        and s.status in (
          'active',
          'published',
          'in_progress',
          'completed'
        )
        and c.status = 'published'
    )
  )
  or public.has_permission('teams.manage')
  or public.has_permission('players.manage')
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "team_registrations_manage"
on public.season_team_registrations
for all
to authenticated
using (public.has_permission('teams.manage'))
with check (public.has_permission('teams.manage'));

-- ============================================================
-- 10. JOGADORES
-- ============================================================

create policy "players_public_or_manage"
on public.players
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.season_player_registrations pr
    join public.seasons s on s.id = pr.season_id
    join public.championships c on c.id = s.championship_id
    where pr.player_id = players.id
      and pr.status = 'active'
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
  or public.has_permission('players.manage')
);

create policy "players_manage"
on public.players
for all
to authenticated
using (public.has_permission('players.manage'))
with check (public.has_permission('players.manage'));

-- ============================================================
-- 11. INSCRIÇÕES DE JOGADORES
-- ============================================================

create policy "player_registrations_public_or_manage"
on public.season_player_registrations
for select
to anon, authenticated
using (
  (
    status = 'active'
    and exists (
      select 1
      from public.seasons s
      join public.championships c on c.id = s.championship_id
      where s.id = season_id
        and s.status in (
          'active',
          'published',
          'in_progress',
          'completed'
        )
        and c.status = 'published'
    )
  )
  or public.has_permission('players.manage')
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "player_registrations_manage"
on public.season_player_registrations
for all
to authenticated
using (public.has_permission('players.manage'))
with check (public.has_permission('players.manage'));

-- ============================================================
-- 12. COMISSÃO TÉCNICA
-- ============================================================

create policy "team_staff_public_or_manage"
on public.team_staff
for select
to anon, authenticated
using (
  (
    role = 'president'
    and exists (
      select 1
      from public.season_team_registrations r
      join public.seasons s on s.id = r.season_id
      join public.championships c on c.id = s.championship_id
      where r.team_id = team_staff.team_id
        and r.status = 'active'
        and s.status in (
          'active',
          'published',
          'in_progress',
          'completed'
        )
        and c.status = 'published'
    )
  )
  or exists (
    select 1
    from public.season_team_registrations r
    join public.seasons s on s.id = r.season_id
    join public.championships c on c.id = s.championship_id
    where r.id = team_registration_id
      and r.status = 'active'
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
  or public.has_permission('staff.manage')
);

create policy "team_staff_manage"
on public.team_staff
for all
to authenticated
using (public.has_permission('staff.manage'))
with check (public.has_permission('staff.manage'));

-- ============================================================
-- 13. FASES, GRUPOS E RODADAS
-- Somente usuários com matches.manage.
-- ============================================================

create policy "phases_read"
on public.competition_phases
for select
to authenticated
using (public.has_permission('matches.manage'));

create policy "phases_manage"
on public.competition_phases
for all
to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

create policy "groups_read"
on public.competition_groups
for select
to authenticated
using (public.has_permission('matches.manage'));

create policy "groups_manage"
on public.competition_groups
for all
to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

create policy "rounds_read"
on public.competition_rounds
for select
to authenticated
using (public.has_permission('matches.manage'));

create policy "rounds_manage"
on public.competition_rounds
for all
to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

-- ============================================================
-- 14. PARTIDAS
--
-- Visitantes anônimos: somente partidas publicadas.
-- Usuários autenticados: somente quem tem matches.manage.
--
-- Isso impede que um usuário autenticado comum consulte
-- phase_id, group_id e round_id através da tabela matches.
-- ============================================================

create policy "matches_public_or_manage"
on public.matches
for select
to anon
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c on c.id = s.championship_id
    where s.id = season_id
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
);

create policy "matches_authenticated_manage"
on public.matches
for select
to authenticated
using (
  public.has_permission('matches.manage')
);

create policy "matches_manage"
on public.matches
for all
to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

-- ============================================================
-- 15. ESCALAÇÕES
-- ============================================================

create policy "lineups_public_or_manage"
on public.match_lineups
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.matches m
    join public.seasons s on s.id = m.season_id
    join public.championships c on c.id = s.championship_id
    where m.id = match_id
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "lineups_manage"
on public.match_lineups
for all
to authenticated
using (public.has_permission('matches.manage'))
with check (public.has_permission('matches.manage'));

-- ============================================================
-- 16. EVENTOS DAS PARTIDAS
-- ============================================================

create policy "events_public_or_manage"
on public.match_events
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.matches m
    join public.seasons s on s.id = m.season_id
    join public.championships c on c.id = s.championship_id
    where m.id = match_id
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
  or public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

create policy "events_manage"
on public.match_events
for all
to authenticated
using (
  public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
)
with check (
  public.has_permission('matches.manage')
  or public.has_permission('matches.update_live')
);

-- ============================================================
-- 17. TÍTULOS
-- ============================================================

create policy "titles_public_or_manage"
on public.championship_titles
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c on c.id = s.championship_id
    where s.id = season_id
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
  or public.has_permission('titles.manage')
);

create policy "titles_manage"
on public.championship_titles
for all
to authenticated
using (public.has_permission('titles.manage'))
with check (public.has_permission('titles.manage'));

-- ============================================================
-- 18. PERMISSÕES DO ROLE ANON
-- ============================================================

revoke all privileges
on all tables in schema public
from anon;

grant usage on schema public
to anon, authenticated, service_role;

grant select (
  id,
  name,
  acronym,
  description,
  logo_url,
  status
)
on public.championships to anon;

grant select (
  id,
  championship_id,
  name,
  edition,
  year,
  description,
  start_date,
  end_date,
  status
)
on public.seasons to anon;

grant select (
  id,
  championship_id,
  name,
  short_name,
  city,
  primary_color,
  founded_year,
  crest_url,
  status,
  created_at
)
on public.teams to anon;

grant select (
  id,
  season_id,
  team_id,
  status,
  registration_date,
  created_at
)
on public.season_team_registrations to anon;

grant select (
  id,
  full_name,
  position,
  photo_url,
  status,
  created_at
)
on public.players to anon;

grant select (
  id,
  player_id,
  team_registration_id,
  season_id,
  team_id,
  shirt_number,
  status,
  created_at
)
on public.season_player_registrations to anon;

grant select (
  id,
  team_id,
  team_registration_id,
  full_name,
  role,
  created_at
)
on public.team_staff to anon;

-- phase_id, group_id e round_id NÃO são públicos.

grant select (
  id,
  season_id,
  home_registration_id,
  away_registration_id,
  city,
  venue,
  scheduled_at,
  started_at,
  finished_at,
  home_score,
  away_score,
  status,
  created_at,
  updated_at
)
on public.matches to anon;

-- Regulamento integralmente público quando publicado.

grant select (
  id,
  season_id,
  status,
  format,
  general_settings,
  scoring_settings,
  classification_settings,
  teams_settings,
  phase_settings,
  match_settings,
  knockout_settings,
  discipline_settings,
  substitution_settings,
  final_provisions,
  published_at,
  created_at,
  updated_at
)
on public.competition_regulations to anon;

grant select (
  id,
  match_id,
  player_registration_id,
  team_registration_id,
  is_starter,
  created_at
)
on public.match_lineups to anon;

grant select (
  id,
  match_id,
  team_registration_id,
  player_registration_id,
  related_player_registration_id,
  event_type,
  minute,
  added_time,
  created_at
)
on public.match_events to anon;

grant select (
  id,
  season_id,
  team_registration_id,
  title_name,
  awarded_at,
  created_at
)
on public.championship_titles to anon;

-- ============================================================
-- 19. DADOS PRIVADOS
-- ============================================================

revoke all privileges
on public.profiles,
   public.permissions,
   public.role_permissions,
   public.access_logs,
   public.audit_logs
from anon;

-- ============================================================
-- 20. PERMISSÕES DO ROLE AUTHENTICATED
--
-- O acesso às linhas continua controlado pelas políticas RLS.
-- As tabelas internas de fases, grupos e rodadas exigem
-- matches.manage.
-- A tabela matches exige matches.manage para authenticated.
-- ============================================================

grant select, insert, update, delete
on all tables in schema public
to authenticated;

-- A role service_role é exclusiva do backend.
grant all privileges
on all tables in schema public
to service_role;

grant usage, select
on all sequences in schema public
to authenticated, service_role;

-- ============================================================
-- 21. EXECUÇÃO DAS FUNÇÕES
-- ============================================================

grant execute
on function public.current_user_role()
to anon, authenticated;

grant execute
on function public.is_owner()
to anon, authenticated;

grant execute
on function public.has_permission(text)
to anon, authenticated;

-- ============================================================
-- FIM DA MIGRATION 0002
-- ============================================================