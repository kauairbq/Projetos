import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { api } from '../api/mock';
import type { Project, Task, TaskStatus } from '../types';

type State = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: 'set'; payload: Project[] }
  | { type: 'loading'; payload: boolean }
  | { type: 'error'; payload: string | null }
  | { type: 'project:add'; payload: Project }
  | { type: 'project:update'; payload: Project }
  | { type: 'project:remove'; payload: string }
  | { type: 'task:add'; projectId: string; task: Task }
  | { type: 'task:update'; projectId: string; task: Task }
  | { type: 'task:remove'; projectId: string; taskId: string }
  | { type: 'task:status'; projectId: string; taskId: string; status: TaskStatus };

const initialState: State = { projects: [], loading: false, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: action.payload };
    case 'error':
      return { ...state, error: action.payload };
    case 'set':
      return { ...state, projects: action.payload };
    case 'project:add':
      return { ...state, projects: [action.payload, ...state.projects] };
    case 'project:update':
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'project:remove':
      return { ...state, projects: state.projects.filter((p) => p.id !== action.payload) };
    case 'task:add':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, tarefas: [action.task, ...p.tarefas] } : p
        ),
      };
    case 'task:update':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? { ...p, tarefas: p.tarefas.map((t) => (t.id === action.task.id ? action.task : t)) }
            : p
        ),
      };
    case 'task:remove':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, tarefas: p.tarefas.filter((t) => t.id !== action.taskId) } : p
        ),
      };
    case 'task:status':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                tarefas: p.tarefas.map((t) =>
                  t.id === action.taskId ? { ...t, status: action.status } : t
                ),
              }
            : p
        ),
      };
    default:
      return state;
  }
}

type Ctx = State & {
  criarProjeto: (nome: string, descricao: string) => Promise<void>;
  atualizarProjeto: (id: string, nome: string, descricao: string) => Promise<void>;
  removerProjeto: (id: string) => Promise<void>;
  adicionarTarefa: (projectId: string, tarefa: Omit<Task, 'id' | 'status'>) => Promise<void>;
  atualizarTarefa: (projectId: string, tarefa: Task) => Promise<void>;
  removerTarefa: (projectId: string, tarefaId: string) => Promise<void>;
  alterarStatus: (projectId: string, tarefaId: string, status: TaskStatus) => Promise<void>;
};

const ProjectsContext = createContext<Ctx | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      dispatch({ type: 'loading', payload: true });
      try {
        const data = await api.listProjects();
        dispatch({ type: 'set', payload: data });
      } catch (e) {
        dispatch({ type: 'error', payload: 'Falha ao carregar projetos' });
      } finally {
        dispatch({ type: 'loading', payload: false });
      }
    })();
  }, []);

  async function criarProjeto(nome: string, descricao: string) {
    const proj = await api.createProject(nome, descricao);
    dispatch({ type: 'project:add', payload: proj });
  }

  async function atualizarProjeto(id: string, nome: string, descricao: string) {
    const proj = await api.updateProject(id, { nome, descricao });
    if (proj) dispatch({ type: 'project:update', payload: proj });
  }

  async function removerProjeto(id: string) {
    await api.deleteProject(id);
    dispatch({ type: 'project:remove', payload: id });
  }

  async function adicionarTarefa(projectId: string, tarefa: Omit<Task, 'id' | 'status'>) {
    const nova = await api.addTask(projectId, tarefa);
    if (nova) dispatch({ type: 'task:add', projectId, task: nova });
  }

  async function atualizarTarefa(projectId: string, tarefa: Task) {
    const up = await api.updateTask(projectId, tarefa);
    if (up) dispatch({ type: 'task:update', projectId, task: up });
  }

  async function removerTarefa(projectId: string, tarefaId: string) {
    await api.deleteTask(projectId, tarefaId);
    dispatch({ type: 'task:remove', projectId, taskId: tarefaId });
  }

  async function alterarStatus(projectId: string, tarefaId: string, status: TaskStatus) {
    await api.setTaskStatus(projectId, tarefaId, status);
    dispatch({ type: 'task:status', projectId, taskId: tarefaId, status });
  }

  const value: Ctx = useMemo(
    () => ({
      ...state,
      criarProjeto,
      atualizarProjeto,
      removerProjeto,
      adicionarTarefa,
      atualizarTarefa,
      removerTarefa,
      alterarStatus,
    }),
    [state]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects deve ser usado dentro de ProjectsProvider');
  return ctx;
};
