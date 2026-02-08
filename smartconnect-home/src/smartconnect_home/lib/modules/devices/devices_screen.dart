import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../shared/widgets/app_scaffold.dart';
import '../../core/services/firestore_service.dart';
import '../../core/models/device.dart';
import '../../core/models/app_user.dart';
import '../../core/models/discovered_device.dart';
import '../../core/services/device_discovery_service.dart';
import '../../core/services/audit_service.dart';

class DevicesScreen extends StatefulWidget {
  const DevicesScreen({super.key});

  @override
  State<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends State<DevicesScreen> {
  final _nameController = TextEditingController();
  final _discoveryService = DeviceDiscoveryService();
  String _protocolValue = 'Wi-Fi';
  String _status = 'Online';
  String _assignedTo = '';
  String _protocolFilter = 'Todos';

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _addDiscoveredDevice(DiscoveredDevice device) async {
    final deviceModel = Device(
      id: '',
      name: device.name,
      protocol: device.method,
      status: 'Online',
      assignedTo: '',
      createdAt: DateTime.now(),
    );

    await FirestoreService().addDevice(deviceModel);
    await AuditService().logEvent(
      action: 'device_add',
      targetType: 'device',
      details: {'name': device.name, 'protocol': device.method, 'source': 'discovery'},
    );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${device.name} adicionado.')),
      );
    }
  }

  Future<void> _showQuickAddSheet(String method) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1B28),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Adicionar por $method',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Este assistente vai guiar a descoberta do dispositivo.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              _buildStep('1', 'Coloque o dispositivo em modo de emparelhamento.'),
              _buildStep('2', method == 'QR Code'
                  ? 'Aponte a camera para o QR Code do dispositivo.'
                  : 'Vamos procurar dispositivos proximos.'),
              _buildStep('3', 'Confirme o nome e finalize a configuracao.'),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Fechar'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Iniciar assistente'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _showDiscoverySheet(String method) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1B28),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            Future<List<DiscoveredDevice>> future;
            if (method == 'Wi-Fi') {
              future = _discoveryService.scanWifi();
            } else {
              future = _discoveryService.scanBluetooth();
            }

            return Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Procurar $method', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 6),
                  Text(
                    'A pesquisar dispositivos compatíveis. Mantenha o emparelhamento ativo.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  FutureBuilder<List<DiscoveredDevice>>(
                    future: future,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(child: CircularProgressIndicator()),
                        );
                      }

                      final devices = snapshot.data ?? [];
                      if (devices.isEmpty) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Nenhum dispositivo encontrado.'),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: () => setModalState(() {}),
                                child: const Text('Procurar novamente'),
                              ),
                            ),
                          ],
                        );
                      }

                      return Column(
                        children: devices
                            .map(
                              (device) => ListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text(device.name),
                                subtitle: Text(device.detail ?? 'Dispositivo detectado'),
                                trailing: ElevatedButton(
                                  onPressed: () async {
                                    await _addDiscoveredDevice(device);
                                    if (context.mounted) Navigator.pop(context);
                                  },
                                  child: const Text('Adicionar'),
                                ),
                              ),
                            )
                            .toList(),
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildStep(String number, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(
              number,
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }

  Widget _choiceTile(String label, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 160,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF2A2B38)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 28, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 10),
            Text(label, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Future<void> _showDiscoveryOptions() async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1B28),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Procurar dispositivos', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 6),
              Text(
                'Escolha o metodo de descoberta para iniciar o emparelhamento.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _choiceTile('Wi-Fi', Icons.wifi, () => _showDiscoverySheet('Wi-Fi')),
                  _choiceTile('Bluetooth', Icons.bluetooth, () => _showDiscoverySheet('Bluetooth')),
                ],
              ),
              const SizedBox(height: 18),
              Text('Mais opcoes', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _choiceTile('QR Code', Icons.qr_code_scanner, () => _showQuickAddSheet('QR Code')),
                  _choiceTile('Busca manual', Icons.edit, () {
                    Navigator.pop(context);
                  }),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Fechar'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _addDevice() async {
    final name = _nameController.text.trim();
    if (name.isEmpty || _protocolValue.isEmpty) return;

    final device = Device(
      id: '',
      name: name,
      protocol: _protocolValue,
      status: _status,
      assignedTo: _assignedTo,
      createdAt: DateTime.now(),
    );

    await FirestoreService().addDevice(device);
    await AuditService().logEvent(
      action: 'device_add',
      targetType: 'device',
      details: {'name': name, 'protocol': _protocolValue, 'source': 'manual'},
    );
    _nameController.clear();
    _assignedTo = '';
    _status = 'Online';
    _protocolValue = 'Wi-Fi';
    setState(() {});
  }

  Future<void> _editDevice(Device device, List<AppUser> users) async {
    _nameController.text = device.name;
    _protocolValue = device.protocol;
    _assignedTo = device.assignedTo;
    _status = device.status;

    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Editar dispositivo'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Nome')),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _protocolValue,
                  decoration: const InputDecoration(labelText: 'Protocolo'),
                  items: const [
                    DropdownMenuItem(value: 'Wi-Fi', child: Text('Wi-Fi')),
                    DropdownMenuItem(value: 'Zigbee', child: Text('Zigbee')),
                    DropdownMenuItem(value: 'Bluetooth', child: Text('Bluetooth')),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      _protocolValue = value;
                    }
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _status,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: const [
                    DropdownMenuItem(value: 'Online', child: Text('Online')),
                    DropdownMenuItem(value: 'Offline', child: Text('Offline')),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      _status = value;
                    }
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _assignedTo.isEmpty ? null : _assignedTo,
                  decoration: const InputDecoration(labelText: 'Atribuir a'),
                  items: [
                    const DropdownMenuItem(value: '', child: Text('Sem atribuicao')),
                    ...users.map(
                      (user) => DropdownMenuItem(
                        value: user.id,
                        child: Text('${user.name} (${user.role})'),
                      ),
                    ),
                  ],
                  onChanged: (value) {
                    _assignedTo = value ?? '';
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
            ElevatedButton(
              onPressed: () async {
                await FirestoreService().updateDevice(device.id, {
                  'name': _nameController.text.trim(),
                  'protocol': _protocolValue,
                  'status': _status,
                  'assignedTo': _assignedTo,
                });
                await AuditService().logEvent(
                  action: 'device_update',
                  targetType: 'device',
                  targetId: device.id,
                  details: {
                    'name': _nameController.text.trim(),
                    'protocol': _protocolValue,
                    'status': _status,
                    'assignedTo': _assignedTo,
                  },
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

  List<Device> _applyFilter(List<Device> devices) {
    if (_protocolFilter == 'Todos') return devices;
    return devices.where((d) => d.protocol == _protocolFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return AppScaffold(
        title: 'Dispositivos',
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return StreamBuilder<AppUser?>(
      stream: FirestoreService().watchUser(user.uid),
      builder: (context, profileSnapshot) {
        final profile = profileSnapshot.data;
        final isAdmin = profile?.role == 'admin';

        return AppScaffold(
          title: 'Dispositivos',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAdmin
                    ? 'Encontre dispositivos automaticamente e deixe o manual para ultimo recurso.'
                    : 'Dispositivos autorizados para o seu perfil.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              if (isAdmin) ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _showDiscoveryOptions,
                    icon: const Icon(Icons.search),
                    label: const Text('Procurar dispositivos'),
                  ),
                ),
                const SizedBox(height: 18),
                ExpansionTile(
                  title: const Text('Busca manual (avancado)'),
                  subtitle: const Text('Use apenas quando nao for possivel descobrir automaticamente.'),
                  childrenPadding: const EdgeInsets.only(top: 12, bottom: 12),
                  children: [
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Nome do dispositivo'),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _protocolValue,
                      decoration: const InputDecoration(labelText: 'Protocolo'),
                      items: const [
                        DropdownMenuItem(value: 'Wi-Fi', child: Text('Wi-Fi')),
                        DropdownMenuItem(value: 'Zigbee', child: Text('Zigbee')),
                        DropdownMenuItem(value: 'Bluetooth', child: Text('Bluetooth')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setState(() {
                            _protocolValue = value;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _status,
                      decoration: const InputDecoration(labelText: 'Status'),
                      items: const [
                        DropdownMenuItem(value: 'Online', child: Text('Online')),
                        DropdownMenuItem(value: 'Offline', child: Text('Offline')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setState(() {
                            _status = value;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    StreamBuilder<List<AppUser>>(
                      stream: FirestoreService().watchUsers(),
                      builder: (context, snapshot) {
                        final users = snapshot.data ?? [];
                        return DropdownButtonFormField<String>(
                          value: _assignedTo.isEmpty ? null : _assignedTo,
                          decoration: const InputDecoration(labelText: 'Atribuir a'),
                          items: [
                            const DropdownMenuItem(value: '', child: Text('Sem atribuicao')),
                            ...users.map(
                              (user) => DropdownMenuItem(
                                value: user.id,
                                child: Text('${user.name} (${user.role})'),
                              ),
                            ),
                          ],
                          onChanged: (value) {
                            setState(() {
                              _assignedTo = value ?? '';
                            });
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _addDevice,
                        child: const Text('Adicionar manualmente'),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 20),
              Row(
                children: [
                  const Text('Filtro: '),
                  const SizedBox(width: 8),
                  DropdownButton<String>(
                    value: _protocolFilter,
                    items: const [
                      DropdownMenuItem(value: 'Todos', child: Text('Todos')),
                      DropdownMenuItem(value: 'Wi-Fi', child: Text('Wi-Fi')),
                      DropdownMenuItem(value: 'Zigbee', child: Text('Zigbee')),
                      DropdownMenuItem(value: 'Bluetooth', child: Text('Bluetooth')),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          _protocolFilter = value;
                        });
                      }
                    },
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: StreamBuilder<List<Device>>(
                  stream: FirestoreService().watchDevices(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    final devices = _applyFilter(snapshot.data ?? []);
                    if (devices.isEmpty) {
                      return const Center(child: Text('Sem dispositivos registados.'));
                    }
                    return StreamBuilder<List<AppUser>>(
                      stream: isAdmin ? FirestoreService().watchUsers() : const Stream.empty(),
                      builder: (context, usersSnapshot) {
                        final users = usersSnapshot.data ?? [];
                        return ListView.separated(
                          itemCount: devices.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final device = devices[index];
                            final assigned = users.firstWhere(
                              (u) => u.id == device.assignedTo,
                              orElse: () => AppUser.empty('Nao atribuido'),
                            );
                            return Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Theme.of(context).cardColor,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFF2A2B38)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(device.name, style: Theme.of(context).textTheme.titleMedium),
                                  const SizedBox(height: 6),
                                  Text('Protocolo: ${device.protocol}'),
                                  Text('Status: ${device.status}'),
                                  if (isAdmin) Text('Atribuido a: ${assigned.name}'),
                                  if (isAdmin) ...[
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        TextButton(
                                          onPressed: () => _editDevice(device, users),
                                          child: const Text('Editar'),
                                        ),
                                        const SizedBox(width: 8),
                                        TextButton(
                                          onPressed: () async {
                                            await AuditService().logEvent(
                                              action: 'device_delete',
                                              targetType: 'device',
                                              targetId: device.id,
                                              details: {'name': device.name},
                                            );
                                            await FirestoreService().deleteDevice(device.id);
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
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
