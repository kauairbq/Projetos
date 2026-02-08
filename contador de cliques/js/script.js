// Variável para armazenar o número de cliques
let totalCliques = parseInt(localStorage.getItem('totalCliques')) || 0;

// Função para atualizar o valor exibido e aplicar animação
function atualizarValor() {
    const box = document.getElementById("counterBox");
    const valorEl = document.getElementById("valor");

    // Atualizar o texto
    valorEl.textContent = totalCliques;

    // Aplicar animação "bump"
    box.classList.add("bump");
    setTimeout(() => box.classList.remove("bump"), 150);

    // Salvar no localStorage
    localStorage.setItem('totalCliques', totalCliques);

    // Atualizar cores dinâmicas
    atualizarCores();
}

// Função para atualizar cores dinâmicas
function atualizarCores() {
    const box = document.getElementById("counterBox");
    const valorEl = document.getElementById("valor");

    // Remover classes anteriores
    box.classList.remove("positivo", "negativo", "zero");

    if (totalCliques > 0) {
        box.classList.add("positivo");
    } else if (totalCliques < 0) {
        box.classList.add("negativo");
    } else {
        box.classList.add("zero");
    }
}

// Função para incrementar
function incrementar() {
    totalCliques++;
    atualizarValor();
}

// Função para decrementar (com validação para não permitir negativos)
function decrementar() {
    if (totalCliques > 0) {
        totalCliques--;
        atualizarValor();
    } else {
        alert("O contador não pode ser negativo!");
    }
}

// Função para repor
function repor() {
    totalCliques = 0;
    atualizarValor();
}

// Inicializar cores ao carregar a página
document.addEventListener('DOMContentLoaded', atualizarCores);
