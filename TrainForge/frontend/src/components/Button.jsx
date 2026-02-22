export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  children
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `tf-btn tf-btn--${variant}`;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={['btn', sizeClass, variantClass, className].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={isDisabled}
    >
      {loading ? <span className="tf-btn__spinner" aria-hidden="true" /> : null}
      <span className="tf-btn__content">{children}</span>
    </button>
  );
}

