import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  title = 'Sem dados',
  description = 'Ainda nao ha registos para mostrar.',
  icon = null,
  actionLabel = '',
  onAction = null
}) {
  const Icon = icon || FiInbox;

  return (
    <div className="tf-empty">
      <div className="tf-empty__icon" aria-hidden="true">
        <Icon />
      </div>
      <div className="tf-empty__title">{title}</div>
      <div className="tf-empty__desc">{description}</div>
      {actionLabel && typeof onAction === 'function' ? (
        <button className="btn btn-primary btn-sm mt-2" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
