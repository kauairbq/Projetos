import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('pt-PT');
  } catch {
    return '-';
  }
}

function formatMoney(value) {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
  } catch {
    return `${n} EUR`;
  }
}

export default function Clients({ user }) {
  const toast = useToast();
  const isMaster = useMemo(() => user.tenant_role === 'MASTER_ADMIN', [user.tenant_role]);

  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    type: 'ALL',
    tenantStatus: 'ALL',
    subscriptionStatus: 'ALL'
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await api.get('/admin/tenants-kpis');
      setTenants(res.data?.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Nao foi possivel carregar os clientes (tenants).';
      setError(msg);
      toast.push({ type: 'error', title: 'Falha', message: 'Nao foi possivel carregar Clientes.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isMaster) return;
    load().catch(() => null);
  }, [isMaster, load]);

  if (!isMaster) {
    return (
      <section className="row g-4">
        <div className="col-12">
          <div className="card tf-card">
            <div className="card-body">
              <h3>Clientes</h3>
              <p className="text-secondary mb-0">Disponivel apenas para o Master Admin.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const filtered = useMemo(() => {
    const q = String(filters.q || '').trim().toLowerCase();

    return (tenants || []).filter((t) => {
      const matchesQ = !q || `${t.name || ''} ${t.slug || ''}`.toLowerCase().includes(q);
      const matchesType = filters.type === 'ALL' || String(t.type) === filters.type;
      const matchesTenantStatus = filters.tenantStatus === 'ALL' || String(t.tenant_status) === filters.tenantStatus;
      const matchesSubStatus = filters.subscriptionStatus === 'ALL' || String(t.subscription_status) === filters.subscriptionStatus;
      return matchesQ && matchesType && matchesTenantStatus && matchesSubStatus;
    });
  }, [filters, tenants]);

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <div>
                <h3 className="mb-1">Clientes</h3>
                <p className="text-secondary mb-0">Tenants, planos e estado de assinatura (visao Master).</p>
              </div>
              <button className="btn btn-outline-light" type="button" onClick={load} disabled={isLoading}>
                {isLoading ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body table-responsive">
            <div className="row g-2 mb-3">
              <div className="col-lg-4">
                <input
                  className="form-control"
                  placeholder="Pesquisar cliente (nome/slug)"
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                />
              </div>
              <div className="col-lg-2">
                <select
                  className="form-select"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="ALL">Todos</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="GYM">Ginasio</option>
                </select>
              </div>
              <div className="col-lg-3">
                <select
                  className="form-select"
                  value={filters.tenantStatus}
                  onChange={(e) => setFilters({ ...filters, tenantStatus: e.target.value })}
                >
                  <option value="ALL">Tenant: todos</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="TRIAL">TRIAL</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="col-lg-3">
                <select
                  className="form-select"
                  value={filters.subscriptionStatus}
                  onChange={(e) => setFilters({ ...filters, subscriptionStatus: e.target.value })}
                >
                  <option value="ALL">Assinatura: todas</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="TRIAL">TRIAL</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <DataTable
              columns={[
                { key: 'name', header: 'Nome', render: (t) => <span className="fw-semibold">{t.name}</span> },
                { key: 'type', header: 'Tipo' },
                { key: 'slug', header: 'Slug', render: (t) => <code className="text-secondary">{t.slug}</code> },
                { key: 'tenant_status', header: 'Tenant', render: (t) => <StatusBadge status={t.tenant_status} /> },
                { key: 'subscription_status', header: 'Assinatura', render: (t) => <StatusBadge status={t.subscription_status} /> },
                { key: 'plan_code', header: 'Plano', render: (t) => t.plan_code || '-' },
                { key: 'monthly_fee', header: 'MRR', render: (t) => (t.monthly_fee != null ? formatMoney(t.monthly_fee) : '-') },
                { key: 'revenue_paid_this_month', header: 'Receita (mes)', render: (t) => formatMoney(t.revenue_paid_this_month) },
                { key: 'open_amount', header: 'Pendente', render: (t) => formatMoney(t.open_amount) },
                { key: 'open_tickets', header: 'Tickets', render: (t) => t.open_tickets ?? 0 },
                {
                  key: 'current_period_end',
                  header: 'Periodo',
                  render: (t) => (
                    <>
                      {formatDate(t.current_period_end)}
                      {t.grace_until ? <span className="text-secondary"> (grace: {formatDate(t.grace_until)})</span> : null}
                    </>
                  )
                },
                {
                  key: 'actions',
                  header: 'Acao',
                  render: (t) => (
                    <Link className="btn btn-sm btn-outline-light" to={`/payments?tenant=${encodeURIComponent(t.slug || '')}`}>
                      Pagamentos
                    </Link>
                  )
                }
              ]}
              rows={filtered}
              isLoading={isLoading}
              error={error}
              onRetry={load}
              emptyTitle="Sem clientes"
              emptyDescription="Ainda nao existem tenants registados."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
