import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../shared/widgets/app_scaffold.dart';
import '../../core/services/firestore_service.dart';
import '../../core/services/audit_service.dart';

class SecurityScreen extends StatelessWidget {
  const SecurityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return AppScaffold(
        title: 'Seguranca e auditoria',
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return StreamBuilder(
      stream: FirestoreService().watchUser(user.uid),
      builder: (context, snapshot) {
        final profile = snapshot.data;
        final isAdmin = profile?.role == 'admin';
        final mfaEnabled = profile?.mfaEnabled ?? false;

        return AppScaffold(
          title: 'Seguranca e auditoria',
          child: ListView(
            children: [
              Text('Proteja a sua conta e acompanhe acessos.', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2A2B38)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Autenticacao em duas etapas', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 6),
                    Text(
                      'Ative uma camada extra de seguranca. A validacao completa via SMS requer configuracao mobile.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 12),
                    SwitchListTile(
                      value: mfaEnabled,
                      onChanged: (value) async {
                        await FirestoreService().updateUser(user.uid, {'mfaEnabled': value});
                        await AuditService().logEvent(
                          action: 'mfa_toggle',
                          targetType: 'user',
                          targetId: user.uid,
                          details: {'enabled': value},
                        );
                      },
                      title: const Text('Ativar MFA'),
                      subtitle: const Text('Recomendado para contas administrativas.'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Text('Logs de auditoria', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              StreamBuilder(
                stream: AuditService().watchLogs(actorId: isAdmin ? null : user.uid),
                builder: (context, logSnapshot) {
                  final logs = logSnapshot.data ?? [];
                  if (logs.isEmpty) {
                    return const Text('Sem eventos registados.');
                  }

                  return Column(
                    children: logs.map((log) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFF2A2B38)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              log.action,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 4),
                            Text(log.actorEmail),
                            if (log.targetType != null)
                              Text('Alvo: ${log.targetType} ${log.targetId ?? ''}'),
                            Text('Data: ${log.createdAt.toIso8601String().split('T').first}'),
                          ],
                        ),
                      );
                    }).toList(),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
