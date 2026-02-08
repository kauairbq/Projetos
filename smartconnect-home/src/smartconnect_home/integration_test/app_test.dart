import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:smartconnect_home/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('App inicia e mostra tela principal', (tester) async {
    app.main();
    await tester.pumpAndSettle(const Duration(seconds: 5));

    final hasSmartConnect = find.textContaining('SmartConnect');
    expect(hasSmartConnect, findsWidgets);
  });
}
