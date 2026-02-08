class Pack {
  final String id;
  final String title;
  final String description;
  final List<String> devices;
  final List<String> assignedTo;
  final DateTime createdAt;

  const Pack({
    required this.id,
    required this.title,
    required this.description,
    required this.devices,
    required this.assignedTo,
    required this.createdAt,
  });

  factory Pack.fromMap(String id, Map<String, dynamic> data) {
    return Pack(
      id: id,
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      devices: List<String>.from(data['devices'] ?? []),
      assignedTo: List<String>.from(data['assignedTo'] ?? []),
      createdAt: DateTime.tryParse(data['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'description': description,
      'devices': devices,
      'assignedTo': assignedTo,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
