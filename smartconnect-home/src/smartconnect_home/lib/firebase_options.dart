import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get web => const FirebaseOptions(
    apiKey: 'AIzaSyABFi-IKtJ_0tGZjcnzSgv0fm4wuD7mKSo',
    authDomain: 'smartconnect-home.firebaseapp.com',
    projectId: 'smartconnect-home',
    storageBucket: 'smartconnect-home.firebasestorage.app',
    messagingSenderId: '430242063240',
    appId: '1:430242063240:web:9374fb419937cc146d103d',
  );

  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }

    throw UnsupportedError(
      'DefaultFirebaseOptions are only configured for web. '
      'Use native Firebase config for mobile platforms.'
    );
  }
}
