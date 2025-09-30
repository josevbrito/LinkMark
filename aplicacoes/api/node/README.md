# LinkMark API (Node + TypeScript)

Este diretório contém a opção de API em Node + TypeScript usando Express.

## Como executar

1. Inicie a API (Node):

   cd aplicacoes/api/node
   docker compose -f compose.yaml up --build

   - A API ficará disponível em: http://localhost:8000
   - O container mapeia a porta 8000 (host) → 3000 (container).
   - O serviço instala dependências automaticamente e roda `start:dev` (ts-node-dev).

2. (Opcional) Inicie a Web em outro terminal:

   cd aplicacoes/web
   docker compose -f compose.yaml up --build

   - Web: http://localhost:80 (pré-configurada para chamar a API em http://localhost:8000)

## Endpoints

- GET /health → { success, data: { status, time } }

As respostas usam o envelope: { success, data?, error? }.

## CORS

A origem permitida é controlada por FRONTEND_URL (padrão: http://localhost:80). Ajuste em `compose.yaml` se necessário.

## Variáveis de ambiente

- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME: para integração com MySQL
- FRONTEND_URL: origem permitida para CORS da aplicação Web (padrão http://localhost:80)
