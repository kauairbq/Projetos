import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/routes.dart';
import '../../core/services/firestore_service.dart';
import '../../core/models/app_user.dart';
import '../../core/services/audit_service.dart';
import 'auth_layout.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _role = 'user';
  bool _loading = false;
  String _error = '';

  Future<void> _register() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final credential = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );

      final user = AppUser(
        id: credential.user!.uid,
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        role: _role,
        createdAt: DateTime.now(),
      );

      await FirestoreService().createUser(user);
      try {
        await AuditService().logEvent(action: 'register', details: {'role': _role});
      } catch (_) {}

      if (!mounted) return;
      Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
    } on FirebaseAuthException catch (e) {
      setState(() {
        _error = e.message ?? 'Erro ao criar conta.';
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
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      header: 'Signup',
      title: 'Criar conta SmartConnect',
      subtitle: 'Ative o seu acesso e configure o seu espaco inteligente.',
      sideTitle: 'COMECE AGORA',
      sideBody: 'Centralize dispositivos e automatizacoes com seguranca e suporte integrado.',
      primaryLabel: _loading ? 'Criando...' : 'Criar conta',
      onPrimary: _loading ? null : _register,
      footerText: 'Ja tem conta?',
      footerAction: 'Entrar',
      onFooterTap: () => Navigator.pushReplacementNamed(context, AppRoutes.login),
      form: Column(
        children: [
          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Nome',
              prefixIcon: Icon(Icons.person_outline),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _emailController,
            decoration: const InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.email_outlined),
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
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _role,
            decoration: const InputDecoration(
              labelText: 'Perfil',
              prefixIcon: Icon(Icons.badge_outlined),
            ),
            items: const [
              DropdownMenuItem(value: 'admin', child: Text('Admin / Instalador')),
              DropdownMenuItem(value: 'user', child: Text('Utilizador final')),
            ],
            onChanged: (value) {
              if (value != null) {
                setState(() {
                  _role = value;
                });
              }
            },
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
