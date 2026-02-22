export function Skeleton({ height = 12, width = '100%', radius = 10, className = '' }) {
  const style = { height, width, borderRadius: radius };
  return <div className={`tf-skeleton ${className}`.trim()} style={style} />;
}

export function SkeletonLines({ lines = 3 }) {
  return (
    <div className="d-grid gap-2">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} height={12} width={idx === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="d-grid gap-2">
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} height={44} width="100%" radius={12} />
      ))}
    </div>
  );
}

