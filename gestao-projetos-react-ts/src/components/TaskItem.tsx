import type { Task, TaskStatus } from "../types";

type Props = {
  task: Task;
  onStatus: (status: TaskStatus) => void;
  onRemove: () => void;
};

export function TaskItem({ task, onStatus, onRemove }: Props) {
  const badgeClass =
    task.status === "concluida" ? "badge done" : task.status === "em-progresso" ? "badge progress" : "badge pending";

  const statusLabel =
    task.status === "pendente" ? "Pendente" : task.status === "em-progresso" ? "Em progresso" : "Concluída";

  return (
    <div className="task">
      <div className="heading">
        <div>
          <strong>{task.titulo}</strong>
          <p className="muted">{task.descricao || "Sem descrição"}</p>
        </div>
        <div className="row" style={{ maxWidth: 260 }}>
          <select className="input" value={task.status} onChange={(e) => onStatus(e.target.value as TaskStatus)}>
            <option value="pendente">Pendente</option>
            <option value="em-progresso">Em progresso</option>
            <option value="concluida">Concluída</option>
          </select>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm("Confirmar remoção desta tarefa?")) onRemove();
            }}
          >
            Remover
          </button>
        </div>
      </div>
      <div className={badgeClass} style={{ marginTop: 8 }}>
        {statusLabel} · Conclusão: {task.dataConclusao || "dd/mm/aaaa"}
      </div>
    </div>
  );
}
