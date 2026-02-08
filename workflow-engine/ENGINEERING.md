# Project Engineering Checklist ? Workflow Engine

1) Identificacao
- Nome: Workflow Engine
- Repo: workflow-engine
- Tipo: Backend
- Status: Em desenvolvimento
- Nivel alvo: Senior

2) Objetivo
- Automatizar fluxos de negocio com state machine e regras.

3) Arquitetura
- Monolito modular (NestJS).

4) Stack
- NestJS + Prisma + PostgreSQL + BullMQ + Redis.

5) Core
- Workflows, vers?es, instancias, transi??es, regras, auditoria.

6) Auth
- N/A (backend core; pode acoplar IAM).

7) Seguranca
- Validacao de entrada, logs, rate-limit.

8) Observabilidade
- Logs estruturados, health check (a criar).

9) Qualidade
- Modulos separados, naming consistente.

10) Testes
- Unit: rule evaluator; Integration: transitions.

11) Infra
- Docker compose (db + redis).

12) Documentacao
- README + Swagger.

13) DX
- Scripts prisma e start.

14) Avaliacao
- Forte: modelagem, versionamento, audit.
- Falta: auth + testes completos.
