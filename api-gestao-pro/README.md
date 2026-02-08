# API Gest?o Pro

API REST para gest?o de projetos e tarefas com autentica??o JWT e controlo de permiss?es (RBAC).

## Stack
- Node.js + Express
- PostgreSQL
- JWT + bcrypt
- Swagger (OpenAPI)
- Jest + Supertest

## Como executar
1. Criar a base de dados e tabelas:
   - `psql -U postgres -f src/db/schema.sql`
   - `psql -U postgres -f src/db/seed.sql`
2. Copiar `.env.example` para `.env` e ajustar valores.
3. Instalar depend?ncias: `npm install`
4. Iniciar: `npm run dev`

## Endpoints principais
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/tasks`
- `POST /api/projects/:id/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`

Swagger: `http://localhost:4002/docs`
