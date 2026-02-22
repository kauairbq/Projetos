import { useCallback, useEffect, useMemo, useState } from 'react';

import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { SkeletonLines } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

const TICKET_STATUS_OPTIONS = ['ALL', 'open', 'in_progress', 'resolved', 'closed'];
const PLAN_OPTIONS = ['PERSONAL_SOLO', 'GYM_SMALL', 'GYM_PRO'];

function sanitizeSlug(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDateTime(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('pt-PT');
  } catch {
    return '-';
  }
}

function formatMoney(value, currency = 'EUR') {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function parseEventMeta(meta) {
  if (!meta) return '';
  if (typeof meta === 'object') return JSON.stringify(meta);
  try {
    return JSON.stringify(JSON.parse(meta));
  } catch {
    return String(meta);
  }
}

export default function Admin() {
  const toast = useToast();

  const [overview, setOverview] = useState(null);
  const [activities, setActivities] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  const [overviewError, setOverviewError] = useState('');
  const [tenantsError, setTenantsError] = useState('');
  const [ticketsError, setTicketsError] = useState('');
  const [activityError, setActivityError] = useState('');

  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL');

  const [newTenantForm, setNewTenantForm] = useState({
    type: 'PERSONAL',
    name: '',
    slug: '',
    email: '',
    phone: '',
    status: 'TRIAL',
    planCode: 'PERSONAL_SOLO'
  });
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTicketMessages, setSelectedTicketMessages] = useState([]);
  const [selectedTicketEvents, setSelectedTicketEvents] = useState([]);
  const [isLoadingTicketTimeline, setIsLoadingTicketTimeline] = useState(false);
  const [timelineError, setTimelineError] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [isRunningBillingCycle, setIsRunningBillingCycle] = useState(false);

  const loadOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    setOverviewError('');
    try {
      const res = await api.get('/admin/overview?scope=master');
      setOverview(res.data?.data || null);
    } catch (err) {
      setOverviewError(err?.response?.data?.message || 'Nao foi possivel carregar o overview do admin.');
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  const loadTenants = useCallback(async () => {
    setIsLoadingTenants(true);
    setTenantsError('');
    try {
      const res = await api.get('/tenants');
      setTenants(res.data?.data || []);
    } catch (err) {
      setTenantsError(err?.response?.data?.message || 'Nao foi possivel carregar os clientes.');
    } finally {
      setIsLoadingTenants(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    setTicketsError('');
    try {
      const params = {};
      if (ticketStatusFilter !== 'ALL') params.status = ticketStatusFilter;
      params.limit = 120;
      const res = await api.get('/admin/tickets', { params });
      const list = res.data?.data || [];
      setTickets(list);
      if (list.length === 0) {
        setSelectedTicketId(null);
        setSelectedTicket(null);
        setSelectedTicketMessages([]);
        setSelectedTicketEvents([]);
      } else {
        setSelectedTicketId((prev) => {
          if (prev && list.some((item) => item.id === prev)) return prev;
          return list[0].id;
        });
      }
    } catch (err) {
      setTicketsError(err?.response?.data?.message || 'Nao foi possivel carregar chamados do sistema.');
    } finally {
      setIsLoadingTickets(false);
    }
  }, [ticketStatusFilter]);

  const loadActivity = useCallback(async () => {
    setIsLoadingActivity(true);
    setActivityError('');
    try {
      const res = await api.get('/admin/activity?limit=10');
      setActivities(res.data?.data || []);
    } catch (err) {
      setActivityError(err?.response?.data?.message || 'Nao foi possivel carregar atividade recente.');
    } finally {
      setIsLoadingActivity(false);
    }
  }, []);

  const loadTicketTimeline = useCallback(async (ticketId) => {
    if (!ticketId) return;
    setIsLoadingTicketTimeline(true);
    setTimelineError('');
    try {
      const res = await api.get(`/admin/tickets/${ticketId}/timeline`);
      const data = res.data?.data || {};
      setSelectedTicket(data.ticket || null);
      setSelectedTicketMessages(data.messages || []);
      setSelectedTicketEvents(data.events || []);
    } catch (err) {
      setTimelineError(err?.response?.data?.message || 'Nao foi possivel carregar o detalhe do chamado.');
      setSelectedTicket(null);
      setSelectedTicketMessages([]);
      setSelectedTicketEvents([]);
    } finally {
      setIsLoadingTicketTimeline(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadOverview(), loadTenants(), loadTickets(), loadActivity()]);
  }, [loadOverview, loadTenants, loadTickets, loadActivity]);

  useEffect(() => {
    Promise.all([loadOverview(), loadTenants(), loadActivity()]).catch(() => null);
  }, [loadOverview, loadTenants, loadActivity]);

  useEffect(() => {
    loadTickets().catch(() => null);
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicketId) return;
    loadTicketTimeline(selectedTicketId).catch(() => null);
  }, [selectedTicketId, loadTicketTimeline]);

  const kpis = useMemo(() => {
    if (!overview) return [];
    return [
      { label: 'Clientes totais', value: overview.tenants_total ?? 0 },
      { label: 'Clientes ativos/trial', value: overview.tenants_active ?? 0 },
      { label: 'Receita mes', value: formatMoney(overview.revenue_paid_this_month, 'EUR') },
      { label: 'Tickets abertos', value: overview.open_tickets ?? 0 },
      { label: 'Faturas pendentes', value: overview.pending_invoices ?? 0 },
      { label: 'Faturas em atraso', value: overview.overdue_invoices ?? 0 },
      { label: 'Crescimento mensal', value: `${overview.revenue_growth_pct ?? 0}%` }
    ];
  }, [overview]);

  const createTenant = async (event) => {
    event.preventDefault();
    const payload = {
      ...newTenantForm,
      slug: sanitizeSlug(newTenantForm.slug || newTenantForm.name)
    };

    if (!payload.name || !payload.slug) {
      toast.push({ type: 'error', title: 'Dados invalidos', message: 'Nome e slug sao obrigatorios.' });
      return;
    }

    setIsCreatingTenant(true);
    try {
      await api.post('/tenants', payload);
      toast.push({ type: 'success', title: 'Cliente criado', message: 'Novo cliente registado com sucesso.' });
      setNewTenantForm((prev) => ({
        ...prev,
        name: '',
        slug: '',
        email: '',
        phone: ''
      }));
      await loadTenants();
      await loadOverview();
    } catch (err) {
      const message = err?.response?.data?.message || 'Nao foi possivel criar cliente.';
      toast.push({ type: 'error', title: 'Erro ao criar cliente', message });
    } finally {
      setIsCreatingTenant(false);
    }
  };

  const sendTicketReply = async () => {
    const message = String(replyMessage || '').trim();
    if (!selectedTicketId || !message) return;

    setIsReplying(true);
    try {
      await api.post(`/admin/tickets/${selectedTicketId}/reply`, { message });
      setReplyMessage('');
      toast.push({ type: 'success', title: 'Resposta enviada', message: 'Chamado atualizado com a sua resposta.' });
      await loadTicketTimeline(selectedTicketId);
      await loadTickets();
      await loadActivity();
    } catch (err) {
      toast.push({
        type: 'error',
        title: 'Falha ao responder',
        message: err?.response?.data?.message || 'Nao foi possivel enviar a resposta.'
      });
    } finally {
      setIsReplying(false);
    }
  };

  const updateTicketStatus = async (nextStatus) => {
    if (!selectedTicketId || !nextStatus) return;

    setIsUpdatingStatus(true);
    try {
      await api.patch(`/admin/tickets/${selectedTicketId}/status`, { status: nextStatus });
      toast.push({ type: 'success', title: 'Status atualizado', message: `Chamado alterado para ${nextStatus}.` });
      await loadTicketTimeline(selectedTicketId);
      await loadTickets();
      await loadActivity();
      await loadOverview();
    } catch (err) {
      toast.push({
        type: 'error',
        title: 'Falha ao atualizar',
        message: err?.response?.data?.message || 'Nao foi possivel alterar o status.'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const runBillingCycle = async () => {
    setIsRunningBillingCycle(true);
    try {
      await api.post('/admin/billing/run-cycle');
      toast.push({ type: 'success', title: 'Ciclo executado', message: 'Ciclo de faturacao processado com sucesso.' });
      await loadOverview();
      await loadActivity();
      await loadTenants();
    } catch (err) {
      toast.push({
        type: 'error',
        title: 'Erro no ciclo',
        message: err?.response?.data?.message || 'Nao foi possivel executar o ciclo de billing.'
      });
    } finally {
      setIsRunningBillingCycle(false);
    }
  };

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <div>
                <h3 className="mb-1">Painel Master Admin</h3>
                <p className="text-secondary mb-0">
                  Gestao central do SaaS: clientes, chamados globais, atualizacoes operacionais e faturacao.
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-outline-light" type="button" onClick={refreshAll}>
                  Atualizar tudo
                </button>
                <button className="btn btn-primary" type="button" onClick={runBillingCycle} disabled={isRunningBillingCycle}>
                  {isRunningBillingCycle ? 'A processar...' : 'Executar ciclo billing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="row g-3">
          {isLoadingOverview ? (
            <div className="col-12">
              <div className="card tf-card">
                <div className="card-body">
                  <SkeletonLines lines={4} />
                </div>
              </div>
            </div>
          ) : overviewError ? (
            <div className="col-12">
              <EmptyState title="Falha no overview" description={overviewError} actionLabel="Tentar novamente" onAction={loadOverview} />
            </div>
          ) : (
            kpis.map((item) => (
              <div className="col-12 col-md-6 col-xl-3" key={item.label}>
                <div className="card tf-card h-100">
                  <div className="card-body d-grid gap-2">
                    <h6 className="tf-kpi-label mb-0">{item.label}</h6>
                    <h2 className="tf-kpi-value mb-0">{item.value}</h2>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="col-12 col-xl-5">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5 className="mb-1">Adicionar novo cliente</h5>
            <p className="text-secondary mb-3">Criar novos tenants (personal ou ginasio) com plano inicial.</p>

            <form className="d-grid gap-2" onSubmit={createTenant}>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label text-secondary mb-1">Tipo</label>
                  <select
                    className="form-select"
                    value={newTenantForm.type}
                    onChange={(e) => setNewTenantForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="PERSONAL">PERSONAL</option>
                    <option value="GYM">GYM</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary mb-1">Status</label>
                  <select
                    className="form-select"
                    value={newTenantForm.status}
                    onChange={(e) => setNewTenantForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="TRIAL">TRIAL</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <input
                className="form-control"
                placeholder="Nome do cliente"
                value={newTenantForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewTenantForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug ? prev.slug : sanitizeSlug(name)
                  }));
                }}
              />
              <input
                className="form-control"
                placeholder="Slug"
                value={newTenantForm.slug}
                onChange={(e) => setNewTenantForm((prev) => ({ ...prev, slug: sanitizeSlug(e.target.value) }))}
              />

              <div className="row g-2">
                <div className="col-6">
                  <input
                    className="form-control"
                    placeholder="Email"
                    value={newTenantForm.email}
                    onChange={(e) => setNewTenantForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="col-6">
                  <input
                    className="form-control"
                    placeholder="Telefone"
                    value={newTenantForm.phone}
                    onChange={(e) => setNewTenantForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-secondary mb-1">Plano inicial</label>
                <select
                  className="form-select"
                  value={newTenantForm.planCode}
                  onChange={(e) => setNewTenantForm((prev) => ({ ...prev, planCode: e.target.value }))}
                >
                  {PLAN_OPTIONS.map((plan) => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" type="submit" disabled={isCreatingTenant}>
                {isCreatingTenant ? 'A criar...' : 'Criar cliente'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-7">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5 className="mb-1">Clientes registados</h5>
            <p className="text-secondary mb-3">Visao global dos clientes e situacao de assinatura.</p>
            <DataTable
              columns={[
                { key: 'name', header: 'Cliente', render: (row) => <span className="fw-semibold">{row.name}</span> },
                { key: 'type', header: 'Tipo' },
                { key: 'tenant_status', header: 'Tenant', render: (row) => <StatusBadge status={row.tenant_status} /> },
                { key: 'subscription_status', header: 'Subscricao', render: (row) => <StatusBadge status={row.subscription_status} /> },
                { key: 'plan_code', header: 'Plano', render: (row) => row.plan_code || '-' },
                { key: 'current_period_end', header: 'Fim periodo', render: (row) => formatDateTime(row.current_period_end) }
              ]}
              rows={tenants}
              isLoading={isLoadingTenants}
              error={tenantsError}
              onRetry={loadTenants}
              emptyTitle="Sem clientes"
              emptyDescription="Ainda nao existem clientes registados."
            />
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-3">
              <div>
                <h5 className="mb-1">Chamados globais</h5>
                <p className="text-secondary mb-0">Visualizar, responder e atualizar tickets de todos os clientes.</p>
              </div>
              <select
                className="form-select"
                style={{ width: 220 }}
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
              >
                {TICKET_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'Todos os estados' : status}
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-3">
              <div className="col-12 col-xl-7">
                <DataTable
                  columns={[
                    { key: 'id', header: '#', render: (row) => row.id },
                    { key: 'tenant_name', header: 'Cliente', render: (row) => row.tenant_name || '-' },
                    { key: 'subject', header: 'Assunto', render: (row) => <span className="fw-semibold">{row.subject}</span> },
                    { key: 'priority', header: 'Prioridade', render: (row) => <StatusBadge status={row.priority} /> },
                    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                    {
                      key: 'open',
                      header: 'Abrir',
                      render: (row) => (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          onClick={() => setSelectedTicketId(row.id)}
                        >
                          Detalhe
                        </button>
                      )
                    }
                  ]}
                  rows={tickets}
                  isLoading={isLoadingTickets}
                  error={ticketsError}
                  onRetry={loadTickets}
                  emptyTitle="Sem chamados"
                  emptyDescription="Nao existem tickets para o filtro selecionado."
                />
              </div>

              <div className="col-12 col-xl-5">
                <div className="card tf-card h-100">
                  <div className="card-body d-grid gap-3">
                    {!selectedTicketId ? (
                      <EmptyState title="Selecione um chamado" description="Clique em Detalhe para abrir um ticket." actionLabel="" />
                    ) : isLoadingTicketTimeline ? (
                      <SkeletonLines lines={7} />
                    ) : timelineError ? (
                      <EmptyState title="Falha ao abrir chamado" description={timelineError} actionLabel="Tentar novamente" onAction={() => loadTicketTimeline(selectedTicketId)} />
                    ) : (
                      <>
                        <div>
                          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                            <h6 className="mb-0">#{selectedTicket?.id} - {selectedTicket?.subject || '-'}</h6>
                            <StatusBadge status={selectedTicket?.status} />
                          </div>
                          <p className="text-secondary mb-0 mt-1">
                            Cliente: {selectedTicket?.tenant_name || '-'} ({selectedTicket?.tenant_slug || '-'})
                          </p>
                        </div>

                        <div className="d-grid gap-2">
                          <label className="form-label text-secondary mb-0">Atualizar status</label>
                          <div className="d-flex gap-2">
                            <select
                              className="form-select"
                              value={selectedTicket?.status || 'open'}
                              onChange={(e) => updateTicketStatus(e.target.value)}
                              disabled={isUpdatingStatus}
                            >
                              <option value="open">open</option>
                              <option value="in_progress">in_progress</option>
                              <option value="resolved">resolved</option>
                              <option value="closed">closed</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="form-label text-secondary mb-1">Responder chamado</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Digite a resposta para o cliente"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-primary mt-2"
                            onClick={sendTicketReply}
                            disabled={isReplying || !String(replyMessage || '').trim()}
                          >
                            {isReplying ? 'A enviar...' : 'Enviar resposta'}
                          </button>
                        </div>

                        <div>
                          <h6 className="mb-2">Timeline</h6>
                          {selectedTicketMessages.length === 0 && selectedTicketEvents.length === 0 ? (
                            <p className="text-secondary mb-0">Sem historico para este chamado.</p>
                          ) : (
                            <ul className="tf-mini-list mb-0">
                              {selectedTicketMessages.map((msg) => (
                                <li key={`m-${msg.id}`}>
                                  <div className="d-flex align-items-center justify-content-between gap-2">
                                    <strong>{msg.author_type}</strong>
                                    <small className="text-secondary">{formatDateTime(msg.created_at)}</small>
                                  </div>
                                  <div className="text-secondary">{msg.message}</div>
                                </li>
                              ))}
                              {selectedTicketEvents.map((event) => (
                                <li key={`e-${event.id}`}>
                                  <div className="d-flex align-items-center justify-content-between gap-2">
                                    <strong>{event.event_type}</strong>
                                    <small className="text-secondary">{formatDateTime(event.created_at)}</small>
                                  </div>
                                  <div className="text-secondary">{parseEventMeta(event.meta_json)}</div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <h5 className="mb-1">Atividade recente do sistema</h5>
            <p className="text-secondary mb-3">Atualizacoes operacionais para acompanhamento do admin.</p>

            {isLoadingActivity ? (
              <SkeletonLines lines={5} />
            ) : activityError ? (
              <EmptyState title="Falha ao carregar atividade" description={activityError} actionLabel="Tentar novamente" onAction={loadActivity} />
            ) : activities.length === 0 ? (
              <EmptyState title="Sem atividade" description="Ainda nao existem eventos recentes para mostrar." actionLabel="" />
            ) : (
              <ul className="tf-mini-list mb-0">
                {activities.map((item, index) => (
                  <li key={`${item.type || 'event'}-${index}`}>
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <strong>{item.title || 'Evento'}</strong>
                      <StatusBadge status={item.status || 'info'} />
                    </div>
                    <div className="text-secondary">{item.subtitle || '-'}</div>
                    <small className="text-secondary">{formatDateTime(item.happened_at)}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
