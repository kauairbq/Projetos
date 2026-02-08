# CRM LookCar

CRM em duas partes: frontend (Vue 3 + Vite + Pinia + Router + Tailwind) e backend (Express + PostgreSQL). Estrutura planejada para importar leads, gerir clientes/negócios/agenda e dashboards simples.

## Requisitos
- Node 18+ (npm)
- PostgreSQL 14+ (com extensão `pgcrypto` para `gen_random_uuid`)

## Estrutura
- `client/` - Vite + Vue 3, Pinia, Router, Tailwind
- `server/` - Express, JWT opcional, rotas REST
- `database/` - `schema.sql` e `seeds.sql`
- `docs/` - `todo.md` (checklist/roadmap)

## Setup rápido
1) Frontend
```bash
cd client
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm install
npm run dev
```
A app roda em `http://localhost:5173`.

2) Backend
```bash
cd server
npm install
cp .env.example .env   # ajuste DATABASE_URL e JWT_SECRET
npm run dev             # nodemon
```
API em `http://localhost:4000` (health: `/health`).

3) Banco de dados
- Crie o database e rode os scripts:
```bash
psql -d lookcar -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
psql -d lookcar -f database/schema.sql
psql -d lookcar -f database/seeds.sql
```

## Rotas previstas
- `GET/POST/PUT/DELETE /clientes`
- `GET /origens`
- `GET /regioes`
- `GET/POST /negocios`
- `GET/POST /agenda`
- `POST /importar`
- `GET /health`

## Middleware
- Validação básica de payload (`src/middleware/validate.js`)
- Auth Bearer opcional/obrigatório via JWT (`src/middleware/auth.js`)

## Próximos passos sugeridos
- Conectar frontend às rotas reais (axios) e tratar loading/erros.
- Adicionar logs estruturados e tratamento de erros consistente.
- Criar docker-compose (app + db) e testes (unit/integration).
