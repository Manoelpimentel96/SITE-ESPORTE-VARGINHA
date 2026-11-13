# Auditoria técnica — SITE ESPORTE

**Escopo inicial:** inspeção estática do ZIP entregue. O Supabase remoto não existe e não foram fornecidas credenciais de infraestrutura.

## Inventário

- React 19, TypeScript 6, Vite 8 e React Router 7.
- Módulos existentes para campeonatos, temporadas, regulamentos, equipes, jogadores, inscrições, comissão técnica, fases, grupos, rodadas, partidas, classificação, títulos, colaboradores, dashboard e auditoria.
- Migração base com 20 tabelas, 47 políticas, 8 funções, 15 triggers e 22 índices.
- Portal público e painel administrativo já possuíam telas, porém a separação de execução, autenticação e comunicação com o banco não estava concluída.

## Problemas encontrados e correções implementadas

1. `ProtectedRoute` não verificava sessão. Foi conectado ao estado de autenticação via API.
2. As rotas públicas não estavam montadas no roteador principal. Foram integradas e isoladas por build.
3. Os serviços frontend consultavam Supabase diretamente. Foram substituídos por clientes HTTP que chamam a API.
4. Dois clientes Supabase estavam inicializados. O cliente de domínio foi tornado server-only, com JWT isolado por requisição.
5. Não existia API independente. Foi criada aplicação Fastify com autenticação, autorização, CORS allowlist, Helmet, rate limit, cookie assinado e health check.
6. A chave de serviço não deve ser exposta. O provisionamento de colaboradores agora ocorre exclusivamente no servidor e após verificação de `collaborators.manage`.
7. Cadastro público de Auth não era compatível com colaboradores convidados. O signup foi desabilitado e foi criada trigger de perfil `viewer`, com bootstrap manual do primeiro proprietário.
8. As políticas públicas originais permitiam leitura ampla. A migração 0002 substitui as políticas operacionais por políticas condicionadas à publicação e acrescenta grants por coluna para evitar exposição de CPF, nascimento, telefone, e-mail e campos internos.
9. A tabela `players` representa a pessoa, enquanto número da camisa e vínculo com equipe pertencem à inscrição sazonal. O repositório de jogadores foi ajustado para o modelo relacional existente.
10. A comissão técnica sazonal usava campos inexistentes (`season_id`, `name`) em `team_staff`. O adaptador agora usa `team_registration_id` e `full_name`, respeitando a ordem de inscrição da equipe.
11. O dashboard consultava `home_team_id`/`away_team_id`; o esquema usa `home_registration_id`/`away_registration_id`. A consulta foi alinhada e as atividades respeitam `audit.read`.
12. A classificação consultava tabela/colunas inexistentes de regulamento e eventos. O adaptador usa `competition_regulations.scoring_settings`, `classification_settings` e `match_events.event_type`.
13. O histórico de títulos usava coluna antiga `season_team_registration_id`; foi alinhado a `team_registration_id`.
14. A temporada não possuía `year` compatível com o formulário e os status do contrato frontend. A migração base foi alinhada e o portal usa `edition` com fallback para `year`.
15. A tela de inscrições importava CSS de regulamentos. Foi criada folha independente.
16. O painel não tinha logout e mostrava uma identidade fixa de outra cidade. O branding foi corrigido, o logout foi implementado e a navegação passou a respeitar permissões retornadas pela API.
17. Foram criados tokens visuais centrais para cores, tipografia, espaçamentos, superfícies, bordas e foco.

## Estrutura de banco

- `0001_initial_schema.sql`: base relacional e objetos originais, com `year` e status de temporada alinhados.
- `0002_security_and_contract_alignment.sql`: contratos, trigger de perfil, políticas RLS restritas e privilégios de leitura por coluna para `anon`.
- `bootstrap/001_first_owner.sql`: promoção manual e única do primeiro usuário.

## Limitações de validação

A revisão estática e a verificação de caminhos relativos foram executadas. Os arquivos JavaScript da API passaram por `node --check`. A instalação npm não pôde ser concluída neste ambiente: o registry não respondeu a tempo e o modo offline não tinha o pacote `zod-validation-error` em cache. Por isso, Vite, ESLint e TypeScript não foram aprovados por execução. Também não foi possível aplicar migrações nem executar CRUD/RLS/Auth/Storage sem um projeto Supabase real.

**Conclusão:** as alterações de arquitetura e alinhamento estão no código entregue; a homologação de produção permanece bloqueada por infraestrutura externa e por validações que exigem dependências e Supabase real. Não declarar publicação concluída antes dessas verificações.
