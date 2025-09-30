# LinkMark API (PHP)

Este é um scaffold mínimo de API em PHP (puro) rodando atrás de Nginx + PHP-FPM. Ele expõe um conjunto reduzido de endpoints e armazena dados em um arquivo JSON para você começar rapidamente. Depois, você pode trocar o armazenamento por MySQL usando as variáveis de ambiente já presentes no compose.

## Como executar

1. Inicie a API (PHP):

   cd aplicacoes/api/php
   docker compose -f compose.yaml up --build

   A API ficará disponível em http://localhost:8000

2. Inicie a Web (PHP puro):

   cd aplicacoes/web
   docker compose -f compose.yaml up --build

   A Web ficará disponível em http://localhost:80 e já está pré-configurada para chamar a API em http://localhost:8000.

## Endpoints

- GET /health → { success, data: { status, time } }

As respostas são JSON no formato:

- success: boolean
- data: any
- error?: string

A origem CORS é controlada via a variável de ambiente FRONTEND_URL (padrão: http://localhost:80).

## Variáveis de ambiente

- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME: Disponibilizadas para uso com MySQL
- FRONTEND_URL: Origem permitida para CORS da aplicação Web (padrão http://localhost:80)
