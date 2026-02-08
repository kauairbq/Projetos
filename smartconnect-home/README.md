# SmartConnect Home

Plataforma de automacao residencial modular com controlo centralizado, packs de automacao e suporte integrado.

## Objetivo

Unificar dispositivos e protocolos (Zigbee, Bluetooth, Wi-Fi, Matter) num ambiente seguro, com perfis distintos para administrador/instalador e utilizador final, incluindo suporte tecnico e monitoramento de garantias.

## Estrutura

```
smartconnect-home/
  docs/
    proposta.md
    estado-da-arte.md
    solucao.md
    metodologia.md
    plano-implementacao.md
    avaliacao-testes.md
    resultados-impacto.md
    recursos.md
    referencias.md
  src/
  TODO.md
```

## Como usar

### Requisitos

- Flutter SDK instalado
- Android Studio (Android)
- Xcode (iOS, apenas macOS)
- Conta Firebase configurada (Android, iOS e Web)

### Configurar o Firebase

1. Copiar `google-services.json` para `src/smartconnect_home/android/app/`.
2. Copiar `GoogleService-Info.plist` para `src/smartconnect_home/ios/Runner/`.
3. Confirmar `src/smartconnect_home/lib/firebase_options.dart` (Web).
4. Publicar as regras em `firestore.rules` no Firebase Console.

### Instalar dependencias

```bash
cd src/smartconnect_home
flutter pub get
```

### Executar no PC (Web/Chrome)

```bash
flutter run -d chrome
```

### Executar em Android (emulador ou device)

1. Abrir um emulador no Android Studio (ou ligar o telemovel por USB).
2. Confirmar que o dispositivo aparece:

```bash
flutter devices
```

3. Executar:

```bash
flutter run
```

### Executar em iOS (apenas macOS)

```bash
flutter run -d ios
```

### Testes

```bash
flutter test
flutter test integration_test
```

### Documentacao

- Ler os documentos em `docs/`.
- Seguir o roadmap em `TODO.md`.
