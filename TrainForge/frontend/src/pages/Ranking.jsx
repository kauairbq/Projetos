import { useCallback, useEffect, useState } from 'react';

import EmptyState from '../components/EmptyState';
import { SkeletonLines } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

export default function Ranking() {
  const toast = useToast();

  const [ranking, setRanking] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/workouts/leaderboard?limit=20');
      setRanking(res.data?.data || []);
    } catch {
      setError('Nao foi possivel carregar o ranking.');
      toast.push({ type: 'error', title: 'Falha', message: 'Nao foi possivel carregar o ranking.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <div>
                <h3 className="mb-1">Ranking</h3>
                <p className="text-secondary mb-0">Leaderboard global por pontos (presencial + online).</p>
              </div>
              <button className="btn btn-outline-light" type="button" onClick={load} disabled={isLoading}>
                {isLoading ? 'A carregar...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5 className="mb-3">Top 20</h5>

            {error && !isLoading ? (
              <EmptyState title="Falha ao carregar" description={error} actionLabel="Tentar novamente" onAction={load} />
            ) : isLoading ? (
              <SkeletonLines lines={9} />
            ) : ranking.length === 0 ? (
              <EmptyState title="Sem dados" description="Registe treinos para gerar ranking." actionLabel="Atualizar" onAction={load} />
            ) : (
              <ol className="tf-ranking-list mb-0">
                {ranking.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.full_name}</span>
                    <strong>{entry.total_points} pts</strong>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5 className="mb-2">Como subir no ranking</h5>
            <p className="text-secondary mb-0">
              Complete treinos registados no sistema e participe nos desafios semanais. O ranking e atualizado com base em pontos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

