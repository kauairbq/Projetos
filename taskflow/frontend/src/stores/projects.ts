import { defineStore } from 'pinia';
import type { Project, Task, TaskStatus } from '../types/project';

const STORAGE_KEY = 'taskflow-projects';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function persist(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function load(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch (e) {
    console.warn('Falha ao ler projetos do storage', e);
    return [];
  }
}

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: load() as Project[],
  }),
  getters: {
    totalProjetos: (state) => state.projects.length,
  },
  actions: {
    criarProjeto(nome: string, descricao: string) {
      const novo: Project = { id: uid(), nome, descricao, tarefas: [] };
      this.projects.unshift(novo);
      persist(this.projects);
      return novo;
    },
    atualizarProjeto(id: string, nome: string, descricao: string) {
      const p = this.projects.find((pr) => pr.id === id);
      if (p) {
        p.nome = nome;
        p.descricao = descricao;
        persist(this.projects);
      }
    },
    removerProjeto(id: string) {
      this.projects = this.projects.filter((p) => p.id !== id);
      persist(this.projects);
    },
    adicionarTarefa(projectId: string, tarefa: Omit<Task, 'id' | 'status'>) {
      const p = this.projects.find((pr) => pr.id === projectId);
      if (!p) return;
      const nova: Task = { ...tarefa, id: uid(), status: 'pendente' };
      p.tarefas.unshift(nova);
      persist(this.projects);
      return nova;
    },
    atualizarTarefa(projectId: string, tarefaAtualizada: Task) {
      const p = this.projects.find((pr) => pr.id === projectId);
      if (!p) return;
      const idx = p.tarefas.findIndex((t) => t.id === tarefaAtualizada.id);
      if (idx >= 0) {
        p.tarefas[idx] = tarefaAtualizada;
        persist(this.projects);
      }
    },
    removerTarefa(projectId: string, tarefaId: string) {
      const p = this.projects.find((pr) => pr.id === projectId);
      if (!p) return;
      p.tarefas = p.tarefas.filter((t) => t.id !== tarefaId);
      persist(this.projects);
    },
    alterarStatus(projectId: string, tarefaId: string, status: TaskStatus) {
      const p = this.projects.find((pr) => pr.id === projectId);
      if (!p) return;
      const tarefa = p.tarefas.find((t) => t.id === tarefaId);
      if (tarefa) {
        tarefa.status = status;
        persist(this.projects);
      }
    },
    progresso(projectId: string) {
      const p = this.projects.find((pr) => pr.id === projectId);
      if (!p || p.tarefas.length === 0) return 0;
      const conclu = p.tarefas.filter((t) => t.status === 'concluida').length;
      return Math.round((conclu / p.tarefas.length) * 100);
    },
  },
});
