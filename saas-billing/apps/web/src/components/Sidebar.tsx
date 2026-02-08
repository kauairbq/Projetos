import { NavLink } from "react-router-dom";
import { LayoutDashboard, CreditCard, FileText, Users } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/plans", label: "Planos", icon: CreditCard },
  { to: "/subscriptions", label: "Subscrições", icon: Users },
  { to: "/invoices", label: "Faturas", icon: FileText },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="mb-6">
        <span className="badge">SaaS Billing</span>
        <h2 className="mt-3 text-xl font-semibold">Gestão Financeira</h2>
        <p className="mt-1 text-sm text-slate-500">
          Controlo de planos, subscrições e faturação.
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
        API ativa: <span className="font-semibold">/api</span>
        <div className="mt-2 text-xs text-indigo-500">Base: localhost:4010</div>
      </div>
    </aside>
  );
}
