# Correções dos erros reportados — SITE ESPORTE

## ESLint
- `collaborators.supabase.ts`: removida a inicialização inútil de `savedProfile`; a variável é atribuída em todos os caminhos antes da leitura.
- `LoginPage.tsx`: erro de link de recuperação inválido passou a ser derivado dos parâmetros da URL e apresentado na prop `error`, sem `setState` síncrono dentro do efeito.

## TypeScript da API
- `apps/api/src/server.ts`: handler global passou a tratar o erro como `unknown`, fazer narrowing seguro de `statusCode` e `message` e evitar acesso inseguro a propriedades.

## TypeScript do domínio
- `regulation.supabase.ts`: `classificationSettings` agora é montado campo a campo e validado por tipo, em vez de converter diretamente `Record<string, unknown>` para o tipo de domínio.
- `regulationService.ts`: `saveRegulation` aceita o identificador opcional e o encaminha como segundo argumento da chamada à API, compatível com `RegulationUseCases.save(data, id?)`.
- `SeasonsPage.tsx`: removida a tentativa incorreta de importar `SeasonValidationError` pelo service do frontend (a instância não atravessa HTTP); incluído o status `active` no mapa de rótulos e removido acesso a propriedades de `unknown`.

## Verificação neste ambiente
- Foi tentada a instalação limpa das dependências com `npm ci --no-audit --no-fund`, mas a operação excedeu o limite de tempo do ambiente.
- A verificação TypeScript da API não pôde iniciar porque a instalação incompleta não disponibilizou `@types/node`.
- Portanto, as correções dos erros listados foram aplicadas no código, mas `npm run lint`, `npm run api:check`, `npm run build:public` e `npm run build:admin` ainda precisam ser executados após `npm ci` completar na máquina de desenvolvimento.

## Como validar no Windows
Na raiz do projeto:

```powershell
npm ci
npm run lint
npm run api:check
npm run build:public
npm run build:admin
```

## Atualização desta entrega (11/11/2026)
- `src/frontend/pages/auth/LoginPage.tsx`: os parâmetros do link de recuperação são calculados antes dos hooks de estado; `isLoading` recebe o valor inicial adequado quando a tela abre por um link de recuperação válido. Removido `setIsLoading(true)` síncrono do `useEffect`, mantendo o controle de conclusão no fluxo assíncrono.
- A instalação limpa foi tentada novamente com `npm ci --no-audit --no-fund`, mas excedeu o limite de execução deste ambiente. Portanto, lint, typecheck e builds não foram confirmados como aprovados nesta sessão.
