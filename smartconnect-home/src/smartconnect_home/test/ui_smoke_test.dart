import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smartconnect_home/core/theme.dart';
import 'package:smartconnect_home/shared/widgets/section_card.dart';
import 'package:smartconnect_home/modules/auth/auth_layout.dart';

void main() {
  testWidgets('AuthLayout renders header and CTA', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildTheme(),
        home: AuthLayout(
          header: 'Login',
          title: 'Entrar',
          subtitle: 'Teste',
          sideTitle: 'Bem-vindo',
          sideBody: 'Mensagem',
          form: const SizedBox.shrink(),
          primaryLabel: 'Entrar',
          onPrimary: () {},
          footerText: 'Nao tem conta?',
          footerAction: 'Criar',
          onFooterTap: () {},
        ),
      ),
    );

    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Entrar'), findsWidgets);
  });

  testWidgets('SectionCard renders title and subtitle', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildTheme(),
        home: SectionCard(
          title: 'Dispositivos',
          subtitle: 'Inventario',
          icon: Icons.devices,
          onTap: () {},
        ),
      ),
    );

    expect(find.text('Dispositivos'), findsOneWidget);
    expect(find.text('Inventario'), findsOneWidget);
  });
}
