import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/app_user.dart';
import '../models/device.dart';
import '../models/pack.dart';
import '../models/warranty.dart';
import '../models/support_ticket.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<void> createUser(AppUser user) async {
    await _db.collection('users').doc(user.id).set(user.toMap());
  }

  Future<void> updateUser(String uid, Map<String, dynamic> data) async {
    await _db.collection('users').doc(uid).set(data, SetOptions(merge: true));
  }

  Stream<AppUser?> watchUser(String uid) {
    return _db.collection('users').doc(uid).snapshots().map((doc) {
      if (!doc.exists) return null;
      return AppUser.fromMap(doc.id, doc.data() ?? {});
    });
  }

  Future<AppUser?> getUser(String uid) async {
    final doc = await _db.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return AppUser.fromMap(doc.id, doc.data() ?? {});
  }

  Stream<List<AppUser>> watchUsers() {
    return _db.collection('users').snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => AppUser.fromMap(doc.id, doc.data()))
          .toList();
    });
  }

  Stream<List<Device>> watchDevices() {
    return _db.collection('devices').orderBy('createdAt', descending: true).snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => Device.fromMap(doc.id, doc.data()))
          .toList();
    });
  }

  Future<void> addDevice(Device device) async {
    await _db.collection('devices').add(device.toMap());
  }

  Future<void> updateDevice(String id, Map<String, dynamic> data) async {
    await _db.collection('devices').doc(id).update(data);
  }

  Future<void> deleteDevice(String id) async {
    await _db.collection('devices').doc(id).delete();
  }

  Stream<List<Pack>> watchPacks() {
    return _db.collection('packs').orderBy('createdAt', descending: true).snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => Pack.fromMap(doc.id, doc.data()))
          .toList();
    });
  }

  Future<void> addPack(Pack pack) async {
    await _db.collection('packs').add(pack.toMap());
  }

  Future<void> updatePack(String id, Map<String, dynamic> data) async {
    await _db.collection('packs').doc(id).update(data);
  }

  Future<void> deletePack(String id) async {
    await _db.collection('packs').doc(id).delete();
  }

  Stream<List<Warranty>> watchWarranties() {
    return _db.collection('warranties').orderBy('endDate', descending: false).snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => Warranty.fromMap(doc.id, doc.data()))
          .toList();
    });
  }

  Future<void> addWarranty(Warranty warranty) async {
    await _db.collection('warranties').add(warranty.toMap());
  }

  Future<void> updateWarranty(String id, Map<String, dynamic> data) async {
    await _db.collection('warranties').doc(id).update(data);
  }

  Future<void> deleteWarranty(String id) async {
    await _db.collection('warranties').doc(id).delete();
  }

  Stream<List<SupportTicket>> watchTickets() {
    return _db.collection('tickets').orderBy('createdAt', descending: true).snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => SupportTicket.fromMap(doc.id, doc.data()))
          .toList();
    });
  }

  Future<void> addTicket(SupportTicket ticket) async {
    await _db.collection('tickets').add(ticket.toMap());
  }

  Future<void> updateTicket(String id, Map<String, dynamic> data) async {
    await _db.collection('tickets').doc(id).update(data);
  }

  Future<void> deleteTicket(String id) async {
    await _db.collection('tickets').doc(id).delete();
  }
}
