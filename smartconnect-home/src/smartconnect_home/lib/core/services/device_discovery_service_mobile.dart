import 'package:flutter/foundation.dart';
import 'dart:io';

import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:network_info_plus/network_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';

import '../models/discovered_device.dart';

class DeviceDiscoveryService {
  Future<List<DiscoveredDevice>> scanWifi({Duration timeout = const Duration(seconds: 6)}) async {
    if (kIsWeb) return [];

    if (defaultTargetPlatform == TargetPlatform.android) {
      await Permission.locationWhenInUse.request();
    }

    final ip = await NetworkInfo().getWifiIP();
    if (ip == null || !ip.contains('.')) return [];

    final subnet = ip.substring(0, ip.lastIndexOf('.'));
    final devices = <DiscoveredDevice>[];

    try {
      var maxHosts = timeout.inSeconds * 10;
      if (maxHosts < 20) maxHosts = 20;
      if (maxHosts > 100) maxHosts = 100;
      final socketTimeoutMs = (timeout.inMilliseconds / maxHosts).round();
      final socketTimeout = Duration(
        milliseconds: socketTimeoutMs.clamp(150, 500) as int,
      );
      final candidates = List.generate(maxHosts, (index) => '$subnet.${index + 1}');
      await Future.wait(
        candidates.map((host) async {
          try {
            final socket = await Socket.connect(
              host,
              80,
              timeout: socketTimeout,
            );
            socket.destroy();
            devices.add(
              DiscoveredDevice(
                id: 'wifi-$host',
                name: 'Dispositivo $host',
                method: 'Wi-Fi',
                detail: 'Detectado na rede local',
              ),
            );
          } catch (_) {}
        }),
      );
    } catch (_) {
      return [];
    }

    return devices;
  }

  Future<List<DiscoveredDevice>> scanBluetooth({Duration timeout = const Duration(seconds: 6)}) async {
    if (kIsWeb) return [];

    await _requestBluetoothPermissions();

    final results = <DiscoveredDevice>[];
    final seen = <String>{};

    final subscription = FlutterBluePlus.scanResults.listen((items) {
      for (final item in items) {
        final id = item.device.id.id;
        if (id.isEmpty || seen.contains(id)) continue;
        seen.add(id);
        results.add(
          DiscoveredDevice(
            id: id,
            name: item.device.name.isNotEmpty ? item.device.name : 'Dispositivo Bluetooth',
            method: 'Bluetooth',
            rssi: item.rssi,
            detail: 'Sinal ${item.rssi} dBm',
          ),
        );
      }
    });

    await FlutterBluePlus.startScan(timeout: timeout);
    await Future.delayed(timeout);
    await FlutterBluePlus.stopScan();
    await subscription.cancel();

    return results;
  }

  Future<void> _requestBluetoothPermissions() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      await Permission.locationWhenInUse.request();
      await Permission.bluetoothScan.request();
      await Permission.bluetoothConnect.request();
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      await Permission.bluetooth.request();
    }
  }
}
