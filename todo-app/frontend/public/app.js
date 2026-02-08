// Front-end simples consumindo a API mock do servidor local (sem backend separado)
const apiBase = `${window.location.origin}/api`;

const state = {
  tasks: [],
  loading: false
};

function setStatus(message, type = 'info') {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

async function fetchTasks() {
  state.loading = true;
  try {
    const res = await fetch(apiBase + '/tasks');
    if (!res.ok) throw new Error('Erro ao carregar tarefas');
    state.tasks = await res.json();
  } catch (e) {
    console.error(e);
    // Fallback local para não ficar em branco se a chamada falhar
    state.tasks = [
      { id: 'local-1', title: 'Bem-vindo! Adicione tarefas.', done: false },
      { id: 'local-2', title: 'Marque como concluído para testar.', done: true }
    ];
    setStatus('Sem ligação à API, a usar dados locais.', 'warn');
  }
  state.loading = false;
}

function render(tasks) {
  const root = document.getElementById('app');
  const doneCount = tasks.filter(t => t.done).length;
  root.innerHTML = `
    <div class="card">
      <div class="header">
        <div>
          <p class="eyebrow">Organize o seu dia</p>
          <h2>Aplicativo de Tarefas</h2>
        </div>
        <span class="badge">${doneCount}/${tasks.length} feitas</span>
      </div>
      <div id="status" class="status info"></div>
      <form id="taskForm" class="task-form">
        <input id="taskInput" placeholder="Adicionar tarefa..." />
        <button type="submit">Adicionar</button>
      </form>
      <ul id="taskList" class="task-list"></ul>
    </div>
  `;

  const list = document.getElementById('taskList');
  list.innerHTML = '';
  if (!tasks.length) {
    const empty = document.createElement('li');
    empty.className = 'task-item empty';
    empty.textContent = state.loading ? 'Carregando...' : 'Nenhuma tarefa. Adicione a primeira!';
    list.appendChild(empty);
  }

  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task-item' + (t.done ? ' done' : '');
    li.onclick = async () => {
      try {
        await fetch(apiBase + '/tasks/' + (t._id || t.id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: !t.done })
        });
        setStatus(`Tarefa "${t.title}" ${t.done ? 'reaberta' : 'concluída'}.`, 'success');
      } catch (err) {
        setStatus('Não foi possível actualizar a tarefa.', 'error');
      }
      fetchTasks().then(() => render(state.tasks));
    };
    const del = document.createElement('button');
    del.className = 'ghost';
    del.textContent = 'Remover';
    del.onclick = async (e) => {
      e.stopPropagation();
      try {
        await fetch(apiBase + '/tasks/' + (t._id || t.id), { method: 'DELETE' });
        setStatus(`Tarefa "${t.title}" removida.`, 'warn');
      } catch (err) {
        setStatus('Não foi possível remover a tarefa.', 'error');
      }
      fetchTasks().then(() => render(state.tasks));
    };

    const content = document.createElement('div');
    content.className = 'task-main';
    const checkbox = document.createElement('span');
    checkbox.className = 'checkbox';
    checkbox.textContent = t.done ? '✔' : '○';
    const textWrap = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = t.title;
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = 'Clique para alternar status';

    textWrap.appendChild(title);
    textWrap.appendChild(meta);
    content.appendChild(checkbox);
    content.appendChild(textWrap);

    li.appendChild(content);
    li.appendChild(del);
    list.appendChild(li);
  });

  const form = document.getElementById('taskForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    if (!title) {
      setStatus('Digite uma tarefa antes de adicionar.', 'error');
      return;
    }
    try {
      await fetch(apiBase + '/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      setStatus('Tarefa adicionada com sucesso.', 'success');
      fetchTasks().then(() => render(state.tasks));
    } catch (err) {
      console.error('Erro ao criar tarefa', err);
      setStatus('Não foi possível criar a tarefa.', 'error');
    }
    input.value = '';
  };
}

// initial load
fetchTasks().then(() => {
  render(state.tasks);
  setStatus('Clique numa tarefa para marcar como concluída ou reabrir.', 'info');
});
