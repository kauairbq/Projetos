import 'package:flutter/material.dart';
import 'routes.dart';
import 'theme.dart';

class SmartConnectApp extends StatelessWidget {
  const SmartConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartConnect Home',
      theme: buildTheme(),
      initialRoute: AppRoutes.dashboard,
      routes: buildRoutes(),
    );
  }
}
