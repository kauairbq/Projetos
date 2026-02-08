import 'package:cloud_firestore/cloud_firestore.dart';

class AuditLog {
  final String id;
  final String actorId;
  final String actorEmail;
  final String action;
  final String? targetType;
  final String? targetId;
  final Map<String, dynamic> details;
  final DateTime createdAt;

  const AuditLog({
    required this.id,
    required this.actorId,
    required this.actorEmail,
    required this.action,
    required this.details,
    required this.createdAt,
    this.targetType,
    this.targetId,
  });

  factory AuditLog.fromMap(String id, Map<String, dynamic> data) {
    final rawCreatedAt = data['createdAt'];
    final createdAt = rawCreatedAt is Timestamp
        ? rawCreatedAt.toDate()
        : DateTime.tryParse(rawCreatedAt ?? '') ?? DateTime.now();
    return AuditLog(
      id: id,
      actorId: data['actorId'] ?? '',
      actorEmail: data['actorEmail'] ?? '',
      action: data['action'] ?? '',
      targetType: data['targetType'],
      targetId: data['targetId'],
      details: Map<String, dynamic>.from(data['details'] ?? {}),
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'actorId': actorId,
      'actorEmail': actorEmail,
      'action': action,
      'targetType': targetType,
      'targetId': targetId,
      'details': details,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
