import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../shared/widgets/app_scaffold.dart';
import '../../shared/widgets/section_card.dart';
import '../../core/routes.dart';
import '../../core/services/firestore_service.dart';
import '../../core/services/audit_service.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return AppScaffold(
        title: 'SmartConnect Home',
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return StreamBuilder(
      stream: FirestoreService().watchUser(user.uid),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return AppScaffold(
            title: 'SmartConnect Home',
            child: const Center(child: CircularProgressIndicator()),
          );
        }

        final profile = snapshot.data;
        final name = profile?.name.isNotEmpty == true ? profile!.name : 'Utilizador';
        final isAdmin = profile?.role == 'admin';

        final primary = Theme.of(context).colorScheme.primary;

        return AppScaffold(
          title: 'SmartConnect Home',
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1B1E2D), Color(0xFF12131B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: const Color(0xFF2D3042)),
                  boxShadow: [
                    BoxShadow(
                      color: primary.withOpacity(0.18),
                      blurRadius: 26,
                      offset: const Offset(0, 14),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Olá, $name', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 6),
                    Text('Tudo o que precisa para controlar a casa.', style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: const [
                        _StatusPill(label: 'Segurança total', icon: Icons.shield_outlined),
                        _StatusPill(label: 'Automação inteligente', icon: Icons.auto_awesome),
                        _StatusPill(label: 'Suporte dedicado', icon: Icons.support_agent),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              if (isAdmin) ...[
                Text('Área administrativa', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: const Color(0xFF141627),
                    border: Border.all(color: const Color(0xFF2C2E3E)),
                  ),
                  child: SectionCard(
                    title: 'Admin / Instalador',
                    subtitle: 'Configurar dispositivos e permissões.',
                    icon: Icons.admin_panel_settings,
                    onTap: () => Navigator.pushNamed(context, AppRoutes.admin),
                  ),
                ),
                const SizedBox(height: 24),
              ],
              Text('Ações rápidas', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Utilizador final',
                subtitle: 'Controlar dispositivos autorizados.',
                icon: Icons.person,
                onTap: () => Navigator.pushNamed(context, AppRoutes.user),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Packs de automacao',
                subtitle: 'Segurança, conforto e eficiência.',
                icon: Icons.grid_view,
                onTap: () => Navigator.pushNamed(context, AppRoutes.packs),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Dispositivos',
                subtitle: 'Inventário e estado em tempo real.',
                icon: Icons.sensors,
                onTap: () => Navigator.pushNamed(context, AppRoutes.devices),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Suporte e garantia',
                subtitle: 'Abrir tickets e acompanhar garantias.',
                icon: Icons.support_agent,
                onTap: () => Navigator.pushNamed(context, AppRoutes.support),
              ),
              const SizedBox(height: 12),
              SectionCard(
                title: 'Seguranca e auditoria',
                subtitle: 'MFA, logs e proteção da conta.',
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

class _StatusPill extends StatelessWidget {
  final String label;
  final IconData icon;

  const _StatusPill({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF171A28),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFF2C2E3E)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 6),
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
