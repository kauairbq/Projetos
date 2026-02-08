import 'package:flutter/material.dart';

class AppUser {
  final String id;
  final String name;
  final String email;
  final String role;
  final DateTime createdAt;
  final bool mfaEnabled;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.createdAt,
    this.mfaEnabled = false,
  });

  factory AppUser.fromMap(String id, Map<String, dynamic> data) {
    return AppUser(
      id: id,
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      role: data['role'] ?? 'user',
      createdAt: DateTime.tryParse(data['createdAt'] ?? '') ?? DateTime.now(),
      mfaEnabled: data['mfaEnabled'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'email': email,
      'role': role,
      'createdAt': createdAt.toIso8601String(),
      'mfaEnabled': mfaEnabled,
    };
  }

  static AppUser empty(String label) {
    return AppUser(
      id: '',
      name: label,
      email: '',
      role: 'user',
      createdAt: DateTime.now(),
      mfaEnabled: false,
    );
  }
}
