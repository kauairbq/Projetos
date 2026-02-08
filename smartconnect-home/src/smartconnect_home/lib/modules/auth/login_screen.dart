import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/routes.dart';
import '../../core/services/audit_service.dart';
import '../../core/services/firestore_service.dart';
import 'auth_layout.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String _error = '';
  final _mfaController = TextEditingController();

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final credential = await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
      final profile = await FirestoreService().getUser(credential.user!.uid);
      if (profile?.mfaEnabled == true) {
        final verified = await _promptMfa();
        if (!verified) {
          await FirebaseAuth.instance.signOut();
          setState(() {
            _error = 'Codigo MFA invalido.';
          });
          return;
        }
      }
      try {
        await AuditService().logEvent(action: 'login');
      } catch (_) {}
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
    } on FirebaseAuthException catch (e) {
      setState(() {
        _error = e.message ?? 'Erro ao autenticar.';
      });
    } catch (_) {
      setState(() {
        _error = 'Erro inesperado.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _mfaController.dispose();
    super.dispose();
  }

  Future<bool> _promptMfa() async {
    _mfaController.clear();
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          title: const Text('Verificacao MFA'),
          content: TextField(
            controller: _mfaController,
            decoration: const InputDecoration(labelText: 'Codigo MFA (demo: 123456)'),
            keyboardType: TextInputType.number,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, _mfaController.text.trim() == '123456'),
              child: const Text('Verificar'),
            ),
          ],
        );
      },
    );

    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      header: 'Login',
      title: 'Entrar no SmartConnect',
      subtitle: 'Aceda ao controlo central da sua casa inteligente.',
      sideTitle: 'BEM-VINDO DE VOLTA',
      sideBody: 'Gestao simples de dispositivos, packs e suporte tecnico num so lugar.',
      primaryLabel: _loading ? 'Entrando...' : 'Login',
      onPrimary: _loading ? null : _login,
      footerText: 'Nao tem conta?',
      footerAction: 'Criar agora',
      onFooterTap: () => Navigator.pushReplacementNamed(context, AppRoutes.register),
      form: Column(
        children: [
          TextField(
            controller: _emailController,
            decoration: const InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.person_outline),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _passwordController,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Senha',
              prefixIcon: Icon(Icons.lock_outline),
            ),
          ),
          if (_error.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_error, style: const TextStyle(color: Colors.redAccent)),
            ),
        ],
      ),
    );
  }
}
