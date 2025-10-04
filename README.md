# LinkMark — Aplicação Fullstack de Organização de Links

Este repositório contém o projeto **LinkMark**, uma aplicação completa de organização de links, composta por uma **Aplicação Web (Frontend)** em PHP, HTML, CSS e JavaScript puros, e uma **API (Backend)** em Node.js com TypeScript e Express.

O objetivo é demonstrar a comunicação fullstack, onde a aplicação Web consome os serviços da API.

---

## 🏗️ Arquitetura do Projeto

O projeto é dividido em dois serviços principais dentro da pasta `aplicacoes/`:

| Serviço | Tecnologia | Porta (Docker Host) | URL Padrão | Notas |
|---------|-----------|---------------------|------------|-------|
| **Web** | PHP Puro (Nginx) | 8080 | `http://localhost:8080` | Frontend em PHP, HTML, CSS e JS puros. |
| **API** | Node.js + Express + TS | 8000 | `http://localhost:8000` | Backend robusto, configurado para MySQL. |

---

## 🚀 Como Executar o Projeto (Docker Compose)

Você precisa ter o **Docker** e o **Docker Compose** instalados.

O fluxo de execução recomendado é iniciar a API primeiro e, em seguida, a Web.

### 1. Iniciar a API (Backend)

Navegue até o diretório da API e use o Docker Compose:

```bash
# Terminal 1
cd aplicacoes/api/node
docker compose -f compose.yaml down -v  # Opcional: Para limpar containers e volumes anteriores
docker compose -f compose.yaml up --build
```

**Status da API:** A API estará disponível em `http://localhost:8000`.

**Saúde da API:** Você pode verificar a saúde da API em `http://localhost:8000/health`.

O container instala as dependências Node e inicia o modo de desenvolvimento (`ts-node-dev`).

**Exemplo de saída esperada no terminal:**

```
node-1   | [INFO] Conexão com o banco de dados estabelecida.
node-1   | [INFO] Executando migrações...
node-1   | [INFO] Migração do banco de dados (tabelas) concluída com sucesso.
node-1   | [INFO] Executando seeding...
node-1   | [INFO] Usuário de teste criado com ID: 1 (Email: teste@linkmark.com / Senha: password)
node-1   | [INFO] O seeding do banco de dados foi concluído com sucesso.
node-1   | [INFO] API Node está em http://localhost:3000 (exposto em http://localhost:8000)
node-1   | [INFO] Conexão com o banco de dados bem-sucedida. Aplicação pronta.
```

### 2. Iniciar a Aplicação Web (Frontend)

Em um terminal separado, inicie a aplicação Web:

```bash
# Terminal 2
cd aplicacoes/web
docker compose -f compose.yaml down -v  # Opcional: Para limpar containers e volumes anteriores
docker compose -f compose.yaml up --build
```

**Aplicação Web:** Acesse `http://localhost:8080` no seu navegador.

A Web está pré-configurada para buscar a API em `http://localhost:8000`.

### 3. Acessar a Aplicação

Após a inicialização completa dos dois serviços, a aplicação estará rodando em **`http://localhost:8080`**.

Você pode:
- **Criar um novo usuário** através da interface de registro, ou
- **Entrar com o usuário de teste** criado automaticamente via seed:
  - **Email:** `teste@linkmark.com`
  - **Senha:** `password`

---

## 🗄️ Acesso ao Banco de Dados

O banco de dados MySQL está exposto na porta **3307** do host e pode ser acessado através de ferramentas GUI como **DBeaver**, **HeidiSQL**, **MySQL Workbench**, entre outras.

### Credenciais de Conexão:

| Parâmetro | Valor |
|-----------|-------|
| **Host** | `localhost` |
| **Porta** | `3307` |
| **Banco de Dados** | `linkmark` |
| **Usuário** | `linkmark_api` |
| **Senha** | `linkmark` |

### Exemplo de Configuração no DBeaver/HeidiSQL:

```
Host: localhost
Port: 3307
Database: linkmark
Username: linkmark_api
Password: linkmark
```

---

## 📁 Estrutura de Pastas

```
LinkMark/
├── aplicacoes/
│   ├── api/
│   │   └── node/
│   │       ├── compose.yaml
│   │       └── src/
│   │           ├── database/
│   │           │   ├── database.ts
│   │           │   ├── migration.sql
│   │           │   └── seed.ts
│   │           ├── server/
│   │           │   ├── app.ts
│   │           │   ├── middlewares.ts
│   │           │   └── routes/
│   │           │       ├── auth.ts
│   │           │       ├── categories.ts
│   │           │       ├── export.ts
│   │           │       ├── links.ts
│   │           │       └── stats.ts
│   │           ├── server.ts
│   │           ├── tsconfig.json
│   │           └── package.json
│   └── web/
│       ├── compose.yaml
│       ├── nginx/
│       │   └── default.conf
│       └── src/
│           ├── index.php
│           └── assets/
│               ├── css/
│               │   └── app.css
│               └── js/
│                   └── app.js
└── README.md
```

---

## 🌐 Endpoints da API

A API foi desenvolvida para usar um envelope simples de resposta: `{ success, data?, error? }`.

### Geral

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Checagem de saúde da API. |

### Auth

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/register` | Cria um novo usuário. |
| `POST` | `/auth/login` | Autentica um usuário e retorna um JWT. |

### Categories (Requer JWT)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/categories` | Lista todas as categorias do usuário. |
| `POST` | `/categories` | Cria uma nova categoria. |
| `PUT` | `/categories/:id` | Atualiza uma categoria. |
| `DELETE` | `/categories/:id` | Exclui uma categoria e seus links associados. |

### Links (Requer JWT)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/links` | Lista todos os links (com filtros opcionais). |
| `POST` | `/links` | Cria um novo link. |
| `PUT` | `/links/:id` | Atualiza um link existente. |
| `DELETE` | `/links/:id` | Exclui um link. |

### Stats & Export (Requer JWT)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/stats` | Retorna estatísticas de links por categoria e links recentes. |
| `GET` | `/export` | Exporta todos os dados em formato tabular. |

---

## ⚙️ Configuração e Variáveis de Ambiente

As configurações de ambiente podem ser ajustadas nos respectivos arquivos `compose.yaml`:

| Variável | Padrão | Arquivo | Descrição |
|----------|--------|---------|-----------|
| `API_URL` | `http://localhost:8000` | `aplicacoes/web/compose.yaml` | URL onde o Frontend busca a API. |
| `FRONTEND_URL` | `http://localhost:8080` | `aplicacoes/api/node/compose.yaml` | Origem permitida para CORS na API (Web). |
| `DB_*` | (ver `compose.yaml`) | `aplicacoes/api/node/compose.yaml` | Credenciais de conexão com o MySQL. |

---

## 📝 Notas Adicionais

- O projeto utiliza **TypeScript** no backend para maior segurança de tipos.
- O frontend é desenvolvido em **PHP puro** sem frameworks, demonstrando conhecimento fundamental de desenvolvimento web.
- A aplicação implementa **autenticação JWT** para segurança das rotas.
- O banco de dados **MySQL** é provisionado automaticamente via Docker com migrações e seeds.