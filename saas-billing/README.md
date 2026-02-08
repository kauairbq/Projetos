# SaaS Billing – Plataforma de Subscrições (Multi‑tenant)

Projeto fullstack para gestão de subscrições SaaS, com multi‑tenant real, ciclos de cobrança simulados, RBAC, auditoria e métricas.

## Stack
- **Backend**: NestJS + TypeScript + Prisma
- **DB**: PostgreSQL
- **Auth**: JWT + Refresh Tokens
- **Validação**: class‑validator / class‑transformer

## Funcionalidades (Checklist Senior‑ready)
- **Multi‑tenant**: Organizations + OrganizationUsers (roles: owner/admin/member)
- **Lifecycle de subscrição**: trialing → active → past_due → suspended → canceled
- **Planos + Feature Flags**: limites (maxUsers) e flags (canExport, advancedReports)
- **Billing simulado**: subscriptions, invoices, payments e webhook mock
- **RBAC**: guards e decorators por organização
- **Auditoria**: audit_logs com ações críticas
- **Observabilidade**: endpoint /metrics (MRR, churn, ativos)
- **Testes**: unit tests de transições e limites

## Estrutura
```
apps/
  api/            # NestJS + Prisma
  web/            # Frontend (Vite)
infra/
  db/             # Docker opcional
```

## Variáveis de ambiente
`apps/api/.env`
```
DATABASE_URL=postgresql://saas_user:03101812%40@localhost:5432/saas_billing?schema=public
PORT=4010
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
```

## Setup rápido (Windows)
### 1) Base de dados (PostgreSQL)
Serviço `postgresql-x64-16` em execução.

Credenciais padrão:
- User: `saas_user`
- Password: `03101812@`
- DB: `saas_billing`
- Port: `5432`

### 2) Backend (NestJS)
```bash
cd apps/api
npm install
npx prisma db push
npm run start:dev
```
API: `http://localhost:4010/api`
Health: `http://localhost:4010/health`

### 3) Frontend (Vite)
```bash
cd apps/web
npm install
npm run dev
```
Frontend: `http://localhost:5175`

## Convenções de Tenant
Todos os endpoints multi‑tenant exigem o cabeçalho:
```
x-organization-id: <orgId>
```

## Endpoints principais
- `POST /api/organizations`
- `GET /api/organizations/:id`
- `POST /api/organizations/:orgId/users`
- `GET /api/subscriptions`
- `PATCH /api/subscriptions/:id`
- `POST /api/invoices`
- `POST /api/payments`
- `POST /api/webhooks/billing` (mock)
- `GET /api/audit-logs`
- `GET /api/metrics`
- `GET /api/reports/advanced` (**advancedReports**)
- `GET /api/reports/export` (**canExport**)

## Testes
```bash
cd apps/api
npm test
```

## Notas de arquitetura
- **Multi‑tenant** por organização, com isolamento lógico.
- **RBAC** aplicado via decorators + guards.
- **Plano** controla limites e funcionalidades.
- **Auditoria** registra ações críticas (ex.: alteração de subscrição, convites).

## Estado
MVP funcional com camadas de billing e governança prontas para evoluir.
