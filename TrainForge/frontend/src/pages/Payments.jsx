import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { FiDollarSign, FiLayers, FiTrendingUp } from 'react-icons/fi';

import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

function formatMoney(amount, currency) {
  if (amount == null) return '-';
  try {
    const value = Number(amount);
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: currency || 'EUR' }).format(value);
  } catch {
    return String(amount);
  }
}

export default function Payments({ user }) {
  const toast = useToast();
  const isMaster = useMemo(() => user.tenant_role === 'MASTER_ADMIN', [user.tenant_role]);
  const [searchParams] = useSearchParams();
  const tenantFilter = searchParams.get('tenant');

  const [overview, setOverview] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRunningCycle, setIsRunningCycle] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [billingRes, breakdownRes] = await Promise.all([
        api.get('/admin/billing/overview'),
        api.get('/admin/revenue/breakdown?months=12')
      ]);

      setOverview(billingRes.data?.data || []);
      setBreakdown(breakdownRes.data?.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Nao foi possivel carregar o overview de billing.';
      setError(msg);
      toast.push({ type: 'error', title: 'Falha', message: 'Nao foi possivel carregar Pagamentos.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isMaster) return;
    load().catch(() => null);
  }, [isMaster, load]);

  const runCycle = async () => {
    setIsRunningCycle(true);
    try {
      await api.post('/admin/billing/run-cycle');
      toast.push({ type: 'success', title: 'Ciclo executado', message: 'Faturas geradas/atualizadas.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel executar o ciclo.' });
    } finally {
      setIsRunningCycle(false);
    }
  };

  if (!isMaster) {
    return (
      <section className="row g-4">
        <div className="col-12">
          <div className="card tf-card">
            <div className="card-body">
              <h3>Pagamentos</h3>
              <p className="text-secondary mb-0">Disponivel apenas para o Master Admin.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const filteredOverview = useMemo(() => {
    if (!tenantFilter) return overview;
    return (overview || []).filter((r) => String(r.tenant_slug || '') === String(tenantFilter));
  }, [overview, tenantFilter]);

  const revenueSummary = useMemo(() => {
    const last = breakdown && breakdown.length ? breakdown[breakdown.length - 1] : null;
    return {
      month_total: last?.total ?? 0,
      month_personal: last?.personal ?? 0,
      month_gym: last?.gym ?? 0,
      cumulative: last?.cumulative ?? 0
    };
  }, [breakdown]);

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <div>
                <h3 className="mb-1">Pagamentos</h3>
                <p className="text-secondary mb-0">Resumo por tenant: invoices, estado e valores.</p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-outline-light" type="button" onClick={load} disabled={isLoading}>
                  {isLoading ? 'A carregar...' : 'Atualizar'}
                </button>
                <button className="btn btn-primary" type="button" onClick={runCycle} disabled={isRunningCycle || isLoading}>
                  {isRunningCycle ? 'A executar...' : 'Gerar ciclo mensal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="row g-3">
          {[
            { label: 'Receita (mes)', value: formatMoney(revenueSummary.month_total, 'EUR'), icon: FiDollarSign },
            { label: 'Personal', value: formatMoney(revenueSummary.month_personal, 'EUR'), icon: FiLayers },
            { label: 'Ginasio', value: formatMoney(revenueSummary.month_gym, 'EUR'), icon: FiLayers },
            { label: 'Acumulado', value: formatMoney(revenueSummary.cumulative, 'EUR'), icon: FiTrendingUp }
          ].map(({ label, value, icon: Icon }) => (
            <div className="col-12 col-md-6 col-xl-3" key={label}>
              <div className="card tf-card h-100">
                <div className="card-body d-grid gap-2">
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="text-secondary mb-0">{label}</h6>
                    <span className="text-secondary" aria-hidden="true"><Icon /></span>
                  </div>
                  {isLoading ? <div className="tf-skeleton" style={{ height: 34, width: '70%', borderRadius: 12 }} /> : <h2 className="mb-0">{value}</h2>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-12 col-xl-7">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5>Receita por tipo</h5>
            <p className="text-secondary mb-3">Comparativo mensal de receita (Personal vs Ginasio).</p>

            {isLoading ? (
              <div className="d-grid gap-2">
                <div className="tf-skeleton" style={{ height: 18, width: '40%', borderRadius: 10 }} />
                <div className="tf-skeleton" style={{ height: 300, width: '100%', borderRadius: 16 }} />
              </div>
            ) : breakdown.length === 0 ? (
              <div className="tf-empty">
                <div className="tf-empty__title">Sem dados</div>
                <div className="tf-empty__desc">Ainda nao existe historico de receita.</div>
              </div>
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={breakdown || []}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(v, name) => [formatMoney(v, 'EUR'), name]} />
                    <Bar dataKey="personal" stackId="rev" fill="#4f8cff" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="gym" stackId="rev" fill="#f4c95d" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-5">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5>Receita acumulada</h5>
            <p className="text-secondary mb-3">Evolucao acumulada (rolling).</p>

            {isLoading ? (
              <div className="d-grid gap-2">
                <div className="tf-skeleton" style={{ height: 18, width: '40%', borderRadius: 10 }} />
                <div className="tf-skeleton" style={{ height: 300, width: '100%', borderRadius: 16 }} />
              </div>
            ) : breakdown.length === 0 ? (
              <div className="tf-empty">
                <div className="tf-empty__title">Sem dados</div>
                <div className="tf-empty__desc">Ainda nao existe historico de receita.</div>
              </div>
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={breakdown || []}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(v) => [formatMoney(v, 'EUR'), 'Acumulado']} />
                    <Line type="monotone" dataKey="cumulative" stroke="#4f8cff" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            {tenantFilter ? (
              <p className="text-secondary mb-3">
                Filtro ativo: <code className="text-secondary">{tenantFilter}</code>
              </p>
            ) : null}
            <DataTable
              columns={[
                { key: 'tenant_name', header: 'Tenant', render: (r) => <span className="fw-semibold">{r.tenant_name}</span> },
                { key: 'plan_code', header: 'Plano', render: (r) => r.plan_code || '-' },
                { key: 'subscription_status', header: 'Assinatura', render: (r) => <StatusBadge status={r.subscription_status} /> },
                { key: 'open_invoices', header: 'Em aberto', render: (r) => r.open_invoices ?? 0 },
                { key: 'overdue_invoices', header: 'Em atraso', render: (r) => r.overdue_invoices ?? 0 },
                { key: 'open_amount', header: 'Total (aberto)', render: (r) => formatMoney(r.open_amount, r.currency || 'EUR') }
              ]}
              rows={filteredOverview}
              isLoading={isLoading}
              error={error}
              onRetry={load}
              emptyTitle="Sem dados de billing"
              emptyDescription="Nao ha dados suficientes para apresentar billing."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
