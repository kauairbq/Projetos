import EmptyState from './EmptyState';
import { SkeletonTable } from './Skeleton';

export default function DataTable({
  columns = [],
  rows = [],
  isLoading = false,
  error = '',
  emptyTitle = 'Sem dados',
  emptyDescription = 'Ainda nao ha registos para mostrar.',
  onRetry = null
}) {
  if (error && !isLoading) {
    return (
      <EmptyState
        title="Falha ao carregar"
        description={error}
        actionLabel={typeof onRetry === 'function' ? 'Tentar novamente' : ''}
        onAction={onRetry}
      />
    );
  }

  if (isLoading) {
    return <SkeletonTable rows={7} />;
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} actionLabel="" />;
  }

  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover align-middle mb-0 tf-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.header}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx}>
              {columns.map((c) => (
                <td key={c.key || c.header}>
                  {typeof c.render === 'function' ? c.render(row) : row?.[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

