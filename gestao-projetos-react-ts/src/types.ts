export type TaskStatus = 'pendente' | 'em-progresso' | 'concluida';

export interface Task {
  id: string;
  titulo: string;
  descricao: string;
  dataConclusao: string;
  status: TaskStatus;
}

export interface Project {
  id: string;
  nome: string;
  descricao: string;
  tarefas: Task[];
}
