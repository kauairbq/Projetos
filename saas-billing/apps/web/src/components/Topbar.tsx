interface TopbarProps {
  title: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-secondary">Exportar</button>
        <button className="btn btn-primary">Novo registo</button>
      </div>
    </div>
  );
}
