class Produto {
  constructor(id, nome, preco, descricao, categoria, apiId = '') {
    this.id = id;
    this.nome = nome;
    this.preco = preco;
    this.descricao = descricao;
    this.categoria = categoria;
    this.apiId = apiId;
  }
}

class Catalogo {
  constructor() {
    this.storageKey = 'catalogo-produtos';
    this.produtos = [];
    this.carregarProdutos();
    if (this.produtos.length === 0) {
      this.semear();
      this.salvarProdutos();
    }
  }

  semear() {
    this.produtos = [
      new Produto(1, 'Auriculares Wireless', 59.9, 'Bluetooth 5.3, ANC leve, 30h de bateria.', 'Audio', 1),
      new Produto(2, 'Portatil 14" Pro', 1299.9, 'Intel i7, 16GB RAM, SSD 512GB, ecra IPS.', 'Informatica', 2),
      new Produto(3, 'Monitor 27" 144Hz', 299.9, 'Painel IPS, QHD, 1ms, G-Sync compativel.', 'Perifericos', 3)
    ];
  }

  gerarProximoId() {
    if (this.produtos.length === 0) return 1;
    return Math.max(...this.produtos.map(p => p.id)) + 1;
  }

  adicionarProduto(produto) {
    this.produtos.push(produto);
    this.salvarProdutos();
  }

  removerProduto(id) {
    this.produtos = this.produtos.filter(p => p.id !== id);
    this.salvarProdutos();
  }

  editarProduto(id, novosDados) {
    const idx = this.produtos.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.produtos[idx] = { ...this.produtos[idx], ...novosDados };
      this.salvarProdutos();
    }
  }

  salvarProdutos() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.produtos));
  }

  carregarProdutos() {
    const guardados = localStorage.getItem(this.storageKey);
    if (guardados) {
      try {
        const data = JSON.parse(guardados);
        this.produtos = data.map(d => new Produto(d.id, d.nome, d.preco, d.descricao, d.categoria, d.apiId));
      } catch (e) {
        console.error('Erro ao carregar do localStorage', e);
        this.produtos = [];
      }
    }
  }
}

const catalogo = new Catalogo();

const form = document.getElementById('form-produto');
const nomeInput = document.getElementById('nome');
const precoInput = document.getElementById('preco');
const categoriaInput = document.getElementById('categoria');
const apiIdInput = document.getElementById('api-id');
const descricaoInput = document.getElementById('descricao');
const filtroCategoria = document.getElementById('filtro-categoria');
const tabelaBody = document.querySelector('#tabela-produtos tbody');
const statusEl = document.getElementById('status');

function setStatus(msg, tipo = 'info') {
  statusEl.textContent = msg;
  statusEl.className = `status ${tipo}`;
}

function validar(nome, preco, categoria, descricao) {
  if (!nome.trim()) return 'O nome e obrigatorio.';
  if (Number.isNaN(preco) || preco < 0) return 'O preco deve ser positivo.';
  if (!categoria.trim()) return 'A categoria e obrigatoria.';
  if (!descricao.trim()) return 'A descricao e obrigatoria.';
  return '';
}

function preencherFiltroCategoria() {
  const seleccao = filtroCategoria.value || 'todas';
  const categorias = Array.from(new Set(catalogo.produtos.map(p => p.categoria))).sort();
  filtroCategoria.innerHTML = '<option value="todas">Todas</option>';
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    filtroCategoria.appendChild(opt);
  });
  if (Array.from(filtroCategoria.options).some(o => o.value === seleccao)) {
    filtroCategoria.value = seleccao;
  }
}

function criarLinha(produto) {
  const tr = document.createElement('tr');
  const apiLabel = produto.apiId ? produto.apiId : '-';
  const desc = produto.descricao || '';
  tr.innerHTML = `
    <td>${produto.id}</td>
    <td class="nome-cell">${produto.nome}</td>
    <td class="preco-cell">${produto.preco.toFixed(2)}</td>
    <td class="cat-cell">${produto.categoria}</td>
    <td class="api-cell">${apiLabel}</td>
    <td class="desc-cell">${desc}</td>
    <td>
      <div class="acoes">
        <button class="mini-btn edit">Editar</button>
        <button class="mini-btn delete">Excluir</button>
        <button class="mini-btn details">Detalhes</button>
      </div>
    </td>
  `;

  const btnEditar = tr.querySelector('.edit');
  const btnExcluir = tr.querySelector('.delete');
  const btnDetalhes = tr.querySelector('.details');

  btnEditar.addEventListener('click', () => alternarEdicao(tr, produto.id));
  btnExcluir.addEventListener('click', () => {
    catalogo.removerProduto(produto.id);
    setStatus(`Produto #${produto.id} removido.`, 'warn');
    actualizarTabela();
  });
  btnDetalhes.addEventListener('click', () => buscarDetalhes(produto.id));

  return tr;
}

