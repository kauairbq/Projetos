import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiCompass, FiFlag, FiUsers, FiCreditCard, FiLifeBuoy } from 'react-icons/fi';

import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { SkeletonLines } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

function onboardingKey(user) {
  const tenantId = user?.tenant_id || 'unknown';
  return `tf_onboarding_done_${tenantId}`;
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('pt-PT');
  } catch {
    return String(value);
  }
}

export default function Onboarding({ user }) {
  const toast = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [studentsCount, setStudentsCount] = useState(0);
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [billing, setBilling] = useState(null);

  const profileOk = useMemo(() => {
    const name = user?.full_name || user?.name;
    return Boolean(name && (user?.address || user?.birth_date));
  }, [user]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [studentsRes, challengesRes, ticketsRes, billingRes] = await Promise.all([
        api.get('/users?role=client').catch(() => ({ data: { data: [] } })),
        api.get('/challenges').catch(() => ({ data: { data: [] } })),
        api.get('/support/tickets').catch(() => ({ data: { data: [] } })),
        api.get('/billing/me').catch(() => ({ data: { data: null } }))
      ]);

      const students = studentsRes.data?.data || [];
      const challenges = challengesRes.data?.data || [];
      const tickets = ticketsRes.data?.data || [];

      setStudentsCount(Array.isArray(students) ? students.length : 0);
      setTicketsCount(Array.isArray(tickets) ? tickets.length : 0);
      setHasActiveChallenge(Boolean(challenges.find((c) => Number(c.is_active) === 1)));
      setBilling(billingRes.data?.data || null);
    } catch {
      setError('Não foi possível carregar o onboarding.');
      toast.push({ type: 'error', title: 'Falha', message: 'Não foi possível carregar o onboarding.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const doneKey = onboardingKey(user);
  const isDone = useMemo(() => localStorage.getItem(doneKey) === '1', [doneKey]);

  const complete = () => {
    localStorage.setItem(doneKey, '1');
    toast.push({ type: 'success', title: 'Onboarding concluído', message: 'Checklist guardado para este tenant.' });
    navigate('/dashboard');
  };

  const startTour = () => {
    const tour = { tenant_id: user?.tenant_id || null, step: 1, started_at: new Date().toISOString() };
    localStorage.setItem('tf_tour', JSON.stringify(tour));
    toast.push({ type: 'info', title: 'Tutorial ativo', message: 'Volte ao Dashboard para seguir o passo a passo.' });
    navigate('/dashboard');
  };

  const subscription = billing?.subscription || null;
  const plan = billing?.plan || null;
  const nextInvoice = billing?.next_invoice || null;

  const steps = [
    {
      id: 'profile',
      icon: FiCheckCircle,
      title: 'Completar perfil do utilizador',
      desc: 'Nome completo, data de nascimento e morada para contexto real de cliente.',
      done: profileOk,
      action: { to: '/settings', label: 'Editar perfil' }
    },
    {
      id: 'students',
      icon: FiUsers,
      title: 'Adicionar o primeiro aluno',
      desc: 'Clientes (presencial + online) num ranking unificado.',
      done: studentsCount > 0,
      meta: `${studentsCount} aluno(s)`,
      action: { to: '/students', label: 'Ver alunos' }
    },
    {
      id: 'challenge',
      icon: FiFlag,
      title: 'Ativar desafio semanal',
      desc: 'Gamificação, pontuação diária e top 3 destacado.',
      done: hasActiveChallenge,
      action: { to: '/challenges', label: 'Gerir desafios' }
    },
    {
      id: 'billing',
      icon: FiCreditCard,
      title: 'Rever plano e assinatura',
      desc: 'Plano atual, status e próxima cobrança.',
      done: Boolean(subscription && plan),
      meta: plan ? `${plan.name} · ${subscription?.status || ''}` : '-',
      action: { to: '/subscription', label: 'Ver assinatura' }
    },
    {
      id: 'support',
      icon: FiLifeBuoy,
      title: 'Abrir o primeiro ticket',
      desc: 'Canal oficial de suporte com histórico e estados.',
      done: ticketsCount > 0,
      meta: `${ticketsCount} ticket(s)`,
      action: { to: '/tickets', label: 'Abrir ticket' }
    }
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="mb-1">Onboarding</h3>
                  <span className="tf-pill">Setup</span>
                </div>
                <p className="text-secondary mb-0">
                  Checklist real para colocar o TrainForge em produção com qualidade de produto.
                </p>
              </div>
              <button className="btn btn-outline-light" type="button" onClick={load} disabled={isLoading}>
                {isLoading ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-8">
        <div className="card tf-card h-100">
          <div className="card-body d-grid gap-3">
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div>
                <h5 className="mb-1">Checklist de setup</h5>
                <div className="text-secondary">
                  Progresso: <strong>{doneCount}/{steps.length}</strong> ({progress}%)
                </div>
              </div>
              {isDone ? <StatusBadge status="active" label="Concluído" /> : <StatusBadge status="trial" label="Em progresso" />}
            </div>

            {error && !isLoading ? (
              <EmptyState title="Falha ao carregar" description={error} actionLabel="Tentar novamente" onAction={load} />
            ) : isLoading ? (
              <SkeletonLines lines={9} />
            ) : (
              <div className="d-grid gap-3">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div className="tf-step" key={step.id}>
                      <div className="tf-step__left">
                        <div className="tf-step__icon" aria-hidden="true">
                          <Icon />
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div className="tf-step__title">{step.title}</div>
                            <StatusBadge status={step.done ? 'active' : 'open'} label={step.done ? 'OK' : 'Pendente'} />
                          </div>
                          <div className="tf-step__desc">{step.desc}</div>
                          {step.meta ? <div className="tf-step__meta">{step.meta}</div> : null}
                        </div>
                      </div>
                      <div className="tf-step__right">
                        <Link className="btn btn-outline-light btn-sm" to={step.action.to}>
                          {step.action.label}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && !error ? (
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" type="button" onClick={complete} disabled={doneCount < 3}>
                  Marcar como concluído
                </button>
                <button className="btn btn-outline-light" type="button" onClick={startTour}>
                  Iniciar tutorial guiado
                </button>
              </div>
            ) : null}

            {!isLoading && !error ? (
              <div className="text-secondary small">
                Sugestão: conclua pelo menos 3 passos antes de marcar como concluído.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-4">
        <div className="card tf-card h-100">
          <div className="card-body d-grid gap-3">
            <h5 className="mb-0">Resumo da assinatura</h5>
            {isLoading ? (
              <SkeletonLines lines={7} />
            ) : subscription && plan ? (
              <>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="text-secondary">Plano</div>
                  <div className="fw-semibold">{plan.name}</div>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="text-secondary">Status</div>
                  <StatusBadge status={subscription.status} />
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="text-secondary">Próxima cobrança</div>
                  <div className="fw-semibold">
                    {nextInvoice?.due_date ? formatDate(nextInvoice.due_date) : formatDate(subscription.current_period_end)}
                  </div>
                </div>
                <Link className="btn btn-outline-light" to="/subscription">
                  Gerir plano
                </Link>
              </>
            ) : (
              <EmptyState
                title="Sem plano ainda"
                description="Crie uma subscrição para ver o estado, próxima cobrança e upgrades."
                actionLabel="Ver assinatura"
                onAction={() => navigate('/subscription')}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

