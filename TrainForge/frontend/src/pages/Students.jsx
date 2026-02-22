import { useCallback, useEffect, useMemo, useState } from 'react';

import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { api } from '../services/api';

export default function Students({ user }) {
  const toast = useToast();
  const isMaster = useMemo(() => user.tenant_role === 'MASTER_ADMIN', [user.tenant_role]);
  const isManager = useMemo(() => ['admin', 'trainer'].includes(user.role) && !isMaster, [user.role, isMaster]);

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isManager) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await api.get('/users?role=client');
      setStudents(res.data?.data || []);
    } catch {
      setError('Nao foi possivel carregar a lista de alunos.');
      toast.push({ type: 'error', title: 'Falha', message: 'Nao foi possivel carregar alunos.' });
    } finally {
      setIsLoading(false);
    }
  }, [isManager, toast]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  if (!isManager) {
    return (
      <section className="row g-4">
        <div className="col-12">
          <div className="card tf-card">
            <div className="card-body">
              <h3>Alunos</h3>
              <p className="text-secondary mb-0">Esta area e exclusiva para administradores e personal trainers.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const paymentBadge = (student) => {
    const status = (student.payment_status || '').toUpperCase();
    if (status === 'PAGO') {
      return { label: 'Pago', className: 'tf-badge-status tf-badge-status--success' };
    }
    if (status === 'DESATIVADO') {
      return { label: 'Desativado', className: 'tf-badge-status tf-badge-status--danger' };
    }
    return { label: 'Pendente', className: 'tf-badge-status tf-badge-status--warning' };
  };

  return (
    <section className="row g-4">
      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
              <div>
                <h3 className="mb-1">Alunos</h3>
                <p className="text-secondary mb-0">Gestao de alunos presenciais e online numa base unica.</p>
              </div>
              <button className="btn btn-outline-light" type="button" onClick={load}>
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card tf-card">
          <div className="card-body table-responsive">
            {error && !isLoading ? (
              <EmptyState title="Falha ao carregar" description={error} actionLabel="Tentar novamente" onAction={load} />
            ) : isLoading ? (
              <SkeletonTable rows={7} />
            ) : students.length === 0 ? (
              <EmptyState title="Sem alunos" description="Quando existirem alunos registados, eles aparecem aqui." />
            ) : (
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Pagamento</th>
                    <th>Data nascimento</th>
                    <th>Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const badge = paymentBadge(s);
                    return (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td>{s.full_name}</td>
                      <td>{s.email}</td>
                      <td>{s.mode === 'presencial' ? 'Presencial' : 'Online'}</td>
                      <td>
                        <span className={badge.className}>{badge.label}</span>
                      </td>
                      <td>{s.birth_date ? new Date(s.birth_date).toLocaleDateString('pt-PT') : '-'}</td>
                      <td>{new Date(s.created_at).toLocaleDateString('pt-PT')}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
