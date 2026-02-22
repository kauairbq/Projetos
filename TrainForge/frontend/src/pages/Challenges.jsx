import { useCallback, useEffect, useMemo, useState } from 'react';

import ChallengeCard from '../components/ChallengeCard';
import EmptyState from '../components/EmptyState';
import { Skeleton, SkeletonLines } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

async function enrichWithRanking(challenges) {
  const ranked = await Promise.all(
    challenges.map(async (challenge) => {
      try {
        const rankingRes = await api.get(`/challenges/${challenge.id}/ranking?top=3`);
        return { ...challenge, top_three: rankingRes.data?.data || [] };
      } catch {
        return { ...challenge, top_three: [] };
      }
    })
  );
  return ranked;
}

export default function Challenges({ user }) {
  const toast = useToast();

  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    modality: 'Musculacao',
    weeklyTarget: 5,
    pointsPerCompletion: 10,
    pointsLimit: '',
    startsAt: new Date().toISOString().slice(0, 10),
    endsAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  });

  const canManage = useMemo(() => ['admin', 'trainer'].includes(user.role), [user.role]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.get('/challenges');
      const withRanking = await enrichWithRanking(data?.data || []);
      setList(withRanking);
    } catch {
      setError('Nao foi possivel carregar os desafios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      modality: 'Musculacao',
      weeklyTarget: 5,
      pointsPerCompletion: 10,
      pointsLimit: '',
      startsAt: new Date().toISOString().slice(0, 10),
      endsAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    });
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return;

    setIsSubmitting(true);
    try {
      await api.post('/challenges', {
        ...form,
        pointsLimit: form.pointsLimit === '' ? null : Number(form.pointsLimit)
      });
      resetForm();
      toast.push({ type: 'success', title: 'Desafio criado', message: 'O desafio foi registado com sucesso.' });
      await load();
    } catch (err) {
      const message = err?.response?.data?.error || 'Nao foi possivel criar o desafio.';
      toast.push({ type: 'error', title: 'Erro', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggle = async (id, isActive) => {
    try {
      await api.patch(`/challenges/${id}/toggle`, { isActive });
      toast.push({ type: 'success', title: 'Atualizado', message: isActive ? 'Desafio ativado.' : 'Desafio desativado.' });
      await load();
    } catch {
      toast.push({ type: 'error', title: 'Erro', message: 'Nao foi possivel atualizar o desafio.' });
    }
  };

  const onComplete = async (challengeId) => {
    try {
      await api.post(`/challenges/${challengeId}/complete`, {
        title: 'Treino concluido no desafio',
        modality: 'General',
        durationMinutes: 35,
        calories: 280,
        points: 12
      });

      toast.push({ type: 'success', title: 'Concluido', message: 'Treino registado no desafio.' });
      await load();
    } catch (err) {
      const message = err?.response?.data?.error || 'Nao foi possivel registar o treino.';
      toast.push({ type: 'error', title: 'Erro', message });
    }
  };

  const skeletonCards = Array.from({ length: 6 });

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <h3 className="mb-1">Desafio da Semana</h3>
            <p className="text-secondary mb-0">
              Personal trainers podem ativar ou desativar desafios. Ranking global unifica alunos online e presenciais.
            </p>
          </div>
        </div>
      </div>

      {canManage ? (
        <div className="col-12">
          <form className="card tf-card p-3" onSubmit={onCreate}>
            <div className="row g-2">
              <div className="col-lg-3 col-md-6">
                <input
                  className="form-control"
                  placeholder="Titulo"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="col-lg-3 col-md-6">
                <input
                  className="form-control"
                  placeholder="Descricao"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="col-lg-2 col-md-4">
                <select
                  className="form-select"
                  value={form.modality}
                  onChange={(e) => setForm({ ...form, modality: e.target.value })}
                >
                  <option>Musculacao</option>
                  <option>Jump</option>
                  <option>Cycling</option>
                  <option>B-Core</option>
                </select>
              </div>
              <div className="col-lg-1 col-md-4">
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={form.pointsPerCompletion}
                  onChange={(e) => setForm({ ...form, pointsPerCompletion: Number(e.target.value) })}
                  title="Pontos por conclusao"
                />
              </div>
              <div className="col-lg-1 col-md-4">
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={form.weeklyTarget}
                  onChange={(e) => setForm({ ...form, weeklyTarget: Number(e.target.value) })}
                  title="Meta semanal"
                />
              </div>
              <div className="col-lg-2 col-md-6">
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder="Limite pts/semana (opcional)"
                  value={form.pointsLimit}
                  onChange={(e) => setForm({ ...form, pointsLimit: e.target.value })}
                  title="Limite total opcional de pontos por aluno no desafio"
                />
              </div>
              <div className="col-lg-2 col-md-6">
                <input
                  className="form-control"
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </div>
              <div className="col-lg-2 col-md-6">
                <input
                  className="form-control"
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-2 small text-secondary">
              Se o limite de pontos ficar vazio, o desafio continua a usar as metricas padrao atuais.
            </div>
            <div className="mt-3 d-flex gap-2 flex-wrap">
              <button className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'A criar...' : 'Criar desafio'}
              </button>
              <button className="btn btn-outline-light" type="button" onClick={load}>
                Atualizar
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {error && !isLoading ? (
        <div className="col-12">
          <EmptyState title="Falha ao carregar" description={error} actionLabel="Tentar novamente" onAction={load} />
        </div>
      ) : null}

      {isLoading
        ? skeletonCards.map((_, idx) => (
            <div className="col-md-6 col-xl-4" key={`sk-${idx}`}>
              <div className="card tf-card h-100">
                <div className="card-body d-grid gap-3">
                  <Skeleton height={14} width="55%" />
                  <SkeletonLines lines={3} />
                  <Skeleton height={34} width="85%" radius={12} />
                </div>
              </div>
            </div>
          ))
        : list.map((challenge) => (
            <div className="col-md-6 col-xl-4" key={challenge.id}>
              <ChallengeCard
                challenge={challenge}
                canManage={canManage}
                onToggle={onToggle}
                onComplete={onComplete}
              />
            </div>
          ))}

      {!isLoading && !error && list.length === 0 ? (
        <div className="col-12">
          <EmptyState
            title="Sem desafios"
            description={canManage ? 'Crie o primeiro desafio semanal para ativar gamificacao.' : 'Ainda nao existem desafios ativos.'}
            actionLabel="Atualizar"
            onAction={load}
          />
        </div>
      ) : null}
    </section>
  );
}
