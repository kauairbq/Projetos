class DiscoveredDevice {
  final String id;
  final String name;
  final String method;
  final int? rssi;
  final String? detail;

  const DiscoveredDevice({
    required this.id,
    required this.name,
    required this.method,
    this.rssi,
    this.detail,
  });
}
