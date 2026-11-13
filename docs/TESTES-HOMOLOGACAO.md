# Plano de homologação — SITE ESPORTE

Este checklist é obrigatório após conectar o Supabase real. Não usar registros fictícios no banco de produção; os testes de CRUD devem ocorrer em projeto Supabase de homologação separado.

## 1. Build e qualidade

- [ ] `npm ci` sem erros.
- [ ] `npm run api:install` sem erros.
- [ ] `npm run lint` sem erros.
- [ ] `npm run build:public` gera `dist/public`.
- [ ] `npm run build:admin` gera `dist/admin`.
- [ ] `npm run api:check` sem erros.
- [ ] `GET /health` retorna `status=ok`.

## 2. Banco e integridade

- [ ] Aplicar 0001 e 0002 em Supabase novo.
- [ ] Confirmar 20 tabelas, relacionamentos, constraints, funções, triggers e índices.
- [ ] Confirmar RLS habilitado em todas as tabelas operacionais.
- [ ] Confirmar grants por coluna do papel `anon` e ausência de leitura de CPF, nascimento, telefone e e-mail.
- [ ] Confirmar que não existem campeonatos, equipes, jogadores ou partidas de demonstração.
- [ ] Verificar integridade de equipe/temporada/inscrição, jogador/temporada, fase/grupo/rodada/partida e eventos.

## 3. Autenticação e permissões

- [ ] Criar primeiro usuário Auth e executar bootstrap owner uma única vez.
- [ ] Login owner; refresh de sessão; logout; recuperação e troca de senha.
- [ ] Usuário viewer não consegue entrar no painel.
- [ ] Admin gerencia módulos e colaboradores, mas não corrige partida finalizada sem permissão específica.
- [ ] Organizer acessa apenas os módulos permitidos.
- [ ] Editor atualiza somente os módulos permitidos.
- [ ] Chamadas diretas à API sem sessão retornam 401.
- [ ] Chamadas com sessão sem permissão retornam 403.
- [ ] Origem não allowlisted é rejeitada em métodos de escrita.
- [ ] Cookie é HttpOnly, Secure em produção, assinado e não acessível por JavaScript.

## 4. CRUD real por módulo

- [ ] Campeonatos: criar, consultar, editar, publicar e excluir quando não houver vínculos.
- [ ] Temporadas: criar, consultar, editar, mudar status e excluir quando não houver vínculos.
- [ ] Regulamentos: salvar, validar, publicar e despublicar.
- [ ] Equipes: criar, editar, registrar em temporada, escudo e comissão técnica.
- [ ] Jogadores: criar, editar, inscrição sazonal, número da camisa, foto e exclusão segura.
- [ ] Fases, grupos e rodadas: CRUD e integridade com temporada.
- [ ] Partidas: CRUD, vínculos de equipe e fase, atualização de placar/eventos e proteção de partida finalizada.
- [ ] Classificação: cálculo a partir de partidas finalizadas e regras do regulamento.
- [ ] Títulos: criação, alteração e exclusão.
- [ ] Colaboradores: criação Auth, perfil, alteração de papel, ativação/desativação e bloqueio de viewer no painel.
- [ ] Dashboard: contagens e partidas filtradas pelo campeonato/temporada.
- [ ] Auditoria: registro de mutações, login/logout e filtro de histórico.

## 5. Portal público

- [ ] Sem sessão, o portal lista somente campeonatos publicados.
- [ ] Temporadas não publicadas não aparecem.
- [ ] Consultas de equipes, jogadores, partidas, classificação e estatísticas correspondem ao banco real.
- [ ] Campeonatos em rascunho não podem ser consultados por URL direta.
- [ ] Respostas não contêm CPF, data de nascimento, telefone, e-mail ou dados internos.
- [ ] Estados vazios, loading, falha de API e 404 são apresentados corretamente.

## 6. Storage

- [ ] Escudos aceitam somente formatos de imagem autorizados e limite de 5 MB.
- [ ] Fotos aceitam somente formatos de imagem autorizados e limite de 5 MB.
- [ ] Upload exige permissão de módulo.
- [ ] Arquivos e referências não ficam órfãos após exclusão/edição.

## 7. Interface, responsividade e desempenho

- [ ] 320 px, 375 px, 768 px, 1024 px e desktop amplo.
- [ ] Navegação pública e administrativa independente.
- [ ] Foco por teclado, labels, mensagens de erro e contraste.
- [ ] Sem overflow horizontal ou elementos sobrepostos.
- [ ] Medir LCP, INP e CLS em build de produção.
- [ ] Verificar tamanho de bundles público/admin e cache de assets.

## 8. Produção e operação

- [ ] Configurar domínio público, domínio administrativo e domínio da API.
- [ ] TLS válido nos três domínios.
- [ ] CORS allowlist apenas com origens oficiais.
- [ ] `COOKIE_DOMAIN` correto para os subdomínios.
- [ ] SMTP de recuperação configurado.
- [ ] Secrets somente no ambiente da API.
- [ ] Backups automáticos e teste de restauração.
- [ ] Logs, alertas, rate limits e health checks.
- [ ] Smoke tests após deploy e verificação de rollback.

**Aprovação:** todas as caixas aplicáveis precisam estar marcadas em ambiente de homologação; os testes críticos de Auth, RLS, CRUD, Storage e exposição de dados precisam ser repetidos em produção sem criar dados fictícios.
