import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../shared/widgets/app_scaffold.dart';
import '../../shared/widgets/section_card.dart';
import '../../core/routes.dart';
import '../../core/services/firestore_service.dart';
import '../../core/services/audit_service.dart';

class UserHomeScreen extends StatelessWidget {
  const UserHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return AppScaffold(
        title: 'Utilizador final',
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return StreamBuilder(
      stream: FirestoreService().watchUser(user.uid),
      builder: (context, snapshot) {
        final profile = snapshot.data;
        final name = profile?.name.isNotEmpty == true ? profile!.name : 'Utilizador';

        return AppScaffold(
          title: 'Utilizador final',
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
              Text('Ola, $name', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 6),
              Text('Aqui tens acesso apenas ao que foi autorizado.', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 20),
              SectionCard(
                title: 'Dispositivos ativos',
                subtitle: 'Controlar equipamentos autorizados.',
                icon: Icons.devices_other,
                onTap: () => Navigator.pushNamed(context, AppRoutes.devices),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Packs disponiveis',
                subtitle: 'Automacoes prontas para usar.',
                icon: Icons.grid_view,
                onTap: () => Navigator.pushNamed(context, AppRoutes.packs),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Suporte',
                subtitle: 'Solicitar assistencia tecnica.',
                icon: Icons.support_agent,
                onTap: () => Navigator.pushNamed(context, AppRoutes.support),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Seguranca da conta',
                subtitle: 'Ativar MFA e rever acessos.',
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
