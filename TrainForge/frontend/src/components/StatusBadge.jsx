import Badge from './Badge';

function statusVariant(status) {
  const s = String(status || '').toLowerCase();

  if (['active', 'paid', 'confirmed', 'approved', 'completed', 'resolved', 'ok'].includes(s)) return 'success';
  if (['trial', 'personal', 'gym', 'both'].includes(s)) return 'info';
  if (['open', 'in_progress', 'pending', 'pending_payment'].includes(s)) return 'warning';
  if (['past_due', 'overdue', 'failed', 'blocked', 'suspended', 'cancelled', 'cancelled'].includes(s)) return 'danger';

  return 'neutral';
}

export default function StatusBadge({ status, label = '' }) {
  const text = label || status || '-';
  return <Badge variant={statusVariant(status)}>{text}</Badge>;
}
