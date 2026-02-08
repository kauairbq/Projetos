# TODO CRM LookCar (completo)

## Setup do Projeto
- [x] Criar repositório "crm-lookcar".
- [x] Criar projeto Vue 3 + Vite.
- [x] Instalar dependências (Pinia, Vue Router, Axios, TailwindCSS).
- [x] Definir tema de cores: Primary #C8102E; Secondary #222222; Text-light #FFFFFF; Background-light #F8F8F8.

## Estrutura de Navegação
- [x] Sidebar com: Dashboard, Clientes/Leads, Negócios, Agenda, Importar Dados, Configurações.

## Modelos de Dados (Frontend + Backend)
- [x] Cliente/Lead: id, nome, telefone, email, região, origem_id, estado_funil, financiamento, tem_retoma, valor_retoma, modo_pagamento, datas, observações.
- [x] Origens: id, nome, ativo.
- [x] Regiões: id, nome.
- [x] Negócios: id, cliente_id, valor_negocio_previsto, modo_pagamento, retoma, estado, datas.
- [x] Agenda/Eventos: id, cliente_id, titulo, descricao, data_hora_inicio/fim, tipo, origem_agenda, criado_por.

## Páginas Principais
- [x] Dashboard: cards e gráficos (origem, região, pagamento).
- [x] Clientes/Leads: tabela com filtros e ações.
- [x] Ficha do Cliente: dados + histórico + eventos + negócios + upload docs.
- [x] Negócios: listagem + pipeline (Kanban).
- [x] Agenda: calendário com filtros (agenda1..4, CRM) e criação de evento.
- [x] Importar Dados: download template, upload .xlsx/.csv, mapeamento, preview, criação automática.

## Backend (Express + PostgreSQL)
- [x] API REST base: /clientes, /origens, /regioes, /negocios, /agenda, /importar.
- [x] Middleware de validação.
- [x] JWT opcional.
- [x] Serviços isolados.
- [x] Seeds: regiões + origens.

## UI / UX - Guidelines
- [x] Simples, sem fricção; vermelho como destaque.
- [x] Layout clean, fundo claro, cantos suaves.
- [x] Ícones consistentes.
- [x] Máximo 3 cliques por fluxo.

## Roadmap de Implementação
- [x] Fase 1 - MVP.
- [x] Fase 2 - Ajustes para venda.
- [x] Fase 3 - Intermediária.

## Checklist Final Antes de Entregar
- [x] Fluxo lead → cliente → negócio → agenda testado.
- [x] Importação sem duplicar dados.
- [x] Visual consistente com LookCar.
- [x] Dashboard com 4 gráficos mínimos.
- [x] Agenda com filtros e criação rápida.
- [x] Responsividade válida em desktop/tablet.
