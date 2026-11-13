-- SITE ESPORTE
-- 0004_public_read_contract.sql
-- Alinha os grants anon ao contrato real do portal público.
-- Aplicar somente depois das migrations 0001, 0002 e 0003.

begin;

-- Fases, grupos e rodadas: o visitante pode ler somente os identificadores
-- necessários aos relacionamentos e os nomes exibidos no portal.
-- Remove eventuais grants amplos herdados de versões anteriores.
revoke all privileges on table public.competition_phases from anon;
revoke select (
  id, season_id, name, phase_type, order_number, settings, created_at, updated_at
) on public.competition_phases from anon;
grant select (id, season_id, name)
  on public.competition_phases to anon;

drop policy if exists "phases_public_names" on public.competition_phases;
create policy "phases_public_names"
on public.competition_phases
for select to anon
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c on c.id = s.championship_id
    where s.id = competition_phases.season_id
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
);

revoke all privileges on table public.competition_groups from anon;
revoke select (
  id, phase_id, season_id, name, order_number, created_at
) on public.competition_groups from anon;
grant select (id, phase_id, season_id, name)
  on public.competition_groups to anon;

drop policy if exists "groups_public_names" on public.competition_groups;
create policy "groups_public_names"
on public.competition_groups
for select to anon
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c on c.id = s.championship_id
    where s.id = competition_groups.season_id
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
);

revoke all privileges on table public.competition_rounds from anon;
revoke select (
  id, phase_id, season_id, group_id, name, round_number, scheduled_date, created_at
) on public.competition_rounds from anon;
grant select (id, phase_id, season_id, group_id, name)
  on public.competition_rounds to anon;

drop policy if exists "rounds_public_names" on public.competition_rounds;
create policy "rounds_public_names"
on public.competition_rounds
for select to anon
using (
  exists (
    select 1
    from public.seasons s
    join public.championships c on c.id = s.championship_id
    where s.id = competition_rounds.season_id
      and s.status in ('active', 'published', 'in_progress', 'completed')
      and c.status = 'published'
  )
);

-- O PostgREST precisa ler as colunas FK da tabela de origem para resolver
-- os embeds de fase, grupo e rodada usados em listMatches.
-- Nenhuma configuração JSON ou coluna administrativa é liberada.
grant select (phase_id, group_id, round_id)
  on public.matches to anon;

-- Regulamentos e suas configurações internas não fazem parte do contrato
-- público, mesmo quando o campeonato/temporada estiver publicado.
revoke all privileges on table public.competition_regulations from anon;
revoke select (
  id, season_id, status, format, general_settings, scoring_settings,
  classification_settings, teams_settings, phase_settings, match_settings,
  knockout_settings, discipline_settings, substitution_settings,
  final_provisions, published_at, created_at, updated_at
) on public.competition_regulations from anon;
drop policy if exists "regulations_public_or_manage" on public.competition_regulations;

commit;
