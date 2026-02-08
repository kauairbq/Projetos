import 'package:flutter_test/flutter_test.dart';
import 'package:smartconnect_home/core/models/app_user.dart';
import 'package:smartconnect_home/core/models/device.dart';
import 'package:smartconnect_home/core/models/pack.dart';
import 'package:smartconnect_home/core/models/warranty.dart';
import 'package:smartconnect_home/core/models/support_ticket.dart';
import 'package:smartconnect_home/core/models/audit_log.dart';
import 'package:smartconnect_home/core/models/discovered_device.dart';

void main() {
  test('AppUser toMap/fromMap roundtrip', () {
    final now = DateTime(2025, 1, 1);
    final user = AppUser(
      id: 'u1',
      name: 'Kauai',
      email: 'kauai@email.com',
      role: 'admin',
      createdAt: now,
      mfaEnabled: true,
    );

    final map = user.toMap();
    final from = AppUser.fromMap('u1', map);

    expect(from.id, 'u1');
    expect(from.name, 'Kauai');
    expect(from.email, 'kauai@email.com');
    expect(from.role, 'admin');
    expect(from.mfaEnabled, true);
  });

  test('Device defaults when data is missing', () {
    final device = Device.fromMap('d1', {});
    expect(device.protocol, 'Wi-Fi');
    expect(device.status, 'Offline');
    expect(device.assignedTo, '');
  });

  test('Pack toMap/fromMap roundtrip', () {
    final now = DateTime(2025, 1, 2);
    final pack = Pack(
      id: 'p1',
      title: 'Conforto',
      description: 'Automacoes basicas',
      devices: const ['d1', 'd2'],
      createdAt: now,
    );

    final map = pack.toMap();
    final from = Pack.fromMap('p1', map);

    expect(from.title, 'Conforto');
    expect(from.devices.length, 2);
  });

  test('Warranty toMap/fromMap roundtrip', () {
    final now = DateTime(2025, 1, 3);
    final warranty = Warranty(
      id: 'w1',
      deviceId: 'd1',
      startDate: now,
      endDate: now.add(const Duration(days: 365)),
      status: 'Ativa',
    );

    final map = warranty.toMap();
    final from = Warranty.fromMap('w1', map);

    expect(from.deviceId, 'd1');
    expect(from.status, 'Ativa');
  });

  test('SupportTicket toMap/fromMap roundtrip', () {
    final now = DateTime(2025, 1, 4);
    final ticket = SupportTicket(
      id: 't1',
      deviceId: 'd1',
      description: 'Sem sinal',
      priority: 'Alta',
      status: 'Aberto',
      createdBy: 'u1',
      createdAt: now,
    );

    final map = ticket.toMap();
    final from = SupportTicket.fromMap('t1', map);

    expect(from.deviceId, 'd1');
    expect(from.priority, 'Alta');
  });

  test('AuditLog toMap/fromMap roundtrip', () {
    final now = DateTime(2025, 1, 5);
    final log = AuditLog(
      id: 'a1',
      actorId: 'u1',
      actorEmail: 'kauai@email.com',
      action: 'login',
      details: const {'ip': '127.0.0.1'},
      createdAt: now,
      targetType: 'user',
      targetId: 'u1',
    );

    final map = log.toMap();
    final from = AuditLog.fromMap('a1', map);

    expect(from.action, 'login');
    expect(from.actorEmail, 'kauai@email.com');
    expect(from.targetType, 'user');
  });

  test('DiscoveredDevice keeps values', () {
    const device = DiscoveredDevice(
      id: 'wifi-1',
      name: 'SmartConnect Hub',
      method: 'Wi-Fi',
      rssi: -60,
      detail: 'Rede local detectada',
    );

    expect(device.name, 'SmartConnect Hub');
    expect(device.method, 'Wi-Fi');
    expect(device.rssi, -60);
  });
}
