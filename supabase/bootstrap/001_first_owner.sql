-- Execute exactly once in Supabase SQL Editor after creating the first Auth user.
-- Replace the e-mail below with the real e-mail of the project owner.
-- This script refuses to promote a second owner.
do $$
declare
  target_email text := lower('COLOQUE-O-EMAIL-DO-RESPONSAVEL-AQUI');
  target_user_id uuid;
begin
  if exists (select 1 from public.profiles where role = 'owner') then
    raise exception 'Já existe um proprietário cadastrado. Bootstrap bloqueado.';
  end if;
  select user_id into target_user_id
  from public.profiles
  where lower(email) = target_email and is_active = true;
  if target_user_id is null then
    raise exception 'Perfil ativo não encontrado para o e-mail informado.';
  end if;
  update public.profiles set role = 'owner', updated_at = now()
  where user_id = target_user_id;
end;
$$;
