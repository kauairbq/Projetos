import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../shared/widgets/app_scaffold.dart';
import '../../core/services/firestore_service.dart';
import '../../core/models/support_ticket.dart';
import '../../core/models/warranty.dart';
import '../../core/services/audit_service.dart';
import '../../core/models/app_user.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final _deviceIdController = TextEditingController();
  final _descController = TextEditingController();
  final _priorityController = TextEditingController(text: 'Media');

  final _warrantyDeviceController = TextEditingController();
  final _warrantyEndController = TextEditingController();

  @override
  void dispose() {
    _deviceIdController.dispose();
    _descController.dispose();
    _priorityController.dispose();
    _warrantyDeviceController.dispose();
    _warrantyEndController.dispose();
    super.dispose();
  }

  Future<void> _addTicket() async {
    final deviceId = _deviceIdController.text.trim();
    final description = _descController.text.trim();
    if (deviceId.isEmpty || description.isEmpty) return;

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final ticket = SupportTicket(
      id: '',
      deviceId: deviceId,
      description: description,
      priority: _priorityController.text.trim().isEmpty ? 'Media' : _priorityController.text.trim(),
      status: 'Aberto',
      createdBy: user.uid,
      createdAt: DateTime.now(),
    );

    await FirestoreService().addTicket(ticket);
    await AuditService().logEvent(
      action: 'ticket_add',
      targetType: 'ticket',
      details: {'deviceId': deviceId, 'priority': ticket.priority},
    );
    _deviceIdController.clear();
    _descController.clear();
    _priorityController.text = 'Media';
  }

  Future<void> _addWarranty() async {
    final deviceId = _warrantyDeviceController.text.trim();
    final endDate = DateTime.tryParse(_warrantyEndController.text.trim());
    if (deviceId.isEmpty || endDate == null) return;

    final warranty = Warranty(
      id: '',
      deviceId: deviceId,
      startDate: DateTime.now(),
      endDate: endDate,
      status: endDate.isAfter(DateTime.now()) ? 'Ativa' : 'Expirada',
    );

    await FirestoreService().addWarranty(warranty);
    await AuditService().logEvent(
      action: 'warranty_add',
      targetType: 'warranty',
      details: {'deviceId': deviceId, 'endDate': endDate.toIso8601String()},
    );
    _warrantyDeviceController.clear();
    _warrantyEndController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return AppScaffold(
        title: 'Suporte e garantia',
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return StreamBuilder<AppUser?>(
      stream: FirestoreService().watchUser(user.uid),
      builder: (context, profileSnapshot) {
        final profile = profileSnapshot.data;
        final isAdmin = profile?.role == 'admin';

        return AppScaffold(
          title: 'Suporte e garantia',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Abrir tickets e registar garantias.', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 16),
              Text('Abrir ticket', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              TextField(controller: _deviceIdController, decoration: const InputDecoration(labelText: 'ID do dispositivo')),
              const SizedBox(height: 12),
              TextField(controller: _descController, decoration: const InputDecoration(labelText: 'Descricao do problema')),
              const SizedBox(height: 12),
              TextField(controller: _priorityController, decoration: const InputDecoration(labelText: 'Prioridade')),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _addTicket,
                  child: const Text('Abrir ticket'),
                ),
              ),
              const SizedBox(height: 20),
              if (isAdmin) ...[
                Text('Garantias', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                TextField(controller: _warrantyDeviceController, decoration: const InputDecoration(labelText: 'ID do dispositivo')),
                const SizedBox(height: 12),
                TextField(
                  controller: _warrantyEndController,
                  decoration: const InputDecoration(labelText: 'Data fim (YYYY-MM-DD)'),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _addWarranty,
                    child: const Text('Registar garantia'),
                  ),
                ),
                const SizedBox(height: 20),
              ],
              Expanded(
                child: ListView(
                  children: [
                    Text('Tickets recentes', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    StreamBuilder<List<SupportTicket>>(
                      stream: FirestoreService().watchTickets(),
                      builder: (context, snapshot) {
                        final tickets = snapshot.data ?? [];
                        if (tickets.isEmpty) {
                          return const Text('Sem tickets registados.');
                        }
                        return Column(
                          children: tickets.map((ticket) {
                            return ListTile(
                              title: Text('Dispositivo: ${ticket.deviceId}'),
                              subtitle: Text('${ticket.description} (${ticket.priority})'),
                              trailing: Text(ticket.status),
                            );
                          }).toList(),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    Text('Garantias', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    StreamBuilder<List<Warranty>>(
                      stream: FirestoreService().watchWarranties(),
                      builder: (context, snapshot) {
                        final warranties = snapshot.data ?? [];
                        if (warranties.isEmpty) {
                          return const Text('Sem garantias registadas.');
                        }
                        return Column(
                          children: warranties.map((warranty) {
                            return ListTile(
                              title: Text('Dispositivo: ${warranty.deviceId}'),
                              subtitle: Text('Fim: ${warranty.endDate.toIso8601String().split('T').first}'),
                              trailing: Text(warranty.status),
                            );
                          }).toList(),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
