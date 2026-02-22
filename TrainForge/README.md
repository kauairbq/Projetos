# TrainForge - Plataforma de Gestao de Performance Fitness

SaaS multi-tenant para personal trainers e ginasios com operacao de performance, desafios semanais, ranking global, billing e suporte.

## Arquitetura (upgrade definitivo)

- Multi-tenant real por `tenants` (`PERSONAL` / `GYM`)
- Usuarios autenticados em `tenant_users` com RBAC:
  - `MASTER_ADMIN`
  - `GYM_STAFF`
  - `PERSONAL`
- White-label por slug:
  - branding por tenant
  - landing dinamica por tenant
- Billing:
  - planos
  - subscricoes
  - invoices
  - payments
  - bloqueio de acesso por inadimplencia (`access_blocks`)
- Suporte com historico:
  - ticket
  - mensagens
  - eventos
- Gamificacao:
  - desafio semanal
  - participacao
  - log diario
  - leaderboard
  - achievements
- Frequencia:
  - alunos
  - memberships
  - attendance

## Estrutura de pastas

```text
TrainForge/
  backend/
    controllers/
    routes/
    models/
    middlewares/
    utils/
    db/
      schema.sql
      seed.sql
    app.js
    server.js
    package.json

  database/
    schema.sql
    seed.sql
    migrations/
      20260218_000001_trainforge_multitenant.sql

  frontend/
    src/
    public/
    package.json

  landings/
    personal-template/
    gym-template/
    saas-sales/

  tests/
  TODO.md
  README.md
```

## Stack

### Front-end

- React + Vite
- React Router DOM
- Axios
- Bootstrap + Tailwind utilities
- Recharts
- Formik + Yup

### Back-end

- Node.js + Express
- MySQL (WAMP)
- JWT (access token curto + refresh rotativo)
- RBAC + middlewares de autorizacao
- Rate limit + helmet + CORS

## Setup local

> Caminho: `C:\wamp64\www\Fullstack MD\projects\TrainForge`

### 1) Base de dados

Executar na ordem:

1. `database/schema.sql`
2. `database/seed.sql`

### 2) Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

API: `http://localhost:8085/api/v1`

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Opcional no `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8085/api/v1
```

## Credenciais demo

Senha demo para contas seeded: `password`

- `kauai@trainforge.local` (MASTER_ADMIN -> `admin` no app)
- `admin@trainforge.local` (GYM_STAFF -> `trainer` no app)
- `ricardo@ironvalley.pt` (GYM_STAFF -> `trainer` no app)
- `yasmin@performance.pt` (PERSONAL -> `trainer` no app)

## Endpoints principais

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/logout-all`

### Tenant / Master

- `GET /tenants` (master)
- `POST /tenants` (master)
- `GET /admin/tenants-kpis` (master)

### Branding / Landing (white-label)

- `GET /branding/:slug`
- `POST /branding` (auth)
- `GET /landing/:slug`

### Dashboard admin

- `GET /admin/overview`
- `GET /admin/rankings`
- `GET /admin/billing/overview` (master)
- `POST /admin/billing/run-cycle` (master)
- `POST /admin/billing/invoices/:invoiceId/confirm-payment` (master)

### Suporte

- `GET /support/tickets`
- `POST /support/tickets`
- `GET /support/tickets/:id/timeline`
- `POST /support/tickets/:id/messages`
- `PATCH /support/tickets/:id/status`

### Desafios / Ranking

- `GET /challenges`
- `POST /challenges`
- `PATCH /challenges/:id/toggle`
- `GET /challenges/:id/ranking?top=3`
- `POST /challenges/:id/complete`

### Workouts / Metrics

- `GET /workouts/leaderboard`
- `GET /workouts/metrics`
- `GET /workouts/history`
- `POST /workouts`

### Servicos / Orcamentos

- `GET /services/catalog`
- `POST /services/catalog`
- `PATCH /services/catalog/:id/toggle`
- `POST /services/requests`
- `GET /services/requests`
- `PATCH /services/requests/:id/status`
- `POST /services/quotes`
- `GET /services/quotes`

### Area do utilizador

- `GET /users/me`
- `PATCH /users/me`
- `GET /users/me/history`
- `GET /users/me/support`
- `POST /users/me/support`
- `GET /users?role=client`

### Feedback

- `POST /feedback`
- `GET /feedback`

## Admin oculto (redirect)

- `/personal/:slug/adm` -> redirect para `SAAS_ADMIN_LOGIN_URL` ou `/saas/adm`
- `/gym/:slug/adm` -> redirect para `SAAS_ADMIN_LOGIN_URL` ou `/saas/adm`
- `/saas/adm` -> endpoint informativo de login

## Testes

```bash
cd backend
npm test
```

## Notas

- O legado PHP continua em `backend/legacy-php/` apenas como referencia.
- A implementacao ativa e Node/Express com schema multi-tenant.
- Regras de bloqueio por inadimplencia sao aplicadas no ciclo de billing (`run-cycle`).
