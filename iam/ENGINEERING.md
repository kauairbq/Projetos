# IAM (Identity & Access Management)

## 1) Identificacao do Projeto
- Nome do projeto: IAM
- Nome do repositorio: (sem repositorio dedicado)
- Descricao: Servico IAM multi-tenant com RBAC, refresh token rotativo e auditoria.
- Tipo: Backend
- Status: Em desenvolvimento
- Nivel alvo: Senior

## 2) Objetivo & Contexto de Negocio
- Problema que resolve: Identidade, acessos e seguranca centralizados.
- Publico-alvo: Produtos B2B e SaaS.
- Caso de uso principal: Login multi-tenant com RBAC e auditoria.
- Por que esse projeto existe: Provar dominio de seguranca corporativa.
- Valor entregue: Reduz risco e aumenta governanca.

## 3) Arquitetura Geral
- Estilo: Monolito modular (NestJS)
- Diagrama (alto nivel): (inserir diagrama simples)
- Separacao de responsabilidades: auth, tenants, roles, permissions, sessions, audit.
- Fluxo principal de dados: login -> token -> acesso -> auditoria.

## 4) Stack Tecnica
### Backend
- Linguagem: TypeScript
- Framework: NestJS
- ORM / Query: Prisma
- Validacao: class-validator
- Auth / Security: JWT RS256 + Argon2id

### Frontend
- Framework: N/A
- State management: N/A
- UI library / design system: N/A
- Responsividade / A11y: N/A

### Base de Dados
- Tipo: SQL
- Engine: PostgreSQL
- Migracoes: Prisma Migrate
- Versionamento: Git

## 5) Funcionalidades Core
- CRUD principal: tenants, users, roles, permissions
- Regras de negocio: multi-tenant + RBAC
- Estados / lifecycle: sessions + refresh
- Permissoes / papeis: owner/admin/member
- Casos de erro tratados: auth, roles, acesso negado

## 6) Autenticacao & Autorizacao
- Login / Logout: sim
- Tokens / Sessions: access + refresh rotativo
- RBAC / ACL: sim
- Multi-tenant: sim
- Rate limit / protecao: sim

## 7) Seguranca
- Hash de passwords: Argon2id
- Protecao contra brute-force: rate limit
- Input validation: sim
- CORS configurado: sim
- Secrets fora do codigo: env
- Auditoria de acoes: sim

## 8) Observabilidade
- Logs estruturados: sim
- Tratamento de erros: sim
- Health check: sim
- Metricas basicas: sim
- Alertas: mock

## 9) Performance & Qualidade
- Queries otimizadas: sim
- Indexes relevantes: sim
- Cache: redis
- Codigo modular: sim
- Naming consistente: sim

## 10) Testes
- Unit tests: auth service
- Integration tests: login + refresh
- Regras criticas: RBAC
- Seed de dados: sim

## 11) Infraestrutura & Deploy
- Docker: sim
- Docker Compose: sim
- Variaveis de ambiente: sim
- CI: GitHub Actions
- Estrategia de deploy: container

## 12) Documentacao
- README claro: sim
- Setup: sim
- Diagramas: a adicionar
- Exemplos de uso: sim
- Decisoes tecnicas: sim

## 13) UX / DX
- Mensagens de erro claras: sim
- Consistencia de API: sim
- Versionamento de endpoints: v1
- Scripts uteis: seed/reset

## 14) Avaliacao Final
- O que esta forte: multi-tenant + RBAC + auditoria
- O que esta fraco: falta frontend
- O que cortar: nada
- O que evoluir: test coverage
- Pronto para portefolio: Nao (ate completar)
