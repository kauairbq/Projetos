export function roleLabel(role) {
  if (role === 'admin') return 'Administrador';
  if (role === 'trainer') return 'Personal Trainer';
  return 'Cliente';
}

export function safeArray(data) {
  return Array.isArray(data) ? data : [];
}
