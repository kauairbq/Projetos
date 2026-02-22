import { useCallback, useEffect, useMemo, useState } from 'react';

import EmptyState from '../components/EmptyState';
import { SkeletonLines, SkeletonTable } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

export default function Services({ user }) {
  const toast = useToast();

  const [catalog, setCatalog] = useState([]);
  const [requests, setRequests] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [settings, setSettings] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newService, setNewService] = useState({ name: '', description: '' });
  const [requestForm, setRequestForm] = useState({ serviceId: '', notes: '' });
  const [quoteForm, setQuoteForm] = useState({
    userId: '',
    serviceRequestId: '',
    budgetEstimate: '',
    notes: '',
    notificationEmail: '',
    extraServiceRequest: ''
  });

  const isManager = useMemo(() => ['admin', 'trainer'].includes(user.role), [user.role]);
  const isMasterAdmin = user.tenant_role === 'MASTER_ADMIN';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [settingsRes, catalogRes, requestRes, quoteRes] = await Promise.all([
        api.get('/services/settings'),
        api.get(`/services/catalog?activeOnly=${isManager ? 'false' : 'true'}`),
        api.get('/services/requests'),
        api.get('/services/quotes')
      ]);

      const loadedSettings = settingsRes.data?.data || null;
      setSettings(loadedSettings);
      setCatalog(catalogRes.data?.data || []);
      setRequests(requestRes.data?.data || []);
      setQuotes(quoteRes.data?.data || []);

      if (loadedSettings?.notification_email) {
        setQuoteForm((prev) => (
          prev.notificationEmail
            ? prev
            : { ...prev, notificationEmail: loadedSettings.notification_email }
        ));
      }
    } catch {
      setError('Nao foi possivel carregar os servicos.');
    } finally {
      setIsLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const createRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.serviceId) return;

    try {
      await api.post('/services/requests', {
        serviceId: Number(requestForm.serviceId),
        notes: requestForm.notes
      });

      setRequestForm({ serviceId: '', notes: '' });
      toast.push({ type: 'success', title: 'Solicitacao enviada', message: 'O pedido foi registado com sucesso.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel enviar a solicitacao.' });
    }
  };

  const createCatalog = async (e) => {
    e.preventDefault();
    if (!newService.name) return;

    try {
      await api.post('/services/catalog', {
        name: newService.name,
        description: newService.description
      });

      setNewService({ name: '', description: '' });
      toast.push({ type: 'success', title: 'Servico adicionado', message: 'O catalogo foi atualizado.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel adicionar o servico.' });
    }
  };

  const toggleCatalog = async (id, isActive) => {
    try {
      if (!isActive) {
        const confirmed = window.confirm('Tens a certeza que queres desativar este servico?');
        if (!confirmed) return;
      }

      await api.patch(`/services/catalog/${id}/toggle`, { isActive });
      toast.push({ type: 'success', title: 'Atualizado', message: isActive ? 'Servico ativado.' : 'Servico desativado.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel atualizar o catalogo.' });
    }
  };

  const deleteCatalog = async (id) => {
    try {
      const confirmed = window.confirm('Tens a certeza que queres excluir este servico? Esta acao nao pode ser desfeita.');
      if (!confirmed) return;

      await api.delete(`/services/catalog/${id}`);
      toast.push({ type: 'success', title: 'Servico excluido', message: 'O item foi removido do catalogo.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel excluir o servico.' });
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await api.patch(`/services/requests/${id}/status`, { status });
      toast.push({ type: 'success', title: 'Estado atualizado', message: `Novo estado: ${status}` });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel atualizar o estado.' });
    }
  };

  const createQuote = async (e) => {
    e.preventDefault();
    if (!quoteForm.userId) return;

    try {
      await api.post('/services/quotes', {
        userId: Number(quoteForm.userId),
        serviceRequestId: quoteForm.serviceRequestId ? Number(quoteForm.serviceRequestId) : null,
        budgetEstimate: quoteForm.budgetEstimate ? Number(quoteForm.budgetEstimate) : null,
        notes: quoteForm.notes,
        notificationEmail: quoteForm.notificationEmail || null,
        extraServiceRequest: quoteForm.extraServiceRequest || null
      });

      setQuoteForm((prev) => ({
        userId: '',
        serviceRequestId: '',
        budgetEstimate: '',
        notes: '',
        notificationEmail: prev.notificationEmail || '',
        extraServiceRequest: ''
      }));
      toast.push({ type: 'success', title: 'Orcamento emitido', message: 'O orcamento foi registado.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel emitir o orcamento.' });
    }
  };

  const saveNotificationEmail = async () => {
    try {
      await api.patch('/services/settings', { notificationEmail: quoteForm.notificationEmail || null });
      toast.push({ type: 'success', title: 'Email atualizado', message: 'O email de notificacoes foi guardado.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel atualizar o email de notificacoes.' });
    }
  };

  const activeCatalog = useMemo(
    () => catalog.filter((item) => Number(item.is_active) === 1),
    [catalog]
  );

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <h3>Gestao de servicos e projetos</h3>
            <p className="text-secondary mb-0">
              {isMasterAdmin
                ? 'Vista administrativa do tenant atual. Para operacao global use a area Clientes.'
                : 'Solicite servicos, acompanhe estado e gere referencias de treino e orcamentos.'}
            </p>
          </div>
        </div>
      </div>

      {error && !isLoading ? (
        <div className="col-12">
          <EmptyState title="Falha ao carregar" description={error} actionLabel="Tentar novamente" onAction={load} />
        </div>
      ) : null}

      <div className="col-12 col-xl-5">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5>Solicitar servico</h5>

            {isLoading ? (
              <SkeletonLines lines={6} />
            ) : activeCatalog.length === 0 ? (
              <EmptyState
                title="Sem servicos disponiveis"
                description={isManager ? 'Crie itens no catalogo para permitir solicitacoes.' : 'Aguarde a equipa adicionar servicos.'}
                actionLabel="Atualizar"
                onAction={load}
              />
            ) : (
              <form className="d-grid gap-2" onSubmit={createRequest}>
                <select
                  className="form-select"
                  value={requestForm.serviceId}
                  onChange={(e) => setRequestForm({ ...requestForm, serviceId: e.target.value })}
                >
                  <option value="">Selecionar servico</option>
                  {activeCatalog.map((item) => (
                    <option value={item.id} key={item.id}>{item.name}</option>
                  ))}
                </select>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Notas adicionais"
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                />
                <button className="btn btn-primary">Enviar solicitacao</button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-7">
        <div className="card tf-card h-100">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <h5 className="mb-0">Historico e status</h5>
              <button className="btn btn-outline-light btn-sm" type="button" onClick={load}>
                Atualizar
              </button>
            </div>

            <div className="mt-3">
              {isLoading ? (
                <SkeletonTable rows={6} />
              ) : requests.length === 0 ? (
                <EmptyState title="Sem solicitacoes" description="Quando existir historico, ele aparece aqui." />
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Servico</th>
                        <th>Status</th>
                        <th>Notas</th>
                        {isManager ? <th>Acoes</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((row) => (
                        <tr key={row.id}>
                          <td>{row.service_name}</td>
                          <td>{row.status}</td>
                          <td>{row.notes || '-'}</td>
                          {isManager ? (
                            <td style={{ minWidth: 160 }}>
                              <select
                                className="form-select form-select-sm"
                                value={row.status}
                                onChange={(e) => updateRequestStatus(row.id, e.target.value)}
                              >
                                <option value="pending">pending</option>
                                <option value="approved">approved</option>
                                <option value="in_progress">in_progress</option>
                                <option value="completed">completed</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isManager ? (
        <>
          <div className="col-12 col-lg-6">
            <div className="card tf-card h-100">
              <div className="card-body">
                <h5>Catalogo de servicos</h5>

                <form className="d-grid gap-2 mb-3" onSubmit={createCatalog}>
                  <input
                    className="form-control"
                    placeholder="Nome do servico"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  />
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Descricao"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  />
                  <button className="btn btn-primary">Adicionar servico</button>
                </form>

                {isLoading ? (
                  <SkeletonLines lines={6} />
                ) : catalog.length === 0 ? (
                  <EmptyState title="Catalogo vazio" description="Adicione o primeiro servico para iniciar." />
                ) : (
                  <ul className="tf-mini-list mb-0">
                    {catalog.map((item) => (
                      <li key={item.id} className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                        <span>{item.name}</span>
                        <div className="d-flex gap-2 flex-wrap">
                          {Number(item.is_active) === 1 ? (
                            <button
                              className="btn btn-sm btn-warning text-dark"
                              type="button"
                              onClick={() => toggleCatalog(item.id, false)}
                            >
                              Desativar
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-success"
                              type="button"
                              onClick={() => toggleCatalog(item.id, true)}
                            >
                              Ativar
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            type="button"
                            onClick={() => deleteCatalog(item.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card tf-card h-100">
              <div className="card-body">
                <h5>Orcamentos</h5>

                <div className="alert alert-info py-2">
                  Email para receber pedidos de alunos: <strong>{settings?.notification_email || 'nao definido'}</strong>
                </div>

                <form className="row g-2 mb-3" onSubmit={createQuote}>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="ID cliente"
                      value={quoteForm.userId}
                      onChange={(e) => setQuoteForm({ ...quoteForm, userId: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="ID solicitacao"
                      value={quoteForm.serviceRequestId}
                      onChange={(e) => setQuoteForm({ ...quoteForm, serviceRequestId: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Valor"
                      value={quoteForm.budgetEstimate}
                      onChange={(e) => setQuoteForm({ ...quoteForm, budgetEstimate: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email para notificacoes (personal/ginasio)"
                      value={quoteForm.notificationEmail}
                      onChange={(e) => setQuoteForm({ ...quoteForm, notificationEmail: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Notas"
                      value={quoteForm.notes}
                      onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Pedido de novos servicos para equipe TrainForge (opcional)"
                      value={quoteForm.extraServiceRequest}
                      onChange={(e) => setQuoteForm({ ...quoteForm, extraServiceRequest: e.target.value })}
                    />
                  </div>
                  <div className="col-12 d-flex flex-wrap gap-2">
                    <button className="btn btn-outline-light" type="button" onClick={saveNotificationEmail}>
                      Guardar email de notificacoes
                    </button>
                    <button className="btn btn-primary">Emitir orcamento</button>
                  </div>
                </form>

                {isLoading ? (
                  <SkeletonLines lines={6} />
                ) : quotes.length === 0 ? (
                  <EmptyState title="Sem orcamentos" description="Quando emitir orcamentos, eles aparecem aqui." />
                ) : (
                  <ul className="tf-mini-list mb-0">
                    {quotes.map((quote) => (
                      <li key={quote.id}>
                        Cliente #{quote.student_id || '-'} - {quote.status} - {quote.budget_estimate ?? 'n/a'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
