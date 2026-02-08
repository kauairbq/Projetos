import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../modules/dashboard/dashboard_screen.dart';
import '../modules/auth/login_screen.dart';
import '../modules/auth/register_screen.dart';
import '../modules/admin/admin_home_screen.dart';
import '../modules/user/user_home_screen.dart';
import '../modules/packs/packs_screen.dart';
import '../modules/devices/devices_screen.dart';
import '../modules/support/support_screen.dart';
import '../modules/security/security_screen.dart';
import 'services/firestore_service.dart';

class AppRoutes {
  static const dashboard = '/';
  static const login = '/login';
  static const register = '/register';
  static const admin = '/admin';
  static const user = '/user';
  static const packs = '/packs';
  static const devices = '/devices';
  static const support = '/support';
  static const security = '/security';
}

Map<String, WidgetBuilder> buildRoutes() {
  return {
    AppRoutes.dashboard: (_) => const AuthGate(),
    AppRoutes.login: (_) => const LoginScreen(),
    AppRoutes.register: (_) => const RegisterScreen(),
    AppRoutes.admin: (_) => const AdminHomeScreen(),
    AppRoutes.user: (_) => const UserHomeScreen(),
    AppRoutes.packs: (_) => const PacksScreen(),
    AppRoutes.devices: (_) => const DevicesScreen(),
    AppRoutes.support: (_) => const SupportScreen(),
    AppRoutes.security: (_) => const SecurityScreen(),
  };
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final user = snapshot.data;
        if (user == null) {
          return const LoginScreen();
        }

        return StreamBuilder(
          stream: FirestoreService().watchUser(user.uid),
          builder: (context, profileSnapshot) {
            if (profileSnapshot.connectionState == ConnectionState.waiting) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }

            final profile = profileSnapshot.data;
            if (profile != null && profile.role == 'admin') {
              return const AdminHomeScreen();
            }

            return const DashboardScreen();
          },
        );
      },
    );
  }
}
