import { useCallback, useEffect, useMemo, useState } from 'react';

import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

function canManage(role) {
  return role === 'admin' || role === 'trainer';
}

function targetScopeLabel(scope) {
  const value = String(scope || '').toUpperCase();
  if (value === 'GYM') return 'Ginásio';
  if (value === 'BOTH') return 'Ginásio + Personal';
  return 'Personal';
}

export default function Tickets({ user }) {
  const toast = useToast();
  const isManager = useMemo(() => canManage(user.role), [user.role]);

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    subject: '',
    message: '',
    category: 'QUESTION',
    priority: 'MEDIUM',
    targetScope: 'PERSONAL'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/support/tickets');
      setTickets(res.data?.data || []);
    } catch {
      setError('Nao foi possivel carregar os tickets.');
      toast.push({ type: 'error', title: 'Falha', message: 'Nao foi possivel carregar Tickets.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const createTicket = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;

    setIsSubmitting(true);
    try {
      await api.post('/support/tickets', form);
      setForm((prev) => ({
        subject: '',
        message: '',
        category: 'QUESTION',
        priority: 'MEDIUM',
        targetScope: prev.targetScope || 'PERSONAL'
      }));
      toast.push({ type: 'success', title: 'Ticket criado', message: 'A sua solicitacao foi registada.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel criar o ticket.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (ticketId, status) => {
    try {
      await api.patch(`/support/tickets/${ticketId}/status`, { status });
      toast.push({ type: 'success', title: 'Estado atualizado', message: `Novo estado: ${status}` });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel atualizar o estado.' });
    }
  };

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <div>
                <h3 className="mb-1">Tickets</h3>
                <p className="text-secondary mb-0">Suporte com historico e controlo de estado.</p>
              </div>
              <button className="btn btn-outline-light" type="button" onClick={load} disabled={isLoading}>
                {isLoading ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-5">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5>Abrir ticket</h5>
            <p className="text-secondary">Descreva o assunto e a mensagem. A equipa responde por aqui.</p>

            <form className="d-grid gap-2" onSubmit={createTicket}>
              <input
                className="form-control"
                placeholder="Assunto"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <textarea
                className="form-control"
                rows="5"
                placeholder="Mensagem"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <div className="row g-2">
                <div className="col-12">
                  <label className="form-label text-secondary mb-1">Direcionar para</label>
                  <select
                    className="form-select"
                    value={form.targetScope}
                    onChange={(e) => setForm({ ...form, targetScope: e.target.value })}
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="GYM">Ginásio</option>
                    <option value="BOTH">Ginásio + Personal (Aula PT)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary mb-1">Categoria</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="BUG">BUG</option>
                    <option value="BILLING">BILLING</option>
                    <option value="FEATURE">FEATURE</option>
                    <option value="QUESTION">QUESTION</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary mb-1">Prioridade</label>
                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'A enviar...' : 'Enviar ticket'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-7">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5>Historico</h5>

            <DataTable
              columns={[
                { key: 'subject', header: 'Assunto', render: (t) => <span className="fw-semibold">{t.subject}</span> },
                { key: 'status', header: 'Estado', render: (t) => <StatusBadge status={t.status} /> },
                {
                  key: 'target_scope',
                  header: 'Destino',
                  render: (t) => <StatusBadge status={t.target_scope} label={targetScopeLabel(t.target_scope)} />
                },
                { key: 'priority', header: 'Prioridade', render: (t) => <StatusBadge status={t.priority} /> },
                ...(isManager
                  ? [
                      {
                        key: 'client',
                        header: 'Cliente',
                        render: (t) => (
                          <>
                            {t.full_name || '-'}
                            <div className="text-secondary small">{t.email || ''}</div>
                          </>
                        )
                      },
                      {
                        key: 'actions',
                        header: 'Acoes',
                        render: (t) => (
                          <select
                            className="form-select form-select-sm"
                            value={t.status}
                            onChange={(e) => updateStatus(t.id, e.target.value)}
                          >
                            <option value="open">open</option>
                            <option value="in_progress">in_progress</option>
                            <option value="resolved">resolved</option>
                            <option value="closed">closed</option>
                          </select>
                        )
                      }
                    ]
                  : [])
              ]}
              rows={tickets}
              isLoading={isLoading}
              error={error}
              onRetry={load}
              emptyTitle="Sem tickets"
              emptyDescription="Quando existir historico de suporte, ele aparece aqui."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
