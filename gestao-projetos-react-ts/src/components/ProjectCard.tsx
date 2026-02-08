import { useState } from "react";
import type { Project, Task } from "../types";
import { TaskItem } from "./TaskItem";

type Props = {
  project: Project;
  onAddTask: (tarefa: Omit<Task, "id" | "status">) => void;
  onStatus: (taskId: string, status: Task["status"]) => void;
  onRemoveTask: (taskId: string) => void;
  onRemoveProject?: () => void;
};

export function ProjectCard({ project, onAddTask, onStatus, onRemoveTask, onRemoveProject }: Props) {
  const [taskForm, setTaskForm] = useState({ titulo: "", descricao: "", dataConclusao: "" });
  const [erro, setErro] = useState("");

  const concluidas = project.tarefas.filter((t) => t.status === "concluida").length;
  const progresso = project.tarefas.length ? Math.round((concluidas / project.tarefas.length) * 100) : 0;

  function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskForm.titulo.trim() || !taskForm.dataConclusao) {
      setErro("Título e data de conclusão são obrigatórios.");
      return;
    }
    setErro("");
    onAddTask(taskForm);
    setTaskForm({ titulo: "", descricao: "", dataConclusao: "" });
  }

  return (
    <div className="card project-card">
      <div className="heading">
        <div>
          <h3 className="project-title">{project.nome}</h3>
          <p className="muted">{project.descricao}</p>
        </div>
        <div className="row" style={{ maxWidth: 220 }}>
          <span className="pill">{progresso}%</span>
          {onRemoveProject && (
            <button
              className="btn btn-danger"
              onClick={() => {
                if (confirm("Confirmar remoção do projeto?")) onRemoveProject();
              }}
            >
              Remover
            </button>
          )}
        </div>
      </div>
      <div className="progress-bar" aria-label="Progresso">
        <div className="progress-fill" style={{ width: `${progresso}%` }} />
      </div>
      <div className="tasks">
        {project.tarefas.length === 0 ? (
          <p className="muted">Sem tarefas.</p>
        ) : (
          project.tarefas.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onStatus={(s) => onStatus(t.id, s)}
              onRemove={() => onRemoveTask(t.id)}
            />
          ))
        )}
      </div>
      <form onSubmit={submitTask} style={{ marginTop: 12 }}>
        <div className="row">
          <input
            className="input"
            placeholder="Título da tarefa"
            value={taskForm.titulo}
            onChange={(e) => setTaskForm({ ...taskForm, titulo: e.target.value })}
          />
          <input
            className="input"
            type="date"
            value={taskForm.dataConclusao}
            onChange={(e) => setTaskForm({ ...taskForm, dataConclusao: e.target.value })}
          />
        </div>
        <textarea
          className="input"
          style={{ marginTop: 8 }}
          rows={2}
          placeholder="Descrição (opcional)"
          value={taskForm.descricao}
          onChange={(e) => setTaskForm({ ...taskForm, descricao: e.target.value })}
        />
        {erro && <div className="error">{erro}</div>}
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <button className="btn btn-primary" type="submit">
            Adicionar tarefa
          </button>
        </div>
      </form>
    </div>
  );
}
