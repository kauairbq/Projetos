📘 TrainForge — TODO Geral de Desenvolvimento & Upgrade SaaS
✅ STATUS ATUAL DO PROJETO

🧱 FASE 1 — Setup
- [x] Estrutura base do projeto criada no WAMP
- [x] Frontend React (Vite) configurado
- [x] Backend Node.js + Express configurado
- [x] Pasta `backend/legacy-php` preservada para referência
- [x] `.gitignore` configurado

🗄 FASE 2 — Base de Dados
- [x] `schema.sql` atualizado para modelo SaaS Fitness
- [x] `seed.sql` com utilizadores, desafios, serviços e dados demo
- [x] Ligação MySQL via `backend/utils/db.js`
- [x] Scripts SQL executados localmente no WAMP

🔐 FASE 3 — Backend API
- [x] Auth com JWT + refresh token rotativo
- [x] RBAC (admin / trainer / client)
- [x] Endpoints de desafios e ranking
- [x] Endpoints de serviços, solicitações e orçamentos
- [x] Endpoints de histórico e suporte
- [x] Endpoint de feedback com email (Nodemailer)
- [x] Rate limit global e auth
- [x] Smoke test automatizado

🖥 FASE 4 — Frontend Atual
- [x] Login e área autenticada
- [x] Dashboard com métricas e ranking
- [x] Desafio semanal com top 3
- [x] Gestão de serviços
- [x] Área do cliente (dados pessoais + pagamento)
- [x] Suporte e histórico
- [x] Painel admin
- [x] Responsividade base
- [x] Refinar UX visual premium

🧪 FASE 5 — Qualidade
- [x] Testes backend (`npm test`)
- [x] Testes de integração completos
- [x] Testes frontend automatizados
- [x] Pipeline CI (lint + test + build)
- [x] README completo
- [x] Deploy final produção + smoke test

🚀 NOVA FASE — REFATORAÇÃO FRONT-END SaaS PREMIUM
🎯 Objetivo: Transformar TrainForge em produto SaaS comercial nível enterprise.

🧱 FASE 6 — Arquitetura Visual Profissional
Layout Base
- [x] Criar layout padrão SaaS com sidebar
- [x] Header fixo
- [x] Área principal scrollável

Sidebar
- [x] Logo TrainForge
- [x] Dashboard
- [x] Clientes
- [x] Pagamentos
- [x] Desafios
- [x] Ranking
- [x] Tickets
- [x] Configurações
- [x] Logout na sidebar

Header
- [x] Nome usuário
- [x] Avatar
- [x] Notificações
- [x] Status da assinatura
- [x] Dropdown perfil

🎨 FASE 7 — Design System
Design Tokens
- [x] Definir cores (Primary / Secondary / base visual)
- [x] Definir Background 1 / Background 2
- [x] Definir Border subtle
- [x] Definir escala tipográfica
- [x] Definir escala de espaçamento (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64)

Componentização
- [x] Criar componente `<Card>` padrão (classe `.tf-card`)
- [x] Criar componente `<Button>` padrão
- [x] Criar `<Badge>` status
- [x] Criar `<Table>` padrão admin

📊 FASE 8 — Dashboard Comercial Real
KPIs
- [x] Receita Mensal
- [x] Clientes Ativos
- [x] Pagamentos Pendentes
- [x] Crescimento %

Cada KPI deve conter:
- [x] Ícone
- [x] Número grande
- [x] Comparativo mensal
- [x] Indicador verde/vermelho

Gráfico Principal
- [x] Implementar Recharts ou Chart.js
- [x] Receita mensal
- [x] Crescimento
- [x] Comparativo período anterior

Atividade Recente
- [x] Novo personal
- [x] Pagamento confirmado
- [x] Ticket aberto
- [x] Novo ginásio

💰 FASE 9 — Monetização Visual
Página Clientes
- [x] Tabela (Cliente / Tipo / Plano / Status / Receita / Ação)
- [x] Filtros (Ativo / Suspenso / Trial / Inadimplente)

Receita
- [x] Receita mensal total
- [x] Receita por tipo
- [x] Receita acumulada

🎯 FASE 10 — UX Comercial
- [x] Criar empty states profissionais
- [x] Criar CTAs elegantes
- [x] Loading skeletons
- [x] Toast notifications
- [x] Microinterações
- [x] Hover states refinados

🛡 FASE 11 — Percepção Premium
- [x] Sistema de elevação (sombras leves)
- [x] Bordas suaves
- [x] Glass effect leve (opcional)
- [x] Fundo com gradiente sutil
- [x] Noise texture leve

📱 FASE 12 — Responsividade Real
- [x] Sidebar colapsável
- [x] KPI empilhados no mobile
- [x] Menu hambúrguer
- [x] Gráfico adaptável

🧠 FASE 13 — Branding
- [x] Aplicar logo final azul + dourado
- [x] Aplicar slogan: "Forjando performance e resultados"
- [x] Badge "SaaS Platform"
- [x] Favicon profissional configurado

🔥 FASE 14 — Produto Real
Onboarding
- [x] Página onboarding inicial
- [x] Checklist de setup
- [x] Tutorial guiado

Assinatura
- [x] Página plano atual
- [x] Próxima cobrança
- [x] Status
- [x] Upgrade

🧬 FASE 15 — Auditoria Final
- [x] Verificar contraste
- [x] Hierarquia visual
- [x] Consistência spacing
- [x] Performance Lighthouse
- [x] UX geral

🎯 RESULTADO ESPERADO
- [ ] Produto SaaS comercial real
- [ ] Plataforma escalável
- [ ] UX nível mercado
- [ ] Percepção premium
- [ ] Pronto para venda
