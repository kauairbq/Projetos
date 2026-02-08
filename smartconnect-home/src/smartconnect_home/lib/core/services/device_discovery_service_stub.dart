import '../models/discovered_device.dart';

class DeviceDiscoveryService {
  Future<List<DiscoveredDevice>> scanWifi({Duration timeout = const Duration(seconds: 6)}) async {
    await Future.delayed(const Duration(milliseconds: 800));
    return const [
      DiscoveredDevice(
        id: 'wifi-001',
        name: 'SmartConnect Hub Sala',
        method: 'Wi-Fi',
        detail: 'Rede local detectada',
      ),
      DiscoveredDevice(
        id: 'wifi-002',
        name: 'Sensor Porta Entrada',
        method: 'Wi-Fi',
        detail: 'Rede local detectada',
      ),
    ];
  }

  Future<List<DiscoveredDevice>> scanBluetooth({Duration timeout = const Duration(seconds: 6)}) async {
    await Future.delayed(const Duration(milliseconds: 800));
    return const [
      DiscoveredDevice(
        id: 'bt-001',
        name: 'Fechadura Smart BT',
        method: 'Bluetooth',
        detail: 'Compatibilidade confirmada',
      ),
    ];
  }
}
