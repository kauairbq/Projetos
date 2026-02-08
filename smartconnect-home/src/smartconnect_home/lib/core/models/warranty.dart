class Warranty {
  final String id;
  final String deviceId;
  final DateTime startDate;
  final DateTime endDate;
  final String status;

  const Warranty({
    required this.id,
    required this.deviceId,
    required this.startDate,
    required this.endDate,
    required this.status,
  });

  factory Warranty.fromMap(String id, Map<String, dynamic> data) {
    return Warranty(
      id: id,
      deviceId: data['deviceId'] ?? '',
      startDate: DateTime.tryParse(data['startDate'] ?? '') ?? DateTime.now(),
      endDate: DateTime.tryParse(data['endDate'] ?? '') ?? DateTime.now(),
      status: data['status'] ?? 'Ativa',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'deviceId': deviceId,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'status': status,
    };
  }
}
