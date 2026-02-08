export type TaskStatus = 'pendente' | 'em-andamento' | 'concluida';

export interface Task {
  id: string;
  titulo: string;
  descricao: string;
  dataConclusao: string; // ISO string
  status: TaskStatus;
}

export interface Project {
  id: string;
  nome: string;
  descricao: string;
  tarefas: Task[];
}
