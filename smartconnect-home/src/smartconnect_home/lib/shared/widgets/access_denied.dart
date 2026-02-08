import 'package:flutter/material.dart';

class AccessDenied extends StatelessWidget {
  final String message;
  final VoidCallback? onBack;

  const AccessDenied({
    super.key,
    this.message = 'Acesso restrito para este perfil.',
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.lock, size: 48),
          const SizedBox(height: 12),
          Text(message, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          if (onBack != null)
            TextButton(
              onPressed: onBack,
              child: const Text('Voltar'),
            ),
        ],
      ),
    );
  }
}
