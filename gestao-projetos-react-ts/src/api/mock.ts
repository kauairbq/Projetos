import type { Project, Task, TaskStatus } from '../types';

const STORAGE_KEY = 'gestao-projetos-react-ts:projects';

const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms));

const read = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
};

const write = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const api = {
  async listProjects(): Promise<Project[]> {
    await delay();
    return read();
  },
  async createProject(nome: string, descricao: string): Promise<Project> {
    await delay();
    const projects = read();
    const novo: Project = { id: uid(), nome, descricao, tarefas: [] };
    projects.unshift(novo);
    write(projects);
    return novo;
  },
  async updateProject(id: string, data: Partial<Pick<Project, 'nome' | 'descricao'>>): Promise<Project | null> {
    await delay();
    const projects = read();
    const p = projects.find((pr) => pr.id === id);
    if (!p) return null;
    Object.assign(p, data);
    write(projects);
    return p;
  },
  async deleteProject(id: string): Promise<void> {
    await delay();
    const projects = read().filter((p) => p.id !== id);
    write(projects);
  },
  async addTask(projectId: string, tarefa: Omit<Task, 'id' | 'status'>): Promise<Task | null> {
    await delay();
    const projects = read();
    const p = projects.find((pr) => pr.id === projectId);
    if (!p) return null;
    const nova: Task = { ...tarefa, id: uid(), status: 'pendente' };
    p.tarefas.unshift(nova);
    write(projects);
    return nova;
  },
  async updateTask(projectId: string, tarefa: Task): Promise<Task | null> {
    await delay();
    const projects = read();
    const p = projects.find((pr) => pr.id === projectId);
    if (!p) return null;
    const idx = p.tarefas.findIndex((t) => t.id === tarefa.id);
    if (idx < 0) return null;
    p.tarefas[idx] = tarefa;
    write(projects);
    return tarefa;
  },
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await delay();
    const projects = read();
    const p = projects.find((pr) => pr.id === projectId);
    if (!p) return;
    p.tarefas = p.tarefas.filter((t) => t.id !== taskId);
    write(projects);
  },
  async setTaskStatus(projectId: string, taskId: string, status: TaskStatus): Promise<void> {
    await delay();
    const projects = read();
    const p = projects.find((pr) => pr.id === projectId);
    if (!p) return;
    const t = p.tarefas.find((tk) => tk.id === taskId);
    if (t) t.status = status;
    write(projects);
  },
};
