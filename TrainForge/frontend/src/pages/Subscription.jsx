import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiArrowUpRight, FiCreditCard, FiRefreshCw } from 'react-icons/fi';

import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { SkeletonLines } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

function formatMoney(value, currency = 'EUR') {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('pt-PT');
  } catch {
    return String(value);
  }
}

export default function Subscription({ user }) {
  const toast = useToast();
  const isMaster = useMemo(() => user?.tenant_role === 'MASTER_ADMIN', [user]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [billing, setBilling] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [meRes, plansRes] = await Promise.all([
        api.get('/billing/me'),
        api.get('/billing/plans')
      ]);
      setBilling(meRes.data?.data || null);
      setPlans(plansRes.data?.data || []);
    } catch {
      setError('Não foi possível carregar a assinatura.');
      toast.push({ type: 'error', title: 'Falha', message: 'Não foi possível carregar a assinatura.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const subscription = billing?.subscription || null;
  const currentPlan = billing?.plan || null;
  const nextInvoice = billing?.next_invoice || null;

  const onUpgrade = async (planCode) => {
    if (!planCode) return;
    setIsUpgrading(true);
    try {
      await api.post('/billing/upgrade', { planCode });
      toast.push({ type: 'success', title: 'Pedido registado', message: `Upgrade para ${planCode} enviado.` });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Não foi possível solicitar o upgrade.' });
    } finally {
      setIsUpgrading(false);
    }
  };

  const canRequestUpgrade = Boolean(currentPlan) && !isMaster;

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="mb-1">Plano e Assinatura</h3>
                  <span className="tf-pill">Billing</span>
                </div>
                <p className="text-secondary mb-0">
                  Estado, próxima cobrança e upgrades de plano (fluxo sério, sem exagero).
                </p>
              </div>
              <button className="btn btn-outline-light" type="button" onClick={load} disabled={isLoading}>
                <FiRefreshCw style={{ marginRight: 8 }} />
                {isLoading ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && !isLoading ? (
        <div className="col-12">
          <EmptyState title="Falha ao carregar" description={error} actionLabel="Tentar novamente" onAction={load} />
        </div>
      ) : null}

      <div className="col-12 col-xl-6">
        <div className="card tf-card h-100">
          <div className="card-body d-grid gap-3">
            <h5 className="mb-0">Assinatura atual</h5>

            {isLoading ? (
              <SkeletonLines lines={9} />
            ) : subscription && currentPlan ? (
              <>
                <div className="tf-kv">
                  <div className="text-secondary">Plano</div>
                  <div className="fw-semibold">{currentPlan.name}</div>
                </div>
                <div className="tf-kv">
                  <div className="text-secondary">Status</div>
                  <div><StatusBadge status={subscription.status} /></div>
                </div>
                <div className="tf-kv">
                  <div className="text-secondary">Mensalidade</div>
                  <div className="fw-semibold">{formatMoney(currentPlan.monthly_fee, currentPlan.currency)}</div>
                </div>
                <div className="tf-kv">
                  <div className="text-secondary">Próxima cobrança</div>
                  <div className="fw-semibold">
                    {nextInvoice?.due_date ? formatDate(nextInvoice.due_date) : formatDate(subscription.current_period_end)}
                  </div>
                </div>
                {subscription.trial_ends_at ? (
                  <div className="tf-kv">
                    <div className="text-secondary">Trial até</div>
                    <div className="fw-semibold">{formatDate(subscription.trial_ends_at)}</div>
                  </div>
                ) : null}

                {nextInvoice ? (
                  <div className="tf-kv">
                    <div className="text-secondary">Fatura em aberto</div>
                    <div className="fw-semibold">
                      <FiCreditCard style={{ marginRight: 8 }} />
                      {formatMoney(nextInvoice.amount, nextInvoice.currency)} · <StatusBadge status={nextInvoice.status} />
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState
                title="Sem subscrição"
                description="Este tenant ainda não tem subscrição configurada. Use os planos abaixo para criar uma."
              />
            )}
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-6">
        <div className="card tf-card h-100">
          <div className="card-body d-grid gap-3">
            <h5 className="mb-0">Planos disponíveis</h5>
            <p className="text-secondary mb-0">
              {isMaster
                ? 'Conta Master Admin não precisa de upgrade.'
                : 'Escolha um plano. Em produção, isto integraria gateway e ciclo de faturação.'}
            </p>

            {isLoading ? (
              <SkeletonLines lines={9} />
            ) : plans.length === 0 ? (
              <EmptyState title="Sem planos" description="Não existem billing_plans ativos no banco." />
            ) : (
              <div className="row g-3">
                {plans.map((p) => {
                  const isCurrent = currentPlan?.code === p.code;
                  const currency = p.currency || currentPlan?.currency || 'EUR';
                  return (
                    <div className="col-12 col-md-6" key={p.code}>
                      <div className={`tf-plan ${isCurrent ? 'tf-plan--current' : ''}`}>
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <div>
                            <div className="fw-semibold">{p.name}</div>
                            <div className="text-secondary small">{p.code}</div>
                          </div>
                          {isCurrent ? <StatusBadge status="active" label="Atual" /> : <StatusBadge status="open" label="Disponível" />}
                        </div>

                        <div className="tf-plan__price">
                          {formatMoney(p.monthly_fee, currency)}
                          <span className="text-secondary small">/mês</span>
                        </div>

                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-primary btn-sm"
                            type="button"
                            disabled={!canRequestUpgrade || isCurrent || isUpgrading}
                            onClick={() => onUpgrade(p.code)}
                          >
                            Upgrade <FiArrowUpRight style={{ marginLeft: 6 }} />
                          </button>
                          <button className="btn btn-outline-light btn-sm" type="button" disabled>
                            Detalhes (em breve)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isMaster ? (
              <div className="text-secondary small">
                Nota: o botão de upgrade apenas muda o plano no banco (demo). O ciclo de cobrança já existe via `invoices/payments`.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

