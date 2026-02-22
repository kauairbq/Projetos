export default function ProgressBar({ value = 0, label = '', precision = 1 }) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0;
  const formatter = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.max(0, Math.min(2, Number(precision) || 0))
  });
  const formatted = formatter.format(safe);
  return (
    <div>
      {label ? <div className="small text-secondary mb-1">{label}</div> : null}
      <div className="progress tf-progress">
        <div className="progress-bar" role="progressbar" style={{ width: `${safe}%` }}>
          {formatted}%
        </div>
      </div>
    </div>
  );
}
