# SITE ESPORTE

Plataforma de gestão de competições esportivas com portal público e painel administrativo independentes, API própria e Supabase PostgreSQL.

## Arquitetura

```text
www.seudominio.com.br  -> Frontend público (build dist/public)
admin.seudominio.com.br -> Frontend administrativo (build dist/admin)
api.seudominio.com.br  -> API Fastify / Node.js
                           |-- autenticação e sessões HttpOnly
                           |-- autorização por permissões
                           |-- validação e regras de negócio
                           |-- módulos de domínio
                           `-- Supabase PostgreSQL / Auth / Storage
```

O navegador **não importa nem inicializa cliente Supabase**. Os serviços em `src/services` fazem chamadas HTTP à API. O código de domínio e os adaptadores Supabase são executados pelo servidor. A chave `SUPABASE_SERVICE_ROLE_KEY` é exclusiva da API e usada apenas para administração de contas de colaboradores.

## Requisitos

- Node.js 22 ou superior.
- npm 10 ou superior.
- Projeto Supabase novo.
- Projeto de hospedagem para a API e dois builds estáticos.
- Domínio e subdomínios com HTTPS em produção.

## Instalação local

Na raiz do projeto:

```bash
npm ci
cp .env.example .env.local
npm run api:install
cp apps/api/.env.example apps/api/.env
```

Preencha `apps/api/.env` com os dados reais do projeto Supabase e gere um `COOKIE_SECRET` aleatório com pelo menos 32 caracteres. Não coloque `SUPABASE_SERVICE_ROLE_KEY` em `.env.local`, em arquivos `VITE_*`, no frontend ou no repositório.

Para desenvolvimento integrado:

```bash
npm run api:dev
npm run dev
```

O Vite encaminha `/api` para `http://localhost:3333`. A aplicação combinada de desenvolvimento contém as rotas públicas e administrativas; os builds de produção são separados.

## Banco Supabase

O banco remoto ainda precisa ser criado pelo responsável do projeto. A estrutura está em migrações incrementais:

1. `supabase/migrations/0001_initial_schema.sql` — tabelas, relacionamentos, integridade, funções, permissões, triggers, RLS inicial e Storage.
2. `supabase/migrations/0002_security_and_contract_alignment.sql` — alinhamento dos contratos dos módulos, perfil automático não privilegiado e políticas públicas restritas a campeonatos publicados e temporadas públicas.

Para homologação local (Docker necessário), inicie um Supabase local e aplique as migrações:

```bash
supabase start
supabase db reset
supabase status
```

O `supabase status` mostra as chaves locais. Use-as somente em `apps/api/.env` para a API local.

Para um projeto remoto, com o Supabase CLI instalado e autenticado:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

Não execute somente a migração 0001. A 0002 corrige políticas de leitura e contratos necessários à aplicação.

### Primeiro proprietário

1. Mantenha o cadastro público desabilitado no Supabase Auth.
2. Crie o primeiro usuário administrador pelo painel do Supabase Auth.
3. A trigger da migração cria automaticamente o perfil com papel `viewer`, sem privilégios.
4. Abra `supabase/bootstrap/001_first_owner.sql`, substitua o e-mail de exemplo pelo e-mail real do responsável e execute uma única vez no SQL Editor.
5. Faça login no painel administrativo. O primeiro usuário só recebe `owner` por esse procedimento manual e protegido.

Os colaboradores posteriores são criados pela API usando a chave de serviço no servidor. O perfil criado pela trigger é atualizado para o papel solicitado, e a API verifica a permissão `collaborators.manage` antes da operação.

### Auth e e-mail

- Mantenha `enable_signup = false`.
- Configure a URL de recuperação para a origem administrativa (`WEB_ORIGIN`).
- Cadastre as URLs de redirecionamento do domínio administrativo no Supabase Auth.
- Configure SMTP de produção antes de habilitar recuperação de senha por e-mail.
- A política de sessão usa cookie assinado, `HttpOnly`, `Secure` em produção e `SameSite=Lax`.

## Builds separados

```bash
npm run build:public
npm run build:admin
```

- Público: `dist/public`.
- Administrativo: `dist/admin`.

Cada hospedagem estática deve servir o `index.html` como fallback para rotas SPA. Configure as variáveis antes de compilar:

- `.env.public`: `VITE_APP_MODE=public` e `VITE_API_URL=https://api.seudominio.com.br/api`.
- `.env.admin`: `VITE_APP_MODE=admin` e `VITE_API_URL=https://api.seudominio.com.br/api`.

Use os arquivos `.env.public.example` e `.env.admin.example` como referência. Não use segredos nas variáveis `VITE_*`.

## API

A API fica em `apps/api` e usa Fastify. Em produção:

```bash
npm --prefix apps/api install
npm --prefix apps/api start
```

Variáveis obrigatórias em `apps/api/.env`:

- `NODE_ENV=production`
- `API_HOST=0.0.0.0`
- `API_PORT` definido pelo provedor
- `WEB_ORIGIN=https://admin.seudominio.com.br`
- `ALLOWED_ORIGINS=https://www.seudominio.com.br,https://admin.seudominio.com.br`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `COOKIE_SECRET` forte e exclusivo
- `COOKIE_DOMAIN=.seudominio.com.br` para compartilhar a sessão entre subdomínios

A API oferece `GET /health`. Configure TLS no proxy/hospedagem, limite de recursos, logs, alertas e backup automático do Supabase.

## Segurança e regras

- O frontend é uma camada de apresentação e consumo da API.
- A API valida autenticação e permissão em cada operação administrativa.
- As regras de negócio dos módulos são executadas no servidor.
- O Supabase mantém integridade relacional, constraints, triggers e RLS como defesa adicional.
- Visitantes anônimos consultam somente dados de campeonatos publicados e temporadas elegíveis pelas políticas RLS.
- Usuários com papel `viewer` não entram no painel administrativo.
- As credenciais privilegiadas nunca são enviadas ao navegador.
- As operações administrativas bem-sucedidas geram registros de auditoria; login e logout são registrados em `access_logs`.
- Não existe seed de campeonatos, equipes, partidas ou jogadores fictícios.

## Verificações

```bash
npm run lint
npm run build:public
npm run build:admin
npm run api:check
```

Os testes integrados de CRUD, permissões, RLS, Auth e Storage devem ser executados depois de aplicar as migrações em um projeto Supabase de homologação com credenciais reais. Não há banco remoto conectado neste pacote.

## Estrutura principal

```text
apps/api/                 API Fastify e serviços de domínio executados no servidor
src/frontend/             páginas, layouts, componentes e rotas React
src/services/             clientes HTTP do frontend
src/backend/              regras, casos de uso, validações, contratos e adaptadores de domínio
src/lib/api.ts            transporte HTTP e autenticação do frontend
src/lib/domainApi.ts      chamadas de domínio à API
apps/api/src/lib/supabase.ts       cliente Supabase server-only com contexto JWT por requisição
supabase/migrations/      migrações versionadas
supabase/bootstrap/       promoção manual e única do primeiro proprietário
docs/                     auditoria, arquitetura, execução e homologação
```
