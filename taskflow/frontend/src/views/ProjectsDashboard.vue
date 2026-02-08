<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p class="text-sm text-gray-500 uppercase tracking-wide">Dashboard</p>
        <h1 class="text-3xl font-bold text-gray-900">Gestão de Projetos</h1>
        <p class="text-gray-600">Crie, edite e acompanhe projetos e tarefas com TypeScript + Pinia.</p>
      </div>
      <div class="flex gap-3">
        <button @click="abrirNovoProjeto" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Novo Projeto
        </button>
        <RouterLink to="/tasks" class="border px-4 py-2 rounded-lg hover:bg-gray-100 transition">
          Ir para Tarefas
        </RouterLink>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl shadow p-4 border">
        <p class="text-sm text-gray-500">Projetos</p>
        <p class="text-2xl font-bold">{{ projectsStore.totalProjetos }}</p>
      </div>
      <div class="bg-white rounded-xl shadow p-4 border">
        <p class="text-sm text-gray-500">Tarefas totais</p>
        <p class="text-2xl font-bold">{{ totalTarefas }}</p>
      </div>
      <div class="bg-white rounded-xl shadow p-4 border">
        <p class="text-sm text-gray-500">Concluídas</p>
        <p class="text-2xl font-bold text-green-600">{{ totalConcluidas }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow p-6 border">
      <h2 class="text-xl font-semibold mb-4">Projetos</h2>
      <div v-if="projectsStore.projects.length === 0" class="text-gray-500">Ainda não existem projetos. Crie o primeiro!</div>
      <div class="space-y-4">
        <div
          v-for="projeto in projectsStore.projects"
          :key="projeto.id"
          class="border rounded-lg p-4 bg-gray-50"
        >
          <div class="flex justify-between items-start gap-3">
            <div>
              <h3 class="text-lg font-semibold">{{ projeto.nome }}</h3>
              <p class="text-gray-600">{{ projeto.descricao }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="editarProjeto(projeto)" class="text-blue-600 hover:underline">Editar</button>
              <button @click="projectsStore.removerProjeto(projeto.id)" class="text-red-600 hover:underline">Excluir</button>
            </div>
          </div>

          <div class="mt-3">
            <p class="text-sm text-gray-600">Progresso: {{ projectsStore.progresso(projeto.id) }}%</p>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                class="h-2 rounded-full bg-blue-500"
                :style="{ width: projectsStore.progresso(projeto.id) + '%' }"
              ></div>
            </div>
          </div>

          <!-- Tarefas -->
          <div class="mt-4 space-y-2">
            <div class="flex justify-between items-center">
              <h4 class="font-semibold">Tarefas ({{ projeto.tarefas.length }})</h4>
              <button @click="abrirTarefa(projeto.id)" class="text-sm text-blue-600 hover:underline">+ Tarefa</button>
            </div>
            <div v-if="projeto.tarefas.length === 0" class="text-gray-500 text-sm">Sem tarefas neste projeto.</div>
            <div
              v-for="t in projeto.tarefas"
              :key="t.id"
              class="p-3 rounded bg-white border flex justify-between items-center"
            >
              <div>
                <p class="font-semibold">{{ t.titulo }}</p>
                <p class="text-sm text-gray-600">{{ t.descricao }}</p>
                <p class="text-xs text-gray-500">Conclusão: {{ t.dataConclusao }}</p>
              </div>
              <div class="flex items-center gap-2">
                <select v-model="t.status" @change="alterarStatus(projeto.id, t.id, t.status)" class="text-sm border rounded px-2 py-1">
                  <option value="pendente">Pendente</option>
                  <option value="em-andamento">Em progresso</option>
                  <option value="concluida">Concluída</option>
                </select>
                <button @click="removerTarefa(projeto.id, t.id)" class="text-red-500 text-sm hover:underline">Remover</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Projeto -->
    <div v-if="modalProjeto.visivel" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h3 class="text-xl font-bold mb-4">{{ modalProjeto.editando ? 'Editar projeto' : 'Novo projeto' }}</h3>
        <form @submit.prevent="salvarProjeto">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Nome</label>
            <input v-model="formProjeto.nome" type="text" class="w-full border rounded px-3 py-2" required />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Descrição</label>
            <textarea v-model="formProjeto.descricao" class="w-full border rounded px-3 py-2" rows="3" required></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="fecharProjeto" class="border px-4 py-2 rounded">Cancelar</button>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Tarefa -->
    <div v-if="modalTarefa.visivel" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h3 class="text-xl font-bold mb-4">{{ modalTarefa.editando ? 'Editar tarefa' : 'Nova tarefa' }}</h3>
        <form @submit.prevent="salvarTarefa">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Título</label>
            <input v-model="formTarefa.titulo" type="text" class="w-full border rounded px-3 py-2" required />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Descrição</label>
            <textarea v-model="formTarefa.descricao" class="w-full border rounded px-3 py-2" rows="3"></textarea>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Data de conclusão</label>
            <input v-model="formTarefa.dataConclusao" type="date" class="w-full border rounded px-3 py-2" required />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="fecharTarefa" class="border px-4 py-2 rounded">Cancelar</button>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useProjectsStore } from '../stores/projects';
import type { Project, TaskStatus, Task } from '../types/project';

const projectsStore = useProjectsStore();

const modalProjeto = reactive({ visivel: false, editando: false, id: '' });
const modalTarefa = reactive({ visivel: false, editando: false, projectId: '' });

const formProjeto = reactive<{ nome: string; descricao: string }>({
  nome: '',
  descricao: '',
});

const formTarefa = reactive<{ id?: string; titulo: string; descricao: string; dataConclusao: string }>({
  id: '',
  titulo: '',
  descricao: '',
  dataConclusao: '',
});

const totalTarefas = computed(() =>
  projectsStore.projects.reduce((acc, p) => acc + p.tarefas.length, 0)
);
const totalConcluidas = computed(() =>
  projectsStore.projects.reduce(
    (acc, p) => acc + p.tarefas.filter((t) => t.status === 'concluida').length,
    0
  )
);

function resetProjeto() {
  formProjeto.nome = '';
  formProjeto.descricao = '';
  modalProjeto.id = '';
  modalProjeto.editando = false;
}

function resetTarefa() {
  formTarefa.id = '';
  formTarefa.titulo = '';
  formTarefa.descricao = '';
  formTarefa.dataConclusao = '';
  modalTarefa.editando = false;
}

function abrirNovoProjeto() {
  resetProjeto();
  modalProjeto.visivel = true;
}

function editarProjeto(projeto: Project) {
  formProjeto.nome = projeto.nome;
  formProjeto.descricao = projeto.descricao;
  modalProjeto.id = projeto.id;
  modalProjeto.editando = true;
  modalProjeto.visivel = true;
}

function fecharProjeto() {
  modalProjeto.visivel = false;
  resetProjeto();
}

function salvarProjeto() {
  if (!formProjeto.nome.trim()) return;
  if (modalProjeto.editando && modalProjeto.id) {
    projectsStore.atualizarProjeto(modalProjeto.id, formProjeto.nome, formProjeto.descricao);
  } else {
    projectsStore.criarProjeto(formProjeto.nome, formProjeto.descricao);
  }
  fecharProjeto();
}

function abrirTarefa(projectId: string) {
  resetTarefa();
  modalTarefa.projectId = projectId;
  modalTarefa.visivel = true;
}

function fecharTarefa() {
  modalTarefa.visivel = false;
  modalTarefa.projectId = '';
  resetTarefa();
}

function salvarTarefa() {
  if (!modalTarefa.projectId) return;
  if (!formTarefa.titulo.trim() || !formTarefa.dataConclusao) return;

  if (formTarefa.id) {
    const tarefa: Task = {
      id: formTarefa.id,
      titulo: formTarefa.titulo,
      descricao: formTarefa.descricao,
      dataConclusao: formTarefa.dataConclusao,
      status: 'pendente',
    };
    projectsStore.atualizarTarefa(modalTarefa.projectId, tarefa);
  } else {
    projectsStore.adicionarTarefa(modalTarefa.projectId, {
      titulo: formTarefa.titulo,
      descricao: formTarefa.descricao,
      dataConclusao: formTarefa.dataConclusao,
    });
  }
  fecharTarefa();
}

function alterarStatus(projectId: string, tarefaId: string, status: TaskStatus) {
  projectsStore.alterarStatus(projectId, tarefaId, status);
}

function removerTarefa(projectId: string, tarefaId: string) {
  projectsStore.removerTarefa(projectId, tarefaId);
}
</script>

<style scoped>
.max-w-6xl {
  max-width: 72rem;
}
</style>
