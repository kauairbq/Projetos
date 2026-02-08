import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../shared/widgets/app_scaffold.dart';
import '../../core/services/firestore_service.dart';
import '../../core/models/pack.dart';
import '../../core/models/app_user.dart';
import '../../core/services/audit_service.dart';

class PacksScreen extends StatefulWidget {
  const PacksScreen({super.key});

  @override
  State<PacksScreen> createState() => _PacksScreenState();
}

class _PacksScreenState extends State<PacksScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _assignedTo = 'all';

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _addPack() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;

    final pack = Pack(
      id: '',
      title: title,
      description: _descController.text.trim(),
      devices: const [],
      assignedTo: [_assignedTo],
      createdAt: DateTime.now(),
    );

    await FirestoreService().addPack(pack);
    await AuditService().logEvent(
      action: 'pack_add',
      targetType: 'pack',
      details: {'title': title},
    );
    _titleController.clear();
    _descController.clear();
    _assignedTo = 'all';
  }

  Future<void> _editPack(Pack pack, List<AppUser> users) async {
    _titleController.text = pack.title;
    _descController.text = pack.description;
    _assignedTo = pack.assignedTo.isEmpty ? 'all' : pack.assignedTo.first;

    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Editar pack'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Titulo')),
              const SizedBox(height: 12),
              TextField(controller: _descController, decoration: const InputDecoration(labelText: 'Descricao')),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _assignedTo,
                decoration: const InputDecoration(labelText: 'Atribuir a'),
                items: [
                  const DropdownMenuItem(value: 'all', child: Text('Todos')),
                  ...users.map(
                    (user) => DropdownMenuItem(
                      value: user.id,
                      child: Text('${user.name} (${user.role})'),
                    ),
                  ),
                ],
                onChanged: (value) {
                  _assignedTo = value ?? 'all';
                },
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
            ElevatedButton(
              onPressed: () async {
                await FirestoreService().updatePack(pack.id, {
                  'title': _titleController.text.trim(),
                  'description': _descController.text.trim(),
                  'assignedTo': [_assignedTo],
                });
                await AuditService().logEvent(
                  action: 'pack_update',
                  targetType: 'pack',
                  targetId: pack.id,
                  details: {'title': _titleController.text.trim()},
                );
                if (context.mounted) Navigator.pop(context);
              },
              child: const Text('Guardar'),
            )
          ],
        );
      },
    );
  }

  Widget _buildPackList(List<Pack> packs, {bool isAdmin = false, List<AppUser> users = const []}) {
    return ListView.separated(
      itemCount: packs.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final pack = packs[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1F2A44)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(pack.title, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 6),
              Text(pack.description.isEmpty ? '-' : pack.description),
              if (isAdmin) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    TextButton(
                      onPressed: () => _editPack(pack, users),
                      child: const Text('Editar'),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () async {
                        await AuditService().logEvent(
                          action: 'pack_delete',
                          targetType: 'pack',
                          targetId: pack.id,
                          details: {'title': pack.title},
                        );
                        await FirestoreService().deletePack(pack.id);
                      },
                      child: const Text('Excluir'),
                    ),
                  ],
                )
              ]
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return AppScaffold(
        title: 'Packs de automacao',
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return AppScaffold(
      title: 'Packs de automacao',
      child: StreamBuilder<AppUser?>(
        stream: FirestoreService().watchUser(user.uid),
        builder: (context, profileSnapshot) {
          final profile = profileSnapshot.data;
          final isAdmin = profile?.role == 'admin';

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Criar e gerir packs.', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 16),
              if (isAdmin) ...[
                StreamBuilder<List<AppUser>>(
                  stream: FirestoreService().watchUsers(),
                  builder: (context, usersSnapshot) {
                    final users = usersSnapshot.data ?? [];
                    return Column(
                      children: [
                        TextField(
                          controller: _titleController,
                          decoration: const InputDecoration(labelText: 'Titulo do pack'),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _descController,
                          decoration: const InputDecoration(labelText: 'Descricao'),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value: _assignedTo,
                          decoration: const InputDecoration(labelText: 'Atribuir a'),
                          items: [
                            const DropdownMenuItem(value: 'all', child: Text('Todos')),
                            ...users.map(
                              (user) => DropdownMenuItem(
                                value: user.id,
                                child: Text('${user.name} (${user.role})'),
                              ),
                            ),
                          ],
                          onChanged: (value) {
                            setState(() {
                              _assignedTo = value ?? 'all';
                            });
                          },
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _addPack,
                            child: const Text('Adicionar pack'),
                          ),
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 20),
              ],
              Expanded(
                child: StreamBuilder<List<Pack>>(
                  stream: FirestoreService().watchPacks(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    final packs = snapshot.data ?? [];
                    if (packs.isEmpty) {
                      return const Center(child: Text('Sem packs registados.'));
                    }
                    if (!isAdmin) {
                      return _buildPackList(packs, isAdmin: false);
                    }
                    return StreamBuilder<List<AppUser>>(
                      stream: FirestoreService().watchUsers(),
                      builder: (context, usersSnapshot) {
                        final users = usersSnapshot.data ?? [];
                        return _buildPackList(packs, isAdmin: true, users: users);
                      },
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
