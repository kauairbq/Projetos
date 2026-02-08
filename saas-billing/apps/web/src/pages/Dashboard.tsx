import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Invoice, Plan, Subscription } from "../lib/types";
import { StatCard } from "../components/StatCard";
import { Topbar } from "../components/Topbar";

export function Dashboard() {
  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      try {
        const { data } = await api.get<Plan[]>("/plans");
        return data;
      } catch {
        return [] as Plan[];
      }
    },
  });

  const subsQuery = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      try {
        const { data } = await api.get<Subscription[]>("/subscriptions");
        return data;
      } catch {
        return [] as Subscription[];
      }
    },
  });

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        const { data } = await api.get<Invoice[]>("/invoices");
        return data;
      } catch {
        return [] as Invoice[];
      }
    },
  });

  const plans = plansQuery.data ?? [];
  const subscriptions = subsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];

  const mrr = subscriptions.reduce((acc, sub) => {
    const plan = sub.plan ?? plans.find((item) => item.id === sub.planId);
    if (!plan) return acc;
    return acc + (plan.interval === "MONTHLY" ? plan.priceCents : plan.priceCents / 12);
  }, 0);

  return (
    <div>
      <Topbar title="Dashboard" description="Resumo financeiro e operacional da plataforma." />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="MRR estimado" value={`€ ${(mrr / 100).toFixed(2)}`} helper="Baseado nas subscrições ativas" />
          <StatCard label="Planos ativos" value={String(plans.filter((p) => p.active).length)} helper="Planos comerciais disponíveis" />
          <StatCard label="Faturas emitidas" value={String(invoices.length)} helper="Últimos lançamentos" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold">Subscrições recentes</h3>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Plano</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0, 5).map((sub) => (
                  <tr key={sub.id}>
                    <td>{sub.userId.slice(0, 8)}...</td>
                    <td>{sub.plan?.name ?? sub.planId.slice(0, 8)}</td>
                    <td>{sub.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold">Faturas recentes</h3>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id.slice(0, 8)}...</td>
                    <td>€ {(invoice.amountCents / 100).toFixed(2)}</td>
                    <td>{invoice.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
