# Portefolio de Projetos ? Full-Stack & Backend

Colecao de projetos Full-Stack, APIs e back-ends avancados, alem de front-ends profissionais.
Inclui IAM multi-tenant, Workflow Engine, SaaS, dashboards, e-commerce e aplicacoes web.

---

## Visao Geral

Este diretorio reune projetos reais e prototipos avancados criados para demonstrar competencias em:

- Arquitetura backend (multi-tenant, RBAC, auditoria, state machines)
- APIs REST bem estruturadas
- Front-end responsivo e profissional
- Integracoes com bases de dados SQL/NoSQL
- Boas praticas de documentacao, testes e UX

---

## Destaques Tecnicos

- NestJS + Prisma + PostgreSQL
- JWT + RBAC + Multi-tenant
- BullMQ + Redis
- React + TypeScript
- UI/UX profissional e responsivo

---

## Projetos Principais

### 1) IAM ? Identity & Access Management
Backend multi-tenant com autenticacao, RBAC e auditoria.
- Login/refresh/logout
- Gestao de tenants e utilizadores
- Roles + permissions
- Audit logs

Stack: NestJS, Prisma, PostgreSQL, JWT, Argon2id
Docs: /docs (Swagger)

---

### 2) Workflow Engine / Rule Engine
Engine de workflows com versionamento, state machine e regras dinamicas.
- Workflows versionados
- Instancias com historico imutavel
- Regras e transicoes validadas
- Audit trail e jobs assincronos

Stack: NestJS, Prisma, PostgreSQL, BullMQ, Redis

---

### 3) SaaS Billing (multi-tenant)
Simula um SaaS completo com:
- organizacoes e utilizadores
- planos e feature flags
- estados de assinatura
- auditoria e metricas

Stack: NestJS, Prisma, PostgreSQL

---

### 4) Gestao de Projetos (React + TS)
Aplicacao web funcional com:
- CRUD de projetos e tarefas
- status e progresso
- validacoes e feedback visual

Stack: React, TypeScript, CSS moderno

---

### 5) Dashboard Dados Reais
Dashboard consumindo API publica (CoinGecko).
- metricas em tempo real
- graficos e UI responsiva

Stack: React, TypeScript, Vite

---

## Outros Projetos (Front/Full-Stack)

- E-commerce frontend (React)
- CRM LookCar
- SmartConnect Home
- Xkairos Tech (site + area cliente)
- Landing pages profissionais
- Sites institucionais e portefolio

---

## Estrutura Padrao (para novos projetos)

`
project/
?? src/
?? prisma/
?? docker-compose.yml
?? README.md
?? ENGINEERING.md
`

---

## Contacto

Kauai Rocha
kauai_lucas@hotmail.com
Viseu, Portugal
GitHub: https://github.com/kauairbq
