export default function Badge({ variant = 'neutral', className = '', children, title = '' }) {
  return (
    <span
      className={['tf-badge-status', `tf-badge-status--${variant}`, className].filter(Boolean).join(' ')}
      title={title}
    >
      {children}
    </span>
  );
}

