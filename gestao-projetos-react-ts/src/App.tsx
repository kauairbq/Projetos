import "./index.css";
import { useProjects } from "./context/ProjectsContext";
import { ProjectForm } from "./components/ProjectForm";
import { ProjectCard } from "./components/ProjectCard";

export default function App() {
  const {
    projects,
    loading,
    error,
    criarProjeto,
    removerProjeto,
    adicionarTarefa,
    alterarStatus,
    removerTarefa,
  } = useProjects();

  const totalTarefas = projects.reduce((acc, p) => acc + p.tarefas.length, 0);
  const totalConcluidas = projects.reduce(
    (acc, p) => acc + p.tarefas.filter((t) => t.status === "concluida").length,
    0
  );

  return (
    <div className="shell">
      <div className="app-hero">
        <div className="heading">
          <div>
            <p className="muted" style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 12 }}>
              Dashboard
            </p>
            <h1 style={{ margin: "4px 0 0" }}>Gestão de Projetos (React + TS)</h1>
          </div>
          <div className="row" style={{ maxWidth: 360 }}>
            <div className="card">
              <p className="muted">Projetos</p>
              <strong>{projects.length}</strong>
            </div>
            <div className="card">
              <p className="muted">Tarefas</p>
              <strong>{totalTarefas}</strong>
            </div>
            <div className="card">
              <p className="muted">Concluídas</p>
              <strong style={{ color: "#16a34a" }}>{totalConcluidas}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <ProjectForm onSubmit={criarProjeto} />
        {error && <div className="error">{error}</div>}
      </div>

      {loading ? (
        <div className="card">A carregar...</div>
      ) : projects.length === 0 ? (
        <div className="card">Nenhum projeto criado. Adicione o primeiro.</div>
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onAddTask={(t) => adicionarTarefa(p.id, t)}
              onStatus={(taskId, status) => alterarStatus(p.id, taskId, status)}
              onRemoveTask={(taskId) => removerTarefa(p.id, taskId)}
              onRemoveProject={() => removerProjeto(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
