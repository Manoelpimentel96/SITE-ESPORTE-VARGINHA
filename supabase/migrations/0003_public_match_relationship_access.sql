
-- ============================================================
-- SITE ESPORTE
-- 0003_public_match_relationship_access.sql
--
-- Objetivo:
-- Permitir a consulta pública dos relacionamentos das partidas,
-- sem expor configurações administrativas.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. FASES: liberar somente ID, temporada e nome
-- ------------------------------------------------------------

grant select (id, season_id, name)
on public.competition_phases
to anon;

drop policy if exists "phases_public_names"
on public.competition_phases;

create policy "phases_public_names"
on public.competition_phases
for select
to anon
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c
      on c.id = s.championship_id
    where s.id = competition_phases.season_id
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
);

-- ------------------------------------------------------------
-- 2. GRUPOS: liberar somente os campos de relacionamento
-- e o nome do grupo
-- ------------------------------------------------------------

grant select (id, phase_id, season_id, name)
on public.competition_groups
to anon;

drop policy if exists "groups_public_names"
on public.competition_groups;

create policy "groups_public_names"
on public.competition_groups
for select
to anon
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c
      on c.id = s.championship_id
    where s.id = competition_groups.season_id
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
);

-- ------------------------------------------------------------
-- 3. RODADAS: liberar somente os campos de relacionamento
-- e o nome da rodada
-- ------------------------------------------------------------

grant select (
  id,
  phase_id,
  season_id,
  group_id,
  name
)
on public.competition_rounds
to anon;

drop policy if exists "rounds_public_names"
on public.competition_rounds;

create policy "rounds_public_names"
on public.competition_rounds
for select
to anon
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c
      on c.id = s.championship_id
    where s.id = competition_rounds.season_id
      and s.status in (
        'active',
        'published',
        'in_progress',
        'completed'
      )
      and c.status = 'published'
  )
);

-- ------------------------------------------------------------
-- 4. REGULAMENTOS: retirar leitura pública dos dados internos
-- ------------------------------------------------------------

drop policy if exists "regulations_public_or_manage"
on public.competition_regulations;

revoke select (
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
on public.competition_regulations
from anon;

-- A política regulations_manage, já existente na migration 0002,
-- continua permitindo acesso administrativo somente ao proprietário.

commit;
