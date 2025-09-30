# LinkMark Web (PHP puro)

Aplicação Web simples em PHP, HTML, CSS e JS, que consome a API do LinkMark.

## Como executar

1. Inicie a Web:

   cd aplicacoes/web
   docker compose -f compose.yaml up --build

   - A Web ficará disponível em: http://localhost:80
   - A URL da API é lida da variável de ambiente `API_URL` (padrão: http://localhost:8000)

2. Inicie uma das APIs em outro terminal (escolha UMA):

   - API em PHP:

     cd aplicacoes/api/php
     docker compose -f compose.yaml up --build

   - API em Node + TypeScript:

     cd aplicacoes/api/node
     docker compose -f compose.yaml up --build

   Por padrão ambas expõem a API em http://localhost:8000.

## Configuração

- `API_URL`: variável de ambiente definida no serviço `php` do `compose.yaml` desta pasta. Altere se necessário para apontar para a URL da sua API.

## Estrutura do projeto

- `src/index.php`: página principal, injeta `API_URL` no frontend
- `src/assets/css/app.css`: estilos básicos
- `src/assets/js/app.js`: script de exemplo para consumir a API
- `nginx/default.conf`: configuração do Nginx para servir PHP via FPM

## Observações

- CORS deve permitir a origem da Web (http://localhost:80 por padrão). Essa permissão é controlada na API pela variável `FRONTEND_URL`.
- Você pode evoluir o layout, adicionar rotas e estado conforme desejar durante o teste.
