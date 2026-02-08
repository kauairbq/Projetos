# Workflow Engine

Backend NestJS para gest?o de workflows, vers?es, inst?ncias, regras e auditoria.

## Stack
- NestJS + TypeScript
- Prisma + PostgreSQL
- BullMQ + Redis
- Swagger

## Setup r?pido
`
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run start:dev
`

## Endpoints base
- POST /workflows
- POST /workflows/:id/versions
- GET /workflows/:id
- POST /instances
- POST /instances/:id/transition
- GET /instances/:id/events

Swagger: http://localhost:4030/docs
