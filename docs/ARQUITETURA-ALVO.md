# Arquitetura definitiva — SITE ESPORTE

## Limites de confiança

1. **Frontend público:** consulta endpoints públicos; não recebe credenciais Supabase.
2. **Frontend administrativo:** autentica por API, mantém sessão em cookie HttpOnly e solicita operações por API REST/RPC interno.
3. **Backend Fastify:** único ponto de entrada operacional da aplicação; autentica a sessão, consulta o perfil, verifica `has_permission`, executa casos de uso e grava auditoria.
4. **Supabase:** PostgreSQL, Auth, Storage, RLS, constraints, triggers e índices. O cliente de banco existe somente no servidor.

## Aplicações

- `VITE_APP_MODE=public` produz o portal em `dist/public`.
- `VITE_APP_MODE=admin` produz o painel em `dist/admin`.
- `apps/api` é uma aplicação Node separada e expõe `/api`.

## Sessão e autorização

- Login com Supabase Auth é executado no servidor.
- Access/refresh tokens ficam dentro de cookie assinado, HttpOnly e Secure em produção.
- O frontend não lê nem persiste tokens.
- `/auth/me` renova a sessão e retorna perfil/permissões para montar a navegação.
- Cada chamada administrativa repete a verificação de sessão e `has_permission`; esconder menu não é controle de segurança.
- O papel `viewer` é exclusivamente público.
- `SUPABASE_SERVICE_ROLE_KEY` é usada apenas no servidor para criar/atualizar contas de colaboradores, depois da autorização da API.

## Domínio

Os módulos de campeonatos, temporadas, regulamentos, equipes, jogadores, partidas, fases, grupos, rodadas, classificação, títulos, colaboradores, dashboard e auditoria reutilizam casos de uso e repositórios do projeto original. Os adaptadores Supabase são invocados no contexto JWT isolado por requisição com `AsyncLocalStorage`.

## Banco

A migração 0001 define o esquema relacional base. A migração 0002 alinha campos utilizados pelos módulos, instala criação automática de perfil não privilegiado e substitui políticas de leitura permissivas por políticas condicionadas à publicação. O primeiro proprietário é promovido por SQL manual, uma única vez.

## Decisões de integridade

- Jogador é entidade permanente; camisa e participação pertencem à inscrição do jogador na temporada.
- Equipe é entidade do campeonato; sua participação na temporada é `season_team_registrations`.
- Comissão técnica sazonal é vinculada à inscrição da equipe, e presidente é vinculado à equipe.
- Partida referencia inscrições de equipes da mesma temporada; integridade adicional é garantida por constraints e triggers.
- Classificação é calculada a partir de partidas finalizadas, inscrições e eventos; não é uma tabela de dados fictícios.
- Temporadas usam `year` no contrato administrativo e preservam `edition` para exibição pública quando informado.
