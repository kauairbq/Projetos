# Guia de instalacao e execucao

## Requisitos

- Flutter SDK
- Android Studio (Android) ou Xcode (iOS)
- Conta Firebase com apps Android/iOS/Web configurados

## Configuracao Firebase

1. Coloque `google-services.json` em `android/app`.
2. Coloque `GoogleService-Info.plist` em `ios/Runner`.
3. Gere `firebase_options.dart` para Web (ja presente).
4. Publique `firestore.rules` no Firebase Console.

## Instalar dependencias

```bash
flutter pub get
```

## Executar

```bash
flutter run -d chrome
```

## Testes

```bash
flutter test
```

Para integracao:

```bash
flutter test integration_test
```
