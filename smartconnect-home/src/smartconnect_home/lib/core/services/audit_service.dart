import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/audit_log.dart';

class AuditService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<void> logEvent({
    required String action,
    String? targetType,
    String? targetId,
    Map<String, dynamic>? details,
  }) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    await _db.collection('audit_logs').add({
      'actorId': user.uid,
      'actorEmail': user.email ?? '',
      'action': action,
      'targetType': targetType,
      'targetId': targetId,
      'details': details ?? {},
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  Stream<List<AuditLog>> watchLogs({String? actorId}) {
    Query query = _db.collection('audit_logs').orderBy('createdAt', descending: true).limit(50);
    if (actorId != null && actorId.isNotEmpty) {
      query = query.where('actorId', isEqualTo: actorId);
    }

    return query.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => AuditLog.fromMap(doc.id, doc.data() as Map<String, dynamic>))
          .toList();
    });
  }
}