function alternarEdicao(tr, id) {
  const produto = catalogo.produtos.find(p => p.id === id);
  if (!produto) return;
  const emEdicao = tr.classList.contains('editing');
  const nomeCell = tr.querySelector('.nome-cell');
  const precoCell = tr.querySelector('.preco-cell');
  const catCell = tr.querySelector('.cat-cell');
  const apiCell = tr.querySelector('.api-cell');
  const descCell = tr.querySelector('.desc-cell');
  const btnEditar = tr.querySelector('.edit');

  if (!emEdicao) {
    nomeCell.innerHTML = `<input class="input-inline" value="${produto.nome}">`;
    precoCell.innerHTML = `<input class="input-inline" type="number" min="0" step="0.01" value="${produto.preco}">`;
    catCell.innerHTML = `<input class="input-inline" value="${produto.categoria}">`;
    apiCell.innerHTML = `<input class="input-inline" type="number" min="1" value="${produto.apiId || ''}">`;
    descCell.innerHTML = `<textarea class="input-inline" rows="2">${produto.descricao}</textarea>`;
    btnEditar.textContent = 'Guardar';
    tr.classList.add('editing');
  } else {
    const novoNome = nomeCell.querySelector('input').value.trim();
    const novoPreco = parseFloat(precoCell.querySelector('input').value);
    const novaCat = catCell.querySelector('input').value.trim();
    const novoApi = apiCell.querySelector('input').value.trim();
    const novaDesc = descCell.querySelector('textarea').value.trim();
    const erro = validar(novoNome, novoPreco, novaCat, novaDesc);
    if (erro) {
      setStatus(erro, 'error');
      return;
    }
    const apiId = novoApi ? Number(novoApi) : '';
    catalogo.editarProduto(id, { nome: novoNome, preco: novoPreco, categoria: novaCat, apiId, descricao: novaDesc });
    setStatus(`Produto #${id} atualizado.`, 'success');
    actualizarTabela();
  }
}

function actualizarTabela() {
  tabelaBody.innerHTML = '';
  const categoriaSelecionada = filtroCategoria.value;
  const lista = catalogo.produtos.filter(p => categoriaSelecionada === 'todas' || p.categoria === categoriaSelecionada);

  if (lista.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="7" style="text-align:center;color:var(--muted);">Nenhum produto.</td>`;
    tabelaBody.appendChild(tr);
  } else {
    lista.forEach(prod => tabelaBody.appendChild(criarLinha(prod)));
  }
  preencherFiltroCategoria();
}

async function buscarDetalhes(id) {
  setStatus(`A obter detalhes externos para o produto #${id}...`, 'info');
  try {
    const produto = catalogo.produtos.find(p => p.id === id);
    const apiId = produto && produto.apiId ? produto.apiId : id;
    const res = await fetch(`https://fakestoreapi.com/products/${apiId}`);
    if (!res.ok) throw new Error('Resposta nao OK');
    const data = await res.json();
    alert(`Detalhes (Fake Store API):\n\n${data.title || 'Sem titulo'}\n\n${data.description || 'Sem descricao.'}`);
    setStatus('Detalhes obtidos da API.', 'success');
  } catch (err) {
    console.error(err);
    setStatus('Nao foi possivel obter detalhes externos.', 'error');
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = nomeInput.value.trim();
  const preco = parseFloat(precoInput.value);
  const categoria = categoriaInput.value.trim();
  const descricao = descricaoInput.value.trim();
  const apiRaw = apiIdInput.value.trim();
  const apiId = apiRaw ? Number(apiRaw) : '';

  const erro = validar(nome, preco, categoria, descricao);
  if (erro) {
    setStatus(erro, 'error');
    return;
  }

  const id = catalogo.gerarProximoId();
  const produto = new Produto(id, nome, preco, descricao, categoria, apiId);
  catalogo.adicionarProduto(produto);
  setStatus(`Produto "${nome}" adicionado com sucesso.`, 'success');
  actualizarTabela();
  form.reset();
});

document.getElementById('limpar').addEventListener('click', () => {
  form.reset();
  setStatus('Formulario limpo.', 'info');
});

filtroCategoria.addEventListener('change', actualizarTabela);

actualizarTabela();
setStatus('Clique em "Detalhes" para obter info externa via API.', 'info');
