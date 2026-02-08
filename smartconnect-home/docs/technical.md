# Documentacao tecnica

## Visao geral

SmartConnect Home e uma app Flutter com Firebase para autenticacao e dados em tempo real.
Inclui perfis (admin e utilizador final), dispositivos, packs de automacao,
suporte/garantias e logs de auditoria.

## Stack

- Flutter (Android, iOS, Web)
- Firebase Authentication
- Cloud Firestore
- Firebase Messaging (base)

## Estrutura principal

- `lib/core`: app, rotas, tema, modelos e servicos
- `lib/modules`: ecras por dominio (auth, admin, user, devices, packs, support, security)
- `lib/shared`: widgets reutilizaveis

## Dados (Firestore)

- `users`: perfis e permissao
- `devices`: inventario e atribuicao
- `packs`: packs modulares
- `warranties`: garantias por dispositivo
- `tickets`: suporte
- `audit_logs`: auditoria de acoes

## Regras

As regras estão em `firestore.rules` e devem ser publicadas no Firebase Console.
