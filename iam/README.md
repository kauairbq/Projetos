# IAM API

## Stack
- NestJS + TypeScript
- Prisma + PostgreSQL
- JWT (RS256) + Argon2id
- Swagger (docs em /docs)
- Jest

## Endpoints minimos
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all

POST /tenants
POST /tenants/:id/invite
POST /tenants/invite/accept
GET  /tenants/:id/users
PATCH /tenants/:id/users/:userId/role

GET  /roles
POST /roles
GET  /permissions
GET  /audit-logs

## Setup rapido
1. Gerar chaves RSA:
   - `openssl genrsa -out keys/jwt_access_private.pem 2048`
   - `openssl rsa -in keys/jwt_access_private.pem -pubout -out keys/jwt_access_public.pem`
2. Copiar env:
   - `cp .env.example .env`
3. Subir DB:
   - `docker compose up -d`
4. Migrate:
   - `npx prisma migrate dev`
5. Start:
   - `npm run start:dev`

## Notas
- Enviar `tenantId` no body do login
- Enviar `x-tenant-id` nas rotas protegidas
