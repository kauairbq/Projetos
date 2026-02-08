import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../shared/widgets/app_scaffold.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/access_denied.dart';
import '../../core/routes.dart';
import '../../core/services/firestore_service.dart';
import '../../core/services/audit_service.dart';

class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return AppScaffold(
        title: 'Admin / Instalador',
        child: const AccessDenied(message: 'Precisa iniciar sessao.'),
      );
    }

    return StreamBuilder(
      stream: FirestoreService().watchUser(user.uid),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final profile = snapshot.data;
        if (profile == null || profile.role != 'admin') {
          return AppScaffold(
            title: 'Admin / Instalador',
            child: AccessDenied(
              onBack: () => Navigator.pop(context),
            ),
          );
        }

        return AppScaffold(
          title: 'Admin / Instalador',
          actions: [
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () async {
                try {
                  await AuditService().logEvent(action: 'logout');
                } catch (_) {}
                await FirebaseAuth.instance.signOut();
                if (context.mounted) {
                  Navigator.pushReplacementNamed(context, AppRoutes.login);
                }
              },
            )
          ],
          child: ListView(
            children: [
              Text('Gestao completa do ecossistema SmartConnect.', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 20),
              Text('Configuracoes principais', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Dispositivos',
                subtitle: 'Adicionar, editar e atribuir dispositivos.',
                icon: Icons.sensors,
                onTap: () => Navigator.pushNamed(context, AppRoutes.devices),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Packs',
                subtitle: 'Configurar packs modulares.',
                icon: Icons.grid_view,
                onTap: () => Navigator.pushNamed(context, AppRoutes.packs),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Suporte',
                subtitle: 'Gerir tickets e garantias.',
                icon: Icons.support_agent,
                onTap: () => Navigator.pushNamed(context, AppRoutes.support),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Seguranca',
                subtitle: 'Auditoria e MFA.',
                icon: Icons.security,
                onTap: () => Navigator.pushNamed(context, AppRoutes.security),
              ),
            ],
          ),
        );
      },
    );
  }
}
