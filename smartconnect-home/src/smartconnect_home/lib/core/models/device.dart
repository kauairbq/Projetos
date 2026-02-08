class Device {
  final String id;
  final String name;
  final String protocol;
  final String status;
  final String assignedTo;
  final DateTime createdAt;

  const Device({
    required this.id,
    required this.name,
    required this.protocol,
    required this.status,
    required this.assignedTo,
    required this.createdAt,
  });

  factory Device.fromMap(String id, Map<String, dynamic> data) {
    return Device(
      id: id,
      name: data['name'] ?? '',
      protocol: data['protocol'] ?? 'Wi-Fi',
      status: data['status'] ?? 'Offline',
      assignedTo: data['assignedTo'] ?? '',
      createdAt: DateTime.tryParse(data['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'protocol': protocol,
      'status': status,
      'assignedTo': assignedTo,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
