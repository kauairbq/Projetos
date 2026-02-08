let catalogo = { categories: [], products: [] };
const produtosEl = document.getElementById('produtos');
const filtroSelect = document.getElementById('filtro-categorias');
const contador = document.getElementById('contador');
const produtoSelect = document.getElementById('produto-select');
const quantidadeInput = document.getElementById('quantidade');
const totalEl = document.getElementById('total');
const mensagemEl = document.getElementById('mensagem');
const lightbox = document.getElementById('lightbox');
const lbTitulo = document.getElementById('lb-titulo');
const lbDescricao = document.getElementById('lb-descricao');
const lbPreco = document.getElementById('lb-preco');
const lbImagem = document.getElementById('lb-imagem');
const btnFechar = document.querySelector('.fechar');

async function carregarCatalogo() {
  try {
    const res = await fetch('data/catalog.json');
    if (!res.ok) throw new Error('Falha no fetch');
    catalogo = await res.json();
    preencherFiltros();
    renderProdutos();
    preencherSelectProdutos();
  } catch (e) {
    console.error(e);
    mensagemEl.textContent = 'Não foi possível carregar o catálogo.';
    mensagemEl.className = 'mensagem error';
  }
}

function preencherFiltros() {
  filtroSelect.innerHTML = '<option value=\"\">Todas as categorias</option>';
  catalogo.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    filtroSelect.appendChild(opt);
  });
}

function renderProdutos() {
  produtosEl.innerHTML = '';
  const categoria = filtroSelect.value;
  const lista = catalogo.products.filter(p => !categoria || p.category === categoria);
  contador.textContent = `${lista.length} itens`;

  if (lista.length === 0) {
    produtosEl.innerHTML = '<p class=\"mensagem\">Nenhum produto nesta categoria.</p>';
    return;
  }

  lista.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'produto';
    card.innerHTML = `
      <img src=\"${prod.image}\" alt=\"${prod.name}\">
      <h3>${prod.name}</h3>
      <p>${prod.description}</p>
      <p class=\"preco\">€ ${Number(prod.price).toFixed(2)}</p>
      <div class=\"acoes\">
        <button class=\"btn-det\">Ver detalhes</button>
        <button class=\"btn-add\">Selecionar</button>
      </div>
    `;
    card.querySelector('.btn-det').addEventListener('click', () => abrirLightbox(prod));
    card.querySelector('.btn-add').addEventListener('click', () => {
      produtoSelect.value = prod.id;
      quantidadeInput.focus();
      mensagemEl.textContent = `Produto \"${prod.name}\" selecionado.`;
      mensagemEl.className = 'mensagem success';
    });
    produtosEl.appendChild(card);
  });
}

function preencherSelectProdutos() {
  produtoSelect.innerHTML = '<option value=\"\">Seleciona um produto</option>';
  catalogo.products.forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod.id;
    opt.textContent = `${prod.name} — € ${Number(prod.price).toFixed(2)}`;
    produtoSelect.appendChild(opt);
  });
}

function calcularTotal(e) {
  e.preventDefault();
  const id = produtoSelect.value;
  const qtd = Number(quantidadeInput.value);
  if (!id) {
    mensagemEl.textContent = 'Escolhe um produto.';
    mensagemEl.className = 'mensagem error';
    return;
  }
  if (Number.isNaN(qtd) || qtd <= 0) {
    mensagemEl.textContent = 'Quantidade deve ser positiva.';
    mensagemEl.className = 'mensagem error';
    return;
  }
  const prod = catalogo.products.find(p => p.id === id);
  if (!prod) {
    mensagemEl.textContent = 'Produto não encontrado.';
    mensagemEl.className = 'mensagem error';
    return;
  }
  const total = qtd * Number(prod.price);
  totalEl.textContent = `Valor total: € ${total.toFixed(2)}`;
  mensagemEl.textContent = 'Cálculo realizado.';
  mensagemEl.className = 'mensagem success';
}

function abrirLightbox(prod) {
  lbTitulo.textContent = prod.name;
  lbDescricao.textContent = prod.description;
  lbPreco.textContent = `Preço: € ${Number(prod.price).toFixed(2)}`;
  lbImagem.src = prod.image;
  lbImagem.alt = prod.name;
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
}

function fecharLightbox() {
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
}

filtroSelect.addEventListener('change', () => {
  renderProdutos();
});

document.getElementById('form-total').addEventListener('submit', calcularTotal);
btnFechar.addEventListener('click', fecharLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) fecharLightbox();
});

carregarCatalogo();
