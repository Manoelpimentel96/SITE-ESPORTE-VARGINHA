# Registro de execução — SITE ESPORTE

## Alterações implementadas no pacote

- Separação de builds de frontend público e administrativo.
- Criação de API Fastify independente com health check, CORS allowlist, Helmet, rate limit, cookies assinados e limite de corpo.
- Autenticação por sessão HttpOnly; frontend não recebe tokens Supabase.
- Permissões carregadas do banco e verificadas em cada endpoint administrativo.
- Serviços do frontend substituídos por chamadas HTTP; não há cliente Supabase importado pelas telas.
- Casos de uso e adaptadores de domínio executados no servidor com JWT por requisição.
- Cadastro de colaboradores implementado com Supabase Auth Admin no servidor; a trigger cria perfil viewer e o backend promove ao papel autorizado.
- Auditoria das operações administrativas e logs de login/logout.
- Upload de escudos e fotos encaminhado à API, com limite de 5 MB.
- Ajustes de contratos: temporadas (`year`/status), jogadores e inscrições sazonais, comissão técnica, regulamentos, classificação, partidas, títulos, dashboard e auditoria.
- RLS pública restrita a campeonatos publicados e temporadas elegíveis.
- Bootstrap manual do primeiro proprietário, sem autoelevação pública.
- Separação de CSS da tela de inscrições e tokens visuais centralizados.
- Remoção da identidade fixa de Varginha e inclusão de logout e navegação por permissões.

## Dependências externas que impedem homologação real neste ambiente

1. O projeto Supabase ainda não existe; não há URL, anon key, service-role key, Auth, Storage ou PostgreSQL remoto para conectar.
2. Não foram fornecidos domínio, hospedagem da API, hospedagem dos dois builds, SMTP ou configuração DNS/TLS.
3. A instalação de dependências não pôde ser concluída neste ambiente por indisponibilidade/timeout do registry npm; portanto `tsc`, Vite, ESLint e testes automatizados não puderam ser executados com sucesso aqui.
4. As migrações e políticas foram revisadas no código, mas ainda precisam ser aplicadas e verificadas em Supabase de homologação.

## Critério de conclusão de produção

O projeto só poderá ser marcado como pronto para publicação após: instalar dependências, executar lint/build/typecheck, aplicar 0001 e 0002 em Supabase de homologação, criar primeiro owner, testar CRUD real de todos os módulos, testar RLS anon/authenticated, permissões por papel, Auth/recuperação/logout, Storage, responsividade e fluxo público/admin, configurar domínio/TLS/SMTP/backups e repetir smoke tests no ambiente de produção.
