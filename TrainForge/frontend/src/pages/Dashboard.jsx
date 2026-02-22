import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  FiActivity,
  FiAward,
  FiClock,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiAlertTriangle
} from 'react-icons/fi';

import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { Skeleton, SkeletonLines } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';

function getTourState(user) {
  try {
    const raw = localStorage.getItem('tf_tour');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    if (parsed.tenant_id && user?.tenant_id && Number(parsed.tenant_id) !== Number(user.tenant_id)) return null;
    return parsed;
  } catch {
    return null;
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

function formatDatetime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '';
  }
}

function requestStatusMeta(status) {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'completed') {
    return { label: 'Concluido', className: 'tf-badge-status tf-badge-status--success' };
  }

  if (normalized === 'pending') {
    return { label: 'Pendente', className: 'tf-badge-status tf-badge-status--warning' };
  }

  return { label: 'Em progresso', className: 'tf-badge-status tf-badge-status--info' };
}

function getApiErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    fallback
  );
}

export default function Dashboard({ user }) {
  const displayName = user.full_name || user.name || 'Utilizador';
  const isMaster = useMemo(() => user.tenant_role === 'MASTER_ADMIN', [user.tenant_role]);
  const isGym = useMemo(() => user.tenant_role === 'GYM_STAFF', [user.tenant_role]);
  const isOperator = useMemo(
    () => ['GYM_STAFF', 'PERSONAL'].includes(String(user.tenant_role || '').toUpperCase()),
    [user.tenant_role]
  );

  const [tour, setTour] = useState(() => getTourState(user));

  useEffect(() => {
    setTour(getTourState(user));
  }, [user?.tenant_id]);

  const [metrics, setMetrics] = useState({ total_workouts: 0, total_points: 0, avg_duration: 0, total_calories: 0 });
  const [clients, setClients] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);

  const [master, setMaster] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [activity, setActivity] = useState([]);
  const [insights, setInsights] = useState(null);
  const [masterPanelErrors, setMasterPanelErrors] = useState({ revenue: '', activity: '', insights: '' });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (isMaster) {
        setMasterPanelErrors({ revenue: '', activity: '', insights: '' });

        const [overviewRes, seriesRes, activityRes, insightsRes] = await Promise.allSettled([
          api.get('/admin/overview?scope=master'),
          api.get('/admin/revenue/series?months=12'),
          api.get('/admin/activity?limit=8'),
          api.get('/admin/insights')
        ]);

        if (overviewRes.status !== 'fulfilled') {
          throw overviewRes.reason;
        }

        const nextPanelErrors = { revenue: '', activity: '', insights: '' };

        setMaster(overviewRes.value?.data?.data || null);

        if (seriesRes.status === 'fulfilled') {
          setRevenueSeries(seriesRes.value?.data?.data || []);
        } else {
          setRevenueSeries([]);
          nextPanelErrors.revenue = getApiErrorMessage(seriesRes.reason, 'Nao foi possivel carregar a serie de receita.');
        }

        if (activityRes.status === 'fulfilled') {
          setActivity(activityRes.value?.data?.data || []);
        } else {
          setActivity([]);
          nextPanelErrors.activity = getApiErrorMessage(activityRes.reason, 'Nao foi possivel carregar a atividade recente.');
        }

        if (insightsRes.status === 'fulfilled') {
          setInsights(insightsRes.value?.data?.data || null);
        } else {
          setInsights(null);
          nextPanelErrors.insights = getApiErrorMessage(insightsRes.reason, 'Nao foi possivel carregar os insights.');
        }

        setMasterPanelErrors(nextPanelErrors);
        setClients([]);
        setServiceRequests([]);
      } else {
        if (isOperator) {
          const [metricsRes, insightsRes, clientsRes, requestsRes] = await Promise.all([
            api.get('/workouts/metrics'),
            api.get('/admin/insights'),
            api.get('/users?role=client'),
            api.get('/services/requests')
          ]);

          setMetrics(metricsRes.data?.data || {});
          setInsights(insightsRes.data?.data || null);
          setClients(clientsRes.data?.data || []);
          setServiceRequests(requestsRes.data?.data || []);
        } else {
          const metricsRes = await api.get('/workouts/metrics');
          setMetrics(metricsRes.data?.data || {});
          setInsights(null);
          setClients([]);
          setServiceRequests([]);
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel carregar dados da dashboard.'));
      toast.push({ type: 'error', title: 'Falha', message: 'Nao foi possivel carregar a dashboard.' });
    } finally {
      setIsLoading(false);
    }
  }, [isMaster, isOperator, toast]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const weeklyGoal = Math.min(100, Math.round(((metrics.total_workouts || 0) / 5) * 100));
  const weeklyFrequencyPct = Math.min(100, Math.round(((insights?.retention?.avg_weekly_frequency || 0) / 5) * 100));
  const challengeEngagementPct = Math.round(Number(insights?.retention?.challenge_engagement_pct || 0));
  const monthlyGoalPct = Math.round(Number(insights?.performance?.monthly_goal_completion_pct || 0));

  const kpis = [
    { label: 'Treinos', value: `${metrics.total_workouts || 0}`, icon: FiActivity },
    { label: 'Pontos', value: `${metrics.total_points || 0}`, icon: FiAward },
    { label: 'Duracao media', value: `${Math.round(metrics.avg_duration || 0)} min`, icon: FiClock },
    { label: 'Calorias', value: `${metrics.total_calories || 0}`, icon: FiTrendingUp }
  ];

  const masterKpis = useMemo(() => {
    const revenue = master?.revenue_paid_this_month ?? 0;
    const growth = master?.revenue_growth_pct ?? 0;

    return [
      { label: 'Receita mensal', value: formatMoney(revenue), icon: FiDollarSign, meta: 'Paid' },
      { label: 'Clientes ativos', value: `${master?.tenants_active ?? 0}`, icon: FiUsers, meta: 'ACTIVE + TRIAL' },
      { label: 'Pagamentos pendentes', value: `${master?.pending_invoices ?? 0}`, icon: FiAlertTriangle, meta: 'OPEN + OVERDUE' },
      { label: 'Crescimento', value: `${growth > 0 ? '+' : ''}${growth}%`, icon: FiTrendingUp, meta: 'vs mes anterior', tone: growth >= 0 ? 'success' : 'danger' }
    ];
  }, [master]);

  const trainerKpis = useMemo(() => {
    if (!insights) return kpis;

    return [
      {
        label: 'Receita mensal',
        value: formatMoney(insights.revenue?.monthly_total || 0),
        icon: FiDollarSign,
        meta: isGym ? 'Receita total do ginasio' : 'Receita mensal do personal'
      },
      {
        label: 'Receita prevista',
        value: formatMoney(insights.revenue?.recurring_forecast || 0),
        icon: FiTrendingUp,
        meta: 'Recorrencia esperada'
      },
      {
        label: 'Alunos ativos',
        value: `${insights.retention?.active_students || 0}`,
        icon: FiUsers,
        meta: `${insights.retention?.cancelled_students || 0} cancelados`
      },
      {
        label: 'Retencao',
        value: `${insights.retention?.retention_rate_pct || 0}%`,
        icon: FiAward,
        meta: `Pendentes: ${insights.revenue?.pending_payments || 0}`
      }
    ];
  }, [insights, isGym, kpis]);

  const revenueChartData = useMemo(() => {
    if (!revenueSeries || revenueSeries.length === 0) return [];

    return revenueSeries.map((p, idx) => {
      const prev = idx > 0 ? Number(revenueSeries[idx - 1]?.revenue || 0) : 0;
      const cur = Number(p.revenue || 0);
      const growthPct = prev > 0 ? ((cur - prev) / prev) * 100 : 0;

      return {
        ...p,
        growth_pct: Number(growthPct.toFixed(1))
      };
    });
  }, [revenueSeries]);

  const visibleKpis = isMaster ? masterKpis : trainerKpis;
  const operationalSummary = useMemo(() => {
    const totalClients = clients.length;
    const paidClients = clients.filter((c) => String(c.payment_status || '').toUpperCase() === 'PAGO').length;
    const pendingClients = clients.filter((c) => String(c.payment_status || '').toUpperCase() === 'PENDENTE').length;

    const openRequests = serviceRequests.filter((r) => ['pending', 'in_progress'].includes(String(r.status || '').toLowerCase())).length;

    return {
      totalClients,
      paidClients,
      pendingClients,
      openRequests
    };
  }, [clients, serviceRequests]);

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <h3 className="mb-1">Dashboard de Performance</h3>
            <p className="text-secondary mb-0">
              Bem-vindo, {displayName}. {isMaster
                ? 'Visao Master Admin: receita, retencao, ecossistema e alertas inteligentes.'
                : isGym
                  ? 'Visao Ginasio: receita por operacao, retencao de alunos e performance da equipa.'
                  : 'Visao Personal Solo: receita, retencao, evolucao dos alunos e alertas de risco.'}
            </p>
          </div>
        </div>
      </div>

      {tour ? (
        <div className="col-12">
          <div className="card tf-card">
            <div className="card-body d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <strong>Tutorial guiado</strong>
                  <span className="tf-pill">Tour</span>
                </div>
                <div className="text-secondary">
                  Passo 1: abra <strong>Onboarding</strong> e conclua perfil, alunos e desafio semanal. Depois volte aqui.
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-outline-light btn-sm"
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('tf_tour');
                    setTour(null);
                  }}
                >
                  Concluir tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {visibleKpis.map(({ label, value, icon: Icon, meta, tone }) => (
        <div className="col-md-3" key={label}>
          <div className="card tf-card h-100">
            <div className="card-body d-grid gap-2">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="text-secondary tf-kpi-label mb-0">{label}</h6>
                <span className="text-secondary tf-kpi-icon" aria-hidden="true">
                  <Icon />
                </span>
              </div>

              {isLoading ? (
                <Skeleton height={34} width="70%" radius={12} />
              ) : (
                <h2
                  className="mb-0 tf-kpi-value"
                  style={
                    tone === 'danger'
                      ? { color: '#ffc2c2' }
                      : tone === 'success'
                        ? { color: '#baf7cd' }
                        : undefined
                  }
                >
                  {value}
                </h2>
              )}

              {meta ? <small className="text-secondary">{meta}</small> : null}
            </div>
          </div>
        </div>
      ))}

      {isMaster ? (
        <>
          <div className="col-lg-7">
            <div className="card tf-card h-100">
              <div className="card-body">
                <h5>Receita mensal</h5>

                {error ? (
                  <EmptyState title="Falha ao carregar" description={error} actionLabel="Tentar novamente" onAction={load} />
                ) : isLoading ? (
                  <div className="d-grid gap-3">
                    <Skeleton height={18} width="45%" />
                    <Skeleton height={280} width="100%" radius={16} />
                  </div>
                ) : masterPanelErrors.revenue ? (
                  <EmptyState title="Falha ao carregar receita" description={masterPanelErrors.revenue} actionLabel="Tentar novamente" onAction={load} />
                ) : revenueSeries.length === 0 ? (
                  <EmptyState title="Sem dados" description="Ainda nao existe historico de receita." actionLabel="Atualizar" onAction={load} />
                ) : (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={revenueChartData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#c8d8fa', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                        <YAxis yAxisId="left" tick={{ fill: '#c8d8fa', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fill: '#c8d8fa', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(10, 16, 34, 0.95)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, color: '#e9f0ff' }}
                          labelStyle={{ color: '#e9f0ff' }}
                          formatter={(v, name) => {
                            if (name === 'growth_pct') return [`${v}%`, 'Crescimento (MoM)'];
                            if (name === 'revenue_yoy') return [formatMoney(v), 'YoY'];
                            return [formatMoney(v), 'Receita'];
                          }}
                        />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#4f8cff" strokeWidth={3} dot={false} />
                        <Line yAxisId="left" type="monotone" dataKey="revenue_yoy" stroke="rgba(255,255,255,0.35)" strokeDasharray="5 5" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="growth_pct" stroke="#f4c95d" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {!isLoading && master ? (
                  <p className="text-secondary mt-2 mb-0">
                    Este mes: <strong>{formatMoney(master.revenue_paid_this_month)}</strong> · Mes anterior: <strong>{formatMoney(master.revenue_paid_last_month)}</strong>
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card tf-card h-100">
              <div className="card-body d-grid gap-3">
                <h5>Atividade recente</h5>
                {isLoading ? (
                  <SkeletonLines lines={7} />
                ) : masterPanelErrors.activity ? (
                  <EmptyState title="Falha ao carregar atividade" description={masterPanelErrors.activity} actionLabel="Tentar novamente" onAction={load} />
                ) : activity.length === 0 ? (
                  <EmptyState title="Sem atividade" description="Quando houver eventos, eles aparecem aqui." actionLabel="Atualizar" onAction={load} />
                ) : (
                  <ul className="tf-mini-list mb-0">
                    {activity.map((a, idx) => (
                      <li key={`${a.type}-${idx}`}>
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <div>
                            <div className="fw-semibold">{a.title}</div>
                            <div className="text-secondary small">{a.subtitle}</div>
                          </div>
                          <div className="text-secondary small" style={{ whiteSpace: 'nowrap' }}>
                            {formatDatetime(a.happened_at)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card tf-card">
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-lg-7">
                    <h5 className="mb-3">Retencao e performance do ecossistema</h5>
                    {isLoading ? (
                      <SkeletonLines lines={6} />
                    ) : masterPanelErrors.insights ? (
                      <EmptyState title="Falha ao carregar insights" description={masterPanelErrors.insights} actionLabel="Tentar novamente" onAction={load} />
                    ) : (
                      <ul className="tf-mini-list mb-0">
                        <li>
                          <strong>MRR previsto:</strong> {formatMoney(insights?.revenue?.mrr || 0)}
                        </li>
                        <li>
                          <strong>Receita acumulada anual:</strong> {formatMoney(insights?.revenue?.annual_accumulated || 0)}
                        </li>
                        <li>
                          <strong>Receita por tipo:</strong> Personal {formatMoney(insights?.revenue?.by_type?.personal || 0)} · Ginasio {formatMoney(insights?.revenue?.by_type?.gym || 0)}
                        </li>
                        <li>
                          <strong>Churn mensal:</strong> {insights?.retention?.churn_rate_pct || 0}% · <strong>Inadimplencia media:</strong> {insights?.retention?.delinquency_rate_pct || 0}%
                        </li>
                        <li>
                          <strong>Alunos ativos globais:</strong> {insights?.ecosystem?.active_students_total || 0} · <strong>Retencao media:</strong> {insights?.ecosystem?.avg_retention_pct || 0}%
                        </li>
                        <li>
                          <strong>Frequencia media global:</strong> {insights?.ecosystem?.avg_weekly_attendance || 0} · <strong>Engajamento desafios:</strong> {insights?.ecosystem?.challenge_engagement_pct || 0}%
                        </li>
                      </ul>
                    )}
                  </div>
                  <div className="col-lg-5">
                    <h5 className="mb-3">Alertas inteligentes</h5>
                    {isLoading ? (
                      <SkeletonLines lines={5} />
                    ) : masterPanelErrors.insights ? (
                      <EmptyState title="Falha ao carregar alertas" description={masterPanelErrors.insights} actionLabel="Tentar novamente" onAction={load} />
                    ) : !insights?.alerts?.length ? (
                      <EmptyState title="Sem alertas criticos" description="O ecossistema esta estavel neste momento." actionLabel="Atualizar" onAction={load} />
                    ) : (
                      <ul className="tf-mini-list mb-0">
                        {insights.alerts.map((alert, idx) => (
                          <li key={`${alert.type}-${idx}`}>
                            <div className="fw-semibold">{alert.title}</div>
                            <div className="text-secondary small">{alert.detail}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="col-lg-7">
            <div className="card tf-card h-100">
              <div className="card-body">
                <h5>Clientes e servicos</h5>

                {error ? (
                  <EmptyState title="Falha ao carregar" description={error} actionLabel="Tentar novamente" onAction={load} />
                ) : isLoading ? (
                  <div className="d-grid gap-3">
                    <Skeleton height={18} width="45%" />
                    <Skeleton height={280} width="100%" radius={16} />
                  </div>
                ) : clients.length === 0 && serviceRequests.length === 0 ? (
                  <EmptyState title="Sem dados operacionais" description="Cadastre clientes e servicos para acompanhar a operacao." actionLabel="Atualizar" onAction={load} />
                ) : (
                  <div className="d-grid gap-3">
                    <div className="row g-2">
                      <div className="col-sm-3">
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="text-secondary small">Clientes</div>
                          <div className="h4 mb-0">{operationalSummary.totalClients}</div>
                        </div>
                      </div>
                      <div className="col-sm-3">
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="text-secondary small">Pagos</div>
                          <div className="h4 mb-0">{operationalSummary.paidClients}</div>
                        </div>
                      </div>
                      <div className="col-sm-3">
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="text-secondary small">Pendentes</div>
                          <div className="h4 mb-0">{operationalSummary.pendingClients}</div>
                        </div>
                      </div>
                      <div className="col-sm-3">
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="text-secondary small">Pedidos abertos</div>
                          <div className="h4 mb-0">{operationalSummary.openRequests}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-secondary mb-2">Pedidos recentes de servico</h6>
                      {serviceRequests.length === 0 ? (
                        <p className="text-secondary mb-0">Sem pedidos recentes.</p>
                      ) : (
                        <ul className="tf-mini-list mb-0">
                          {serviceRequests.slice(0, 6).map((request) => {
                            const status = requestStatusMeta(request.status);
                            return (
                              <li key={request.id}>
                                <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                                  <div>
                                    <div className="fw-semibold">{request.service_name}</div>
                                    <div className="text-secondary small">
                                      {request.requested_by_name || 'Cliente'} · {request.notes || 'Sem notas'}
                                    </div>
                                  </div>
                                  <span className={status.className}>{status.label}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card tf-card h-100">
              <div className="card-body d-grid gap-3">
                <h5>Indicadores e inteligencia</h5>
                {isLoading ? (
                  <SkeletonLines lines={8} />
                ) : (
                  <>
                    <ProgressBar value={weeklyFrequencyPct || weeklyGoal} label="Frequencia media semanal" />
                    <ProgressBar value={challengeEngagementPct || Math.min(100, ((metrics.total_points || 0) / 200) * 100)} label="Engajamento em desafios" />
                    <ProgressBar value={monthlyGoalPct || Math.min(100, ((metrics.total_calories || 0) / 2500) * 100)} label="Meta mensal cumprida" />

                    <ul className="tf-mini-list mb-0">
                      {(insights?.intelligence?.low_frequency_students || []).slice(0, 3).map((s) => (
                        <li key={`low-${s.id}`}>
                          <strong>Alerta de frequencia:</strong> {s.full_name}
                        </li>
                      ))}
                      {(insights?.intelligence?.payment_due_students || []).slice(0, 3).map((s) => (
                        <li key={`pay-${s.id}`}>
                          <strong>Pagamento em risco:</strong> {s.full_name}
                        </li>
                      ))}
                    </ul>

                    {isGym && insights?.gym ? (
                      <ul className="tf-mini-list mb-0">
                        {insights.gym.best_personal_retention ? (
                          <li>
                            <strong>Melhor retencao:</strong> {insights.gym.best_personal_retention.full_name} ({insights.gym.best_personal_retention.retention_pct}%)
                          </li>
                        ) : null}
                        {insights.gym.best_personal_revenue ? (
                          <li>
                            <strong>Maior receita estimada:</strong> {insights.gym.best_personal_revenue.full_name} ({formatMoney(insights.gym.best_personal_revenue.revenue_estimate)})
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
