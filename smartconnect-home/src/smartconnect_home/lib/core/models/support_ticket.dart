class SupportTicket {
  final String id;
  final String deviceId;
  final String description;
  final String priority;
  final String status;
  final String createdBy;
  final DateTime createdAt;

  const SupportTicket({
    required this.id,
    required this.deviceId,
    required this.description,
    required this.priority,
    required this.status,
    required this.createdBy,
    required this.createdAt,
  });

  factory SupportTicket.fromMap(String id, Map<String, dynamic> data) {
    return SupportTicket(
      id: id,
      deviceId: data['deviceId'] ?? '',
      description: data['description'] ?? '',
      priority: data['priority'] ?? 'Media',
      status: data['status'] ?? 'Aberto',
      createdBy: data['createdBy'] ?? '',
      createdAt: DateTime.tryParse(data['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'deviceId': deviceId,
      'description': description,
      'priority': priority,
      'status': status,
      'createdBy': createdBy,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
