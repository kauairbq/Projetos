import { useCallback, useEffect, useState } from 'react';

import EmptyState from '../components/EmptyState';
import { SkeletonLines } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

function paymentToText(paymentInfo) {
  if (!paymentInfo) return '';
  if (typeof paymentInfo === 'string') return paymentInfo;
  return JSON.stringify(paymentInfo);
}

function targetScopeLabel(scope) {
  const value = String(scope || '').toUpperCase();
  if (value === 'GYM') return 'Ginásio';
  if (value === 'BOTH') return 'Ginásio + Personal';
  return 'Personal';
}

export default function Settings({ user, onUserUpdate }) {
  const toast = useToast();

  const [form, setForm] = useState({
    fullName: user.full_name || user.name || '',
    birthDate: user.birth_date ? String(user.birth_date).slice(0, 10) : '',
    address: user.address || '',
    paymentInfo: paymentToText(user.payment_info),
    mode: user.mode || 'online'
  });

  const [history, setHistory] = useState({ workouts: [], requests: [], tickets: [], feedback: [] });
  const [supportForm, setSupportForm] = useState({ subject: '', message: '', targetScope: 'PERSONAL' });

  const [isSaving, setIsSaving] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isTicketSending, setIsTicketSending] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const { data } = await api.get('/users/me/history');
      setHistory(data?.data || { workouts: [], requests: [], tickets: [], feedback: [] });
    } catch {
      toast.push({ type: 'error', title: 'Falha', message: 'Nao foi possivel carregar o historico.' });
    } finally {
      setIsHistoryLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHistory().catch(() => null);
  }, [loadHistory]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const parsedPayment = form.paymentInfo ? JSON.parse(form.paymentInfo) : null;
      const { data } = await api.patch('/users/me', {
        fullName: form.fullName,
        birthDate: form.birthDate || null,
        address: form.address || null,
        paymentInfo: parsedPayment,
        mode: form.mode
      });

      if (!data?.ok) throw new Error(data?.error || 'Falha ao guardar dados');

      onUserUpdate(data.data);
      localStorage.setItem('trainforge_user', JSON.stringify(data.data));
      toast.push({ type: 'success', title: 'Perfil atualizado', message: 'Os seus dados foram guardados.' });
    } catch (err) {
      toast.push({
        type: 'error',
        title: 'Erro',
        message: err?.message || 'Erro ao atualizar perfil. Em paymentInfo use JSON valido.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const createSupportTicket = async (e) => {
    e.preventDefault();
    if (!supportForm.subject || !supportForm.message) return;

    setIsTicketSending(true);
    try {
      await api.post('/users/me/support', supportForm);
      setSupportForm((prev) => ({ subject: '', message: '', targetScope: prev.targetScope || 'PERSONAL' }));
      toast.push({ type: 'success', title: 'Ticket enviado', message: 'A sua solicitacao foi registada.' });
      await loadHistory();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel enviar o ticket.' });
    } finally {
      setIsTicketSending(false);
    }
  };

  return (
    <section className="row g-4">
      <div className="col-12 col-xl-7">
        <div className="card tf-card">
          <div className="card-body">
            <h3>Area do cliente</h3>
            <p className="text-secondary mb-4">
              Atualize nome completo, data de nascimento, morada e informacoes de pagamento.
            </p>

            <form className="row g-3" onSubmit={saveProfile}>
              <div className="col-md-6">
                <label className="form-label">Nome completo</label>
                <input
                  className="form-control"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Data de nascimento</label>
                <input
                  className="form-control"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Morada</label>
                <input
                  className="form-control"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tipo de aluno</label>
                <select
                  className="form-select"
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                >
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Informacoes de pagamento (JSON)</label>
                <textarea
                  rows="2"
                  className="form-control"
                  value={form.paymentInfo}
                  onChange={(e) => setForm({ ...form, paymentInfo: e.target.value })}
                />
              </div>
              <div className="col-12 d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? 'A guardar...' : 'Guardar dados'}
                </button>
                <button className="btn btn-outline-light" type="button" onClick={loadHistory} disabled={isHistoryLoading}>
                  {isHistoryLoading ? 'A atualizar...' : 'Atualizar historico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-5">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5>Suporte</h5>
            <p className="text-secondary">Abra solicitacoes diretamente pela area do cliente.</p>
            <form className="d-grid gap-2" onSubmit={createSupportTicket}>
              <input
                className="form-control"
                placeholder="Assunto"
                value={supportForm.subject}
                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
              />
              <select
                className="form-select"
                value={supportForm.targetScope}
                onChange={(e) => setSupportForm({ ...supportForm, targetScope: e.target.value })}
              >
                <option value="PERSONAL">Direcionar para Personal</option>
                <option value="GYM">Direcionar para Ginásio</option>
                <option value="BOTH">Aula PT: Ginásio + Personal</option>
              </select>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Mensagem"
                value={supportForm.message}
                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
              />
              <button className="btn btn-primary" type="submit" disabled={isTicketSending}>
                {isTicketSending ? 'A enviar...' : 'Enviar suporte'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <h5 className="mb-0">Historico</h5>
              <button className="btn btn-outline-light btn-sm" type="button" onClick={loadHistory} disabled={isHistoryLoading}>
                Atualizar
              </button>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-lg-4">
                <h6 className="text-secondary">Servicos</h6>
                {isHistoryLoading ? (
                  <SkeletonLines lines={5} />
                ) : history.requests.length === 0 ? (
                  <EmptyState title="Sem servicos" description="Ainda nao existem solicitacoes." />
                ) : (
                  <ul className="tf-mini-list">
                    {history.requests.map((item) => (
                      <li key={item.id}>
                        {item.service_name} - <strong>{item.status}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-lg-4">
                <h6 className="text-secondary">Treinos</h6>
                {isHistoryLoading ? (
                  <SkeletonLines lines={5} />
                ) : history.workouts.length === 0 ? (
                  <EmptyState title="Sem treinos" description="Registe treinos para ver historico e ranking." />
                ) : (
                  <ul className="tf-mini-list">
                    {history.workouts.map((item) => (
                      <li key={item.id}>
                        {item.title} - {item.points} pts
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-lg-4">
                <h6 className="text-secondary">Suporte</h6>
                {isHistoryLoading ? (
                  <SkeletonLines lines={5} />
                ) : history.tickets.length === 0 ? (
                  <EmptyState title="Sem tickets" description="Quando abrir tickets, o estado aparece aqui." />
                ) : (
                  <ul className="tf-mini-list">
                    {history.tickets.map((item) => (
                      <li key={item.id}>
                        {item.subject} - <strong>{item.status}</strong>
                        <div className="small text-secondary mt-1">
                          Encaminhado para: {targetScopeLabel(item.target_scope)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
