(() => {
  const { useState, useEffect, useMemo } = React;

  const STORAGE_KEY = "gestao-projetos-react-ts";

  const seed = [
    {
      id: "p1",
      nome: "Assistente Pessoal com IA",
      descricao: "Assistente pessoal que se adapta automaticamente.",
      tarefas: [
        {
          id: "t1",
          titulo: "Escolher stack",
          descricao: "Definir tecnologias base",
          dataConclusao: "2026-01-01",
          status: "pendente",
        },
      ],
    },
  ];

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : seed;
    } catch (e) {
      console.warn("Falha ao ler storage", e);
      return seed;
    }
  };

  const save = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Falha ao guardar storage", e);
    }
  };

  const h = React.createElement;

  const statusLabel = (s) =>
    s === "concluida" ? "Concluída" : s === "em-progresso" ? "Em progresso" : "Pendente";

  function TaskItem({ task, onStatus, onRemove }) {
    const badgeClass =
      task.status === "concluida" ? "badge done" : task.status === "em-progresso" ? "badge progress" : "badge pending";

    return h(
      "div",
      { className: "task" },
      h(
        "div",
        { className: "heading" },
        h("div", null, [
          h("strong", { key: "t" }, task.titulo),
          h("p", { key: "d", className: "muted" }, task.descricao || "Sem descrição"),
        ]),
        h("div", { className: "row", style: { maxWidth: 260 } }, [
          h(
            "select",
            {
              key: "s",
              className: "input",
              value: task.status,
              onChange: (e) => onStatus(e.target.value),
            },
            [
              h("option", { key: "p", value: "pendente" }, "Pendente"),
              h("option", { key: "e", value: "em-progresso" }, "Em progresso"),
              h("option", { key: "c", value: "concluida" }, "Concluída"),
            ]
          ),
          h(
            "button",
            {
              key: "r",
              className: "btn btn-danger",
              onClick: () => {
                if (confirm("Confirmar remoção desta tarefa?")) onRemove();
              },
            },
            "Remover"
          ),
        ])
      ),
      h(
        "div",
        { className: badgeClass, style: { marginTop: 8 } },
        `${statusLabel(task.status)} · Conclusão: ${task.dataConclusao || "dd/mm/aaaa"}`
      )
    );
  }

  function ProjectCard({ project, onAddTask, onStatus, onRemoveTask, onRemoveProject }) {
    const [taskForm, setTaskForm] = useState({ titulo: "", descricao: "", dataConclusao: "" });
    const [erro, setErro] = useState("");

    const concluidas = project.tarefas.filter((t) => t.status === "concluida").length;
    const progresso = project.tarefas.length ? Math.round((concluidas / project.tarefas.length) * 100) : 0;

    const submitTask = (e) => {
      e.preventDefault();
      if (!taskForm.titulo.trim() || !taskForm.dataConclusao) {
        setErro("Título e data de conclusão são obrigatórios.");
        return;
      }
      setErro("");
      onAddTask(taskForm);
      setTaskForm({ titulo: "", descricao: "", dataConclusao: "" });
    };

    return h(
      "div",
      { className: "card project-card" },
      h(
        "div",
        { className: "heading" },
        h("div", null, [
          h("h3", { key: "t", className: "project-title" }, project.nome),
          h("p", { key: "d", className: "muted" }, project.descricao),
        ]),
        h("div", { className: "row", style: { maxWidth: 220 } }, [
          h("span", { key: "p", className: "pill" }, `${progresso}%`),
          onRemoveProject
            ? h(
                "button",
                {
                  key: "r",
                  className: "btn btn-danger",
                  onClick: () => {
                    if (confirm("Confirmar remoção do projeto?")) onRemoveProject();
                  },
                },
                "Remover"
              )
            : null,
        ])
      ),
      h("div", { className: "progress-bar", "aria-label": "Progresso" },
        h("div", { className: "progress-fill", style: { width: `${progresso}%` } })
      ),
      h(
        "div",
        { className: "tasks" },
        project.tarefas.length === 0
          ? h("p", { className: "muted" }, "Sem tarefas.")
          : project.tarefas.map((t) =>
              h(TaskItem, {
                key: t.id,
                task: t,
                onStatus: (s) => onStatus(t.id, s),
                onRemove: () => onRemoveTask(t.id),
              })
            )
      ),
      h(
        "form",
        { onSubmit: submitTask, style: { marginTop: 12 } },
        h(
          "div",
          { className: "row" },
          h("input", {
            className: "input",
            placeholder: "Título da tarefa",
            value: taskForm.titulo,
            onChange: (e) => setTaskForm({ ...taskForm, titulo: e.target.value }),
          }),
          h("input", {
            className: "input",
            type: "date",
            value: taskForm.dataConclusao,
            onChange: (e) => setTaskForm({ ...taskForm, dataConclusao: e.target.value }),
          })
        ),
        h("textarea", {
          className: "input",
          style: { marginTop: 8 },
          rows: 2,
          placeholder: "Descrição (opcional)",
          value: taskForm.descricao,
          onChange: (e) => setTaskForm({ ...taskForm, descricao: e.target.value }),
        }),
        erro ? h("div", { className: "error" }, erro) : null,
        h(
          "div",
          { style: { marginTop: 8, textAlign: "right" } },
          h(
            "button",
            { className: "btn btn-primary", type: "submit" },
            "Adicionar tarefa"
          )
        )
      )
    );
  }

  function ProjectForm({ onSubmit }) {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [erro, setErro] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!nome.trim() || !descricao.trim()) {
        setErro("Nome e descrição são obrigatórios.");
        return;
      }
      setErro("");
      onSubmit(nome.trim(), descricao.trim());
      setNome("");
      setDescricao("");
    };

    return h(
      "form",
      { onSubmit: handleSubmit, className: "grid" },
      h("div", null, [
        h("label", { key: "l", className: "muted" }, "Nome do projeto"),
        h("input", {
          key: "i",
          className: "input",
          placeholder: "Ex.: Plataforma interna",
          value: nome,
          onChange: (e) => setNome(e.target.value),
        }),
      ]),
      h("div", null, [
        h("label", { key: "l", className: "muted" }, "Descrição"),
        h("input", {
          key: "i",
          className: "input",
          placeholder: "Ex.: Gestão de tarefas e progresso",
          value: descricao,
          onChange: (e) => setDescricao(e.target.value),
        }),
      ]),
      h(
        "div",
        { style: { alignSelf: "end" } },
        h(
          "button",
          { type: "submit", className: "btn btn-primary", style: { width: "100%" } },
          "Criar projeto"
        )
      ),
      erro ? h("div", { className: "error" }, erro) : null
    );
  }

  function App() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setProjects(load());
      setLoading(false);
    }, []);

    useEffect(() => {
      if (!loading) save(projects);
    }, [projects, loading]);

    const stats = useMemo(() => {
      const totalTarefas = projects.reduce((acc, p) => acc + p.tarefas.length, 0);
      const totalConcluidas = projects.reduce(
        (acc, p) => acc + p.tarefas.filter((t) => t.status === "concluida").length,
        0
      );
      return { totalTarefas, totalConcluidas };
    }, [projects]);

    const criarProjeto = (nome, descricao) => {
      const novo = { id: Math.random().toString(36).slice(2, 9), nome, descricao, tarefas: [] };
      setProjects((p) => [novo, ...p]);
    };

    const removerProjeto = (id) => {
      setProjects((p) => p.filter((proj) => proj.id !== id));
    };

    const adicionarTarefa = (projectId, tarefa) => {
      const nova = { ...tarefa, id: Math.random().toString(36).slice(2, 9), status: "pendente" };
      setProjects((p) =>
        p.map((proj) => (proj.id === projectId ? { ...proj, tarefas: [...proj.tarefas, nova] } : proj))
      );
    };

    const alterarStatus = (projectId, taskId, status) => {
      setProjects((p) =>
        p.map((proj) =>
          proj.id === projectId
            ? {
                ...proj,
                tarefas: proj.tarefas.map((t) => (t.id === taskId ? { ...t, status } : t)),
              }
            : proj
        )
      );
    };

    const removerTarefa = (projectId, taskId) => {
      setProjects((p) =>
        p.map((proj) =>
          proj.id === projectId ? { ...proj, tarefas: proj.tarefas.filter((t) => t.id !== taskId) } : proj
        )
      );
    };

    return h(
      "div",
      { className: "shell" },
      h(
        "div",
        { className: "app-hero" },
        h(
          "div",
          { className: "heading" },
          h("div", null, [
            h(
              "p",
              { key: "m", className: "muted", style: { textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 12 } },
              "Dashboard"
            ),
            h("h1", { key: "t", style: { margin: "4px 0 0" } }, "Gestão de Projetos (React + TS)")
          ]),
          h("div", { className: "row", style: { maxWidth: 360 } }, [
            h("div", { key: "p", className: "card" }, [
              h("p", { className: "muted" }, "Projetos"),
              h("strong", null, projects.length),
            ]),
            h("div", { key: "t", className: "card" }, [
              h("p", { className: "muted" }, "Tarefas"),
              h("strong", null, stats.totalTarefas),
            ]),
            h("div", { key: "c", className: "card" }, [
              h("p", { className: "muted" }, "Concluídas"),
              h("strong", { style: { color: "#16a34a" } }, stats.totalConcluidas),
            ]),
          ])
        )
      ),
      h(
        "div",
        { className: "card", style: { marginBottom: 14 } },
        h(ProjectForm, { onSubmit: criarProjeto })
      ),
      loading
        ? h("div", { className: "card" }, "A carregar...")
        : projects.length === 0
        ? h("div", { className: "card" }, "Nenhum projeto criado. Adicione o primeiro.")
        : h(
            "div",
            { className: "grid" },
            projects.map((p) =>
              h(ProjectCard, {
                key: p.id,
                project: p,
                onAddTask: (t) => adicionarTarefa(p.id, t),
                onStatus: (taskId, status) => alterarStatus(p.id, taskId, status),
                onRemoveTask: (taskId) => removerTarefa(p.id, taskId),
                onRemoveProject: () => removerProjeto(p.id),
              })
            )
          )
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(App));
})();
