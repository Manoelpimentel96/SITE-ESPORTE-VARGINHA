# SITE ESPORTE — entrega da estrutura inicial

## Conteúdo
- Módulo Regulamentos: tipos, validação, repositório, casos de uso, adaptador Supabase e service.
- Tela Regulamentos com seleção Campeonato → Temporada, dez seções e ações Salvar/Validar/Publicar.
- CSS próprio.
- Migração inicial consolidada `supabase/migrations/0001_initial_schema.sql`.

## Instalação no projeto
Copie a pasta `src/` para a raiz do projeto, preservando os caminhos. Copie o SQL para `supabase/migrations/0001_initial_schema.sql`.

## Atenção antes de aplicar
A migração é uma definição inicial para banco Supabase novo. Não aplicar sobre tabelas existentes.
O banco do projeto ainda não foi criado/aplicado e esta entrega não afirma que houve conexão ou teste real de CRUD.
Antes de aplicar, revisar a política operacional de cada módulo e criar o primeiro perfil `owner` de forma administrativa segura. A migração não promove automaticamente o primeiro usuário a proprietário.

## Dependências / integração
- Usa os serviços existentes `championshipService` e `seasonService`.
- A página espera `listChampionships()` e `listSeasons({ championshipId })`.
- O service espera `src/lib/supabase.ts` e `handleDatabaseError` em `src/backend/core/errors/AppError.ts`.
- Se os tipos Championship/Season tiverem nomes exportados diferentes, ajustar apenas os imports de tipo da tela.

## Observação de domínio
A tabela `teams` guarda o cadastro permanente. `season_team_registrations` representa a participação da equipe em cada temporada. Jogadores são cadastrados em `players` e vinculados via `player_registrations`. Comissão técnica é vinculada diretamente à inscrição da equipe naquela temporada. Assim, alterações futuras não apagam o histórico de temporadas anteriores.


## Primeiro proprietário
Após criar o primeiro usuário pelo fluxo de autenticação, identificar o UUID dele em `auth.users` e promover explicitamente o perfil:
```sql
update public.profiles
set role = 'owner', status = 'active'
where id = (
  select id from auth.users where email = 'EMAIL_DO_PROPRIETARIO'
);
```
Substitua o e-mail pelo endereço real. Não há promoção automática do primeiro cadastro, para evitar que qualquer pessoa que se registre obtenha autoridade máxima.
