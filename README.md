# LinkMark — Esqueleto para Teste Técnico Fullstack

Este repositório fornece um ponto de partida mínimo para um exercício fullstack composto por:

- Aplicação Web (PHP + HTML + CSS + JS puros)
- Aplicação de API (escolha UMA):
  - PHP (puro, Nginx + PHP-FPM), ou
  - Node + TypeScript (Express)

Você pode rodar qualquer uma das APIs; a aplicação Web já está configurada para chamar a API em http://localhost:8000.

## Pré-requisitos

- Docker e Docker Compose

## Pastas

- aplicacoes/web → Aplicação Web em PHP puro
- aplicacoes/api/php → API em PHP (puro)
- aplicacoes/api/node → API em Node + TypeScript

## Como executar

Você pode rodar a Web e uma das APIs em terminais separados. A Web espera a API em http://localhost:8000.

### Opção A: API em PHP

Terminal 1:

cd aplicacoes/api/php
docker compose -f compose.yaml up --build

Terminal 2:

cd aplicacoes/web
docker compose -f compose.yaml up --build

- Web: http://localhost:80
- API (PHP): http://localhost:8000

### Opção B: API em Node + TypeScript

Terminal 1:

cd aplicacoes/api/node
docker compose -f compose.yaml up --build

Terminal 2:

cd aplicacoes/web
docker compose -f compose.yaml up --build

- Web: http://localhost:80
- API (Node): http://localhost:8000

## Endpoints (ambas as opções de API)

- GET /health → { success, data: { status, time } }

As respostas usam o mesmo envelope simples: { success, data?, error? }.

O CORS é configurado para permitir a origem da Web (padrão http://localhost:80). Você pode alterar isso editando a variável FRONTEND_URL no arquivo compose da API.

## Notas para candidatos

- Você também pode reestruturar os projetos (frameworks permitidos) como preferir, desde que atenda aos requisitos de alto nível.
