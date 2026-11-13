# Instalação no Windows

> Execute os comandos na pasta raiz do projeto, isto é, na pasta que contém `package.json` e `package-lock.json`.

## Frontend

```powershell
npm ci
npm run lint
npm run build:public
npm run build:admin
```

## API

A API possui dependências próprias em `apps/api/package.json`.

```powershell
npm run api:install
npm run api:check
```

## Verificação completa

```powershell
npm run check
npm run api:check
```

Se o terminal mostrar que `package-lock.json` não foi encontrado, confira a pasta atual com:

```powershell
Get-Location
Get-ChildItem package.json, package-lock.json
```

Não execute `npm ci` na pasta pai ou em uma pasta de downloads que apenas contém a pasta do projeto. O comando deve ser executado no mesmo diretório em que estão `package.json` e `package-lock.json`.
