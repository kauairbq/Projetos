# TODO - SmartConnect Home

Este documento organiza o desenvolvimento do app SmartConnect Home em fases. Vamos seguir passo a passo ate a conclusao.

## Fase 0 - Preparacao

- [x] Confirmar ferramentas instaladas (Flutter, Dart, Android SDK, Xcode no macOS)
- [x] Criar contas e projetos Firebase (Android + iOS)
- [x] Definir identificadores (package name / bundle id)
- [x] Definir repositorio Git e estrategia de branches
- [x] Aceitar licencas Android SDK
- [x] Rodar flutter doctor
- [x] Rodar app no Chrome (debug)
  - [x] Baixar `google-services.json` (Android) e `GoogleService-Info.plist` (iOS)
  - [x] Inserir arquivos em `android/app` e `ios/Runner`
  - [x] Registrar app Web no Firebase

## Fase 1 - Fundacao do App (Base)

- [x] Criar projeto Flutter (Android + iOS)
- [x] Estruturar pastas (core, modules, shared, services)
- [x] Definir tema corporativo e design system
- [x] Harmonizar paleta e UI/UX (login + app)
- [x] Configurar navegacao (Router)
- [x] Criar modelos base (Utuario, Dispositivo, Pack, Garantia, Ticket)
- [x] Definir regras de acesso (Admin vs Utilizador)

## Fase 2 - Autenticacao e Perfis

- [x] Firebase Authentication (email/senha)
- [x] Fluxo de onboarding e login
- [x] Perfis: admin/instalador e utilizador final
- [x] Controle de permissao por perfil
  - [x] Inicializar Firebase no app (firebase_core)

## Fase 3 - Gestao de Dispositivos

- [x] CRUD de dispositivos (admin)
- [x] Atribuicao de dispositivos por utilizador
- [x] Status de dispositivo (online/offline)
- [x] Filtros por protocolo (Zigbee, Wi-Fi, Bluetooth)

## Fase 4 - Packs de Automacao

- [x] Catalogo de packs (Seguranca, Conforto, Eficiencia, Externa)
- [x] Criacao e atribuicao de packs
- [x] Configuracoes basicas por pack

## Fase 5 - Suporte e Garantia

- [x] Registo de garantias por dispositivo
- [x] Estado da garantia (ativa, expirada)
- [x] Abertura de ticket de suporte
- [x] Notificacoes de garantia e suporte (base FCM)

## Fase 6 - Seguranca

- [x] Regras de seguranca Firestore (arquivo local)
- [x] MFA (quando aplicavel)
- [x] Logs de acesso e auditoria basica
  - [x] Regras publicadas no Firebase Console

## Fase 7 - Testes

- [x] Testes unitarios (modelos e servicos)
- [x] Testes de integracao (fluxos principais)
- [x] Testes de UI (telas principais)
- [x] Checklist de desempenho

## Fase 8 - Preparacao para Entrega

- [x] Documentacao tecnica
- [x] Guia de instalacao e execucao
- [x] Checklist final de avaliacao
