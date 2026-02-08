 <?php
include '../includes/config.php';
session_start();
if(!isset($_SESSION['cliente_id']) && !isset($_SESSION['admin_logged_in'])) header('Location: login.php');

// Determine if user is admin or client
$is_admin = isset($_SESSION['admin_logged_in']);
$is_client = isset($_SESSION['cliente_id']);

// Handle adding new piece (only for admins)
$message = '';
if ($is_admin && $_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_peca'])) {
    try {
        $stmt = $pdo->prepare('INSERT INTO pecas (tipo, nome, preco, estoque, categoria, imagem, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $_POST['tipo'],
            $_POST['nome'],
            $_POST['preco'],
            $_POST['estoque'],
            $_POST['categoria'] ?? '',
            $_POST['imagem'] ?? '',
            $_POST['descricao'] ?? ''
        ]);
        $message = 'Peça adicionada com sucesso!';
    } catch (PDOException $e) {
        $message = 'Erro: ' . $e->getMessage();
    }
}

// Admin statistics
if ($is_admin) {
    $stmt_total_clients = $pdo->prepare("SELECT COUNT(*) as total_clients FROM clientes");
    $stmt_total_clients->execute();
    $total_clients = $stmt_total_clients->fetch()['total_clients'] ?? 0;

    $stmt_total_projects = $pdo->prepare("SELECT COUNT(*) as total_projects FROM solicitacoes");
    $stmt_total_projects->execute();
    $total_projects = $stmt_total_projects->fetch()['total_projects'] ?? 0;

    $stmt_total_revenue = $pdo->prepare("SELECT SUM(valor) as total_revenue FROM pagamentos WHERE status = 'Pago'");
    $stmt_total_revenue->execute();
    $total_revenue = $stmt_total_revenue->fetch()['total_revenue'] ?? 0;

    $stmt_pending_payments = $pdo->prepare("SELECT SUM(valor) as pending_payments FROM pagamentos WHERE status = 'Pendente'");
    $stmt_pending_payments->execute();
    $pending_payments = $stmt_pending_payments->fetch()['pending_payments'] ?? 0;

    $stmt_total_risks = $pdo->prepare("SELECT COUNT(*) as total_risks FROM riscos");
    $stmt_total_risks->execute();
    $total_risks = $stmt_total_risks->fetch()['total_risks'] ?? 0;

    // Recent clients
    $stmt_recent_clients = $pdo->prepare("SELECT id, nome, email, data_cadastro FROM clientes ORDER BY data_cadastro DESC LIMIT 5");
    $stmt_recent_clients->execute();
    $recent_clients = $stmt_recent_clients->fetchAll();

    // Recent projects
    $stmt_recent_projects = $pdo->prepare("SELECT id, cliente_email, total, status, data_solicitacao FROM solicitacoes ORDER BY data_solicitacao DESC LIMIT 5");
    $stmt_recent_projects->execute();
    $recent_projects = $stmt_recent_projects->fetchAll();
}

// Client data
if ($is_client) {
    $stmt = $pdo->prepare('SELECT * FROM solicitacoes WHERE cliente_email=(SELECT email FROM clientes WHERE id=?)');
    $stmt->execute([$_SESSION['cliente_id']]);
    $solicitacoes = $stmt->fetchAll();

    // Dados financeiros para o dashboard
    $stmt_pagamentos = $pdo->prepare("SELECT SUM(valor) as total_recebido FROM pagamentos WHERE status = 'Pago'");
    $stmt_pagamentos->execute();
    $total_recebido = $stmt_pagamentos->fetch()['total_recebido'] ?? 0;

    $stmt_pendentes = $pdo->prepare("SELECT SUM(valor) as total_pendente FROM pagamentos WHERE status = 'Pendente'");
    $stmt_pendentes->execute();
    $total_pendente = $stmt_pendentes->fetch()['total_pendente'] ?? 0;

    $stmt_projetos = $pdo->prepare("SELECT COUNT(*) as total_projetos FROM solicitacoes");
    $stmt_projetos->execute();
    $total_projetos = $stmt_projetos->fetch()['total_projetos'] ?? 0;
}
?>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard - Xkairos Tech</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<style>
:root {
    --primary-color: #00F0FF;
    --secondary-color: #FF6B35;
    --dark-bg: #121212;
    --card-bg: rgba(255, 255, 255, 0.08);
    --text-color: #E0E0E0;
    --border-color: rgba(0, 240, 255, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, var(--dark-bg) 0%, #1a1a1a 100%);
    color: var(--text-color);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
}

.header {
    background: var(--card-bg);
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 30px;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
}

.header h1 {
    color: var(--primary-color);
    font-size: 2.5rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.header h1 i {
    color: var(--secondary-color);
}

.header p {
    font-size: 1.1rem;
    opacity: 0.8;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: var(--card-bg);
    padding: 25px;
    border-radius: 15px;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    text-align: center;
}

.stat-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary-color);
    box-shadow: 0 10px 30px rgba(0, 240, 255, 0.1);
}

.stat-card i {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 15px;
}

.stat-card h3 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 5px;
}

.stat-card p {
    font-size: 0.9rem;
    opacity: 0.8;
}

.section {
    background: var(--card-bg);
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 30px;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
}

.section h2 {
    color: var(--primary-color);
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.8rem;
}

.section h2 i {
    color: var(--secondary-color);
}

.table-responsive {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    overflow: hidden;
}

th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

th {
    background: rgba(0, 240, 255, 0.1);
    color: var(--primary-color);
    font-weight: 600;
}

tr:hover {
    background: rgba(255, 255, 255, 0.05);
}

.btn {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: var(--dark-bg);
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    margin: 5px;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-color);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--primary-color);
}

.form-group select {
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-color);
    font-size: 14px;
    transition: all 0.3s ease;
}

.form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    background: rgba(0, 240, 255, 0.05);
}

.form-group select option {
    background: var(--dark-bg);
    color: var(--text-color);
}

.checklist-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
}

.checklist-item.completed {
    background: rgba(40, 167, 69, 0.1);
    border-left: 4px solid #28a745;
}

.checklist-item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--primary-color);
}

.checklist-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.checklist-progress {
    display: flex;
    align-items: center;
    gap: 15px;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    width: 0%;
    transition: width 0.5s ease;
}

.progress-text {
    font-weight: 600;
    color: var(--primary-color);
    min-width: 100px;
    text-align: right;
}

.checklist-items {
    list-style: none;
    padding: 0;
    margin: 0;
}

.checklist-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn-container {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.logout-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
}

.status-pendente {
    background-color: #4a4a4a;
    color: #ff6b6b;
    padding: 6px 12px;
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
}

.status-parcial {
    background-color: #4a4a4a;
    color: #ffa726;
    padding: 6px 12px;
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
}

.status-pago {
    background-color: #4a4a4a;
    color: #66bb6a;
    padding: 6px 12px;
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
}

.status-aberto {
    background-color: #4a4a4a;
    color: #ff6b6b;
    padding: 6px 12px;
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
}

.status-em-mitigacao {
    background-color: #4a4a4a;
    color: #ffa726;
    padding: 6px 12px;
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
}

.status-mitigado {
    background-color: #4a4a4a;
    color: #66bb6a;
    padding: 6px 12px;
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
}

[class*="status-"] {
    padding: 6px 12px;
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
    background-color: #333;
    color: #E0E0E0;
}
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .header {
        padding: 20px;
    }

    .header h1 {
        font-size: 2rem;
    }

    .section {
        padding: 20px;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
</head>
<body>
<div class="container">
    <a href='logout.php' class="btn logout-btn">
        <i class="fas fa-sign-out-alt"></i> Sair
    </a>

    <div class="header">
        <h1><i class="fas fa-tachometer-alt"></i> Bem-vindo, <?= $is_admin ? 'Administrador' : $_SESSION['cliente_nome'] ?></h1>
        <p><?= $is_admin ? 'Painel de administração - Gerencie clientes, projetos e sistema' : 'Gerencie seus projetos e acompanhe o progresso em tempo real' ?></p>
    </div>

    <!-- Admin Statistics -->
    <?php if ($is_admin): ?>
    <div class="stats-grid">
        <div class="stat-card">
            <i class="fas fa-users"></i>
            <h3><?= $total_clients ?></h3>
            <p>Total de Clientes</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-project-diagram"></i>
            <h3><?= $total_projects ?></h3>
            <p>Total de Projetos</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-euro-sign"></i>
            <h3>€<?= number_format($total_revenue, 2) ?></h3>
            <p>Receita Total</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-clock"></i>
            <h3>€<?= number_format($pending_payments, 2) ?></h3>
            <p>Pagamentos Pendentes</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-exclamation-triangle"></i>
            <h3><?= $total_risks ?></h3>
            <p>Total de Riscos</p>
        </div>
    </div>
    <?php endif; ?>

    <!-- Client Statistics -->
    <?php if ($is_client): ?>
    <div class="stats-grid">
        <div class="stat-card">
            <i class="fas fa-euro-sign"></i>
            <h3>€<?= number_format($total_recebido, 2) ?></h3>
            <p>Total Recebido</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-clock"></i>
            <h3>€<?= number_format($total_pendente, 2) ?></h3>
            <p>Total Pendente</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-project-diagram"></i>
            <h3><?= $total_projetos ?></h3>
            <p>Total de Projetos</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-check-circle"></i>
            <h3><?= count($solicitacoes) ?></h3>
            <p>Suas Solicitações</p>
        </div>
    </div>
    <?php endif; ?>

    <!-- Recent Clients and Projects for Admins -->
    <?php if ($is_admin): ?>
    <div class="section">
        <h2><i class="fas fa-users"></i> Clientes Recentes</h2>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Data de Cadastro</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recent_clients as $client): ?>
                    <tr>
                        <td><?= $client['id'] ?></td>
                        <td><?= $client['nome'] ?></td>
                        <td><?= $client['email'] ?></td>
                        <td><?= isset($client['data_cadastro']) ? $client['data_cadastro'] : (isset($client['data_registro']) ? $client['data_registro'] : 'N/A') ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="section">
        <h2><i class="fas fa-project-diagram"></i> Projetos Recentes</h2>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email do Cliente</th>
                        <th>Total (€)</th>
                        <th>Status</th>
                        <th>Data da Solicitação</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recent_projects as $project): ?>
                    <tr>
                        <td><?= $project['id'] ?></td>
                        <td><?= $project['cliente_email'] ?></td>
                        <td>€<?= number_format($project['total'], 2) ?></td>
                        <td class="status-<?= strtolower(str_replace(' ', '-', $project['status'])) ?>"><?= $project['status'] ?></td>
                        <td><?= $project['data_solicitacao'] ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Quick Management Links for Admins -->
    <div class="section">
        <h2><i class="fas fa-cogs"></i> Gestão Rápida</h2>
        <div class="btn-container">
            <a href="../admin/clientes.php" class="btn"><i class="fas fa-users"></i> Gerenciar Clientes</a>
            <a href="../admin/pecas.php" class="btn"><i class="fas fa-cogs"></i> Gerenciar Peças</a>
            <a href="../admin/checklist.php" class="btn"><i class="fas fa-clipboard-list"></i> Gerenciar Checklists</a>
            <a href="../orcamentos.php" class="btn"><i class="fas fa-file-alt"></i> Ver Orçamentos</a>
        </div>
    </div>
    <?php endif; ?>

    <!-- Client-specific content -->
    <?php if ($is_client): ?>
    <h3>Suas solicitações</h3>
<?php if(count($solicitacoes)===0) echo '<p>Nenhuma solicitação encontrada.</p>'; ?>
<table border='1' cellpadding='10'>
<tr><th>ID</th><th>CPU</th><th>GPU</th><th>RAM</th><th>SSD</th><th>Total (€)</th><th>Status</th><th>Data</th><th>PDF</th><th>Pagar</th></tr>
<?php foreach($solicitacoes as $s): ?>
<tr>
<td><?= $s['id'] ?></td>
<td><?= $s['cpu'] ?></td>
<td><?= $s['gpu'] ?></td>
<td><?= $s['ram'] ?></td>
<td><?= $s['ssd'] ?></td>
<td><?= $s['total'] ?></td>
<td><?= $s['status'] ?></td>
<td><?= $s['data_solicitacao'] ?></td>
<td><a href='orcamento.php?id=<?= $s['id'] ?>' target='_blank'>PDF</a></td>
<td>
<form action='pagamento_mbway.php' method='POST'>
<input type='hidden' name='solicitacao_id' value='<?= $s['id'] ?>'>
<input type='hidden' name='valor' value='<?= $s['total'] ?>'>
<button type='submit'>MBWAY</button>
</form>
</td>
</tr>
<?php endforeach; ?>
</table>
<?php endif; ?>

<!-- Adicionar Peça ao Site -->
<div class="dashboard-section">
    <h3>Adicionar Peça ao Site</h3>
    <form id="add-peca-form" method="POST" action="">
        <div class="form-grid">
            <div class="form-group">
                <label for="tipo">Tipo:</label>
                <select name="tipo" id="tipo" required>
                    <option value="">Selecione</option>
                    <option value="CPU">CPU</option>
                    <option value="GPU">GPU</option>
                    <option value="RAM">RAM</option>
                    <option value="SSD">SSD</option>
                    <option value="Placa Mãe">Placa Mãe</option>
                    <option value="Cooler">Cooler</option>
                </select>
            </div>
            <div class="form-group">
                <label for="nome">Nome:</label>
                <input type="text" name="nome" id="nome" required>
            </div>
            <div class="form-group">
                <label for="preco">Preço (€):</label>
                <input type="number" name="preco" id="preco" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="estoque">Estoque:</label>
                <input type="number" name="estoque" id="estoque" required>
            </div>
            <div class="form-group">
                <label for="categoria">Categoria:</label>
                <input type="text" name="categoria" id="categoria">
            </div>
            <div class="form-group">
                <label for="imagem">URL da Imagem:</label>
                <input type="url" name="imagem" id="imagem">
            </div>
        </div>
        <div class="form-group">
            <label for="descricao">Descrição:</label>
            <textarea name="descricao" id="descricao"></textarea>
        </div>
        <button type="submit" name="add_peca" class="btn">Adicionar Peça</button>
    </form>
</div>

<div class="section" id="financeiro-dashboard">
    <h2><i class="fas fa-euro-sign"></i> Financeiro</h2>
    <div class="table-responsive">
        <table id="financeiro-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Taxa Fixa</th>
                    <th>Peças</th>
                    <th>Margem</th>
                    <th>Serviços</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>

<div class="section" id="riscos-dashboard">
    <h2><i class="fas fa-exclamation-triangle"></i> Gestão de Riscos</h2>
    <div class="table-responsive">
        <table id="riscos-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Projeto</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Probabilidade</th>
                    <th>Impacto</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <div class="checklist-actions">
        <button onclick="generateRiscosPDF()" class="btn btn-secondary">
            <i class="fas fa-file-pdf"></i> Gerar PDF de Riscos
        </button>
    </div>
</div>

<div class="section" id="checklist-dashboard">
    <h2><i class="fas fa-clipboard-list"></i> Checklist do Projeto</h2>
    <div class="checklist-container">
        <div class="checklist-progress">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
            <span class="progress-text" id="progress-text">0% Concluído</span>
        </div>
        <ul id="dashboard-checklist" class="checklist-items"></ul>
        <div class="checklist-actions">
            <button id="dashboard-saveBtn" class="btn">
                <i class="fas fa-save"></i> Salvar Progresso
            </button>
            <button id="dashboard-pdfBtn" class="btn btn-secondary">
                <i class="fas fa-file-pdf"></i> Gerar PDF do Checklist
            </button>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
const projeto_id = 1; // Ajuste dinamicamente conforme o projeto do usuário

function loadDashboardChecklist() {
    fetch('checklist_api.php', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({action:'load', projeto_id})
    })
    .then(res=>res.json())
    .then(data=>{
        const ul = document.getElementById('dashboard-checklist');
        ul.innerHTML = '';
        let completedCount = 0;
        data.forEach(item=>{
            const li = document.createElement('li');
            li.className = 'checklist-item';
            li.innerHTML = `<input type="checkbox" data-etapa="${item.etapa}" ${item.concluida==1?'checked':''}> <span>${item.etapa}</span>`;
            if(item.concluida==1) {
                li.classList.add('completed');
                completedCount++;
            }
            ul.appendChild(li);
        });

        // Update progress bar
        const progressPercent = data.length > 0 ? (completedCount / data.length) * 100 : 0;
        document.getElementById('progress-fill').style.width = progressPercent + '%';
        document.getElementById('progress-text').textContent = Math.round(progressPercent) + '% Concluído';

        document.querySelectorAll('#dashboard-checklist input').forEach(chk=>{
            chk.addEventListener('change', ()=>{
                if(chk.checked){
                    chk.parentElement.classList.add('completed');
                    completedCount++;
                    Swal.fire({
                        icon: 'success',
                        title: 'Etapa concluída!',
                        text: chk.dataset.etapa,
                        toast: true,
                        position: 'top-end',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    chk.parentElement.classList.remove('completed');
                    completedCount--;
                }
                // Update progress after change
                const newProgress = data.length > 0 ? (completedCount / data.length) * 100 : 0;
                document.getElementById('progress-fill').style.width = newProgress + '%';
                document.getElementById('progress-text').textContent = Math.round(newProgress) + '% Concluído';
            });
        });
    });
}

// Botão salvar
document.getElementById('dashboard-saveBtn').addEventListener('click', ()=>{
    const data = {};
    document.querySelectorAll('#dashboard-checklist input').forEach(chk=>{
        data[chk.dataset.etapa] = chk.checked ? 1 : 0;
    });

    fetch('checklist_api.php', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({action:'save', projeto_id, data: JSON.stringify(data)})
    }).then(res=>res.json()).then(res=>{
        if(res.status==='success'){
            Swal.fire({
                icon: 'success',
                title: 'Progresso salvo!',
                toast: true,
                position: 'top-end',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
});

// Botão gerar PDF
document.getElementById('dashboard-pdfBtn').addEventListener('click', ()=>{
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'checklist_api.php';
    form.target = '_blank';

    const action = document.createElement('input');
    action.name = 'action'; action.value = 'pdf'; form.appendChild(action);

    const pid = document.createElement('input');
    pid.name = 'projeto_id'; pid.value = projeto_id; form.appendChild(pid);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
});

function loadFinanceiro(){
    fetch('pagamentos_api.php', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:'action=list'
    }).then(res=>res.json()).then(data=>{
        const tbody = document.querySelector('#financeiro-table tbody');
        tbody.innerHTML = '';
        data.forEach(p=>{
            const statusClass = 'status-' + p.status.toLowerCase();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.cliente_nome}</td>
                <td>€${p.taxa_fixa}</td>
                <td>€${p.valor_pecas}</td>
                <td>€${p.margem}</td>
                <td>€${p.servicos_adicionais}</td>
                <td>€${p.total}</td>
                <td class="${statusClass}">${p.status}</td>
                <td>
                    <select onchange="updateStatus(${p.id}, this.value)">
                        <option value="Pendente" ${p.status==='Pendente'?'selected':''}>Pendente</option>
                        <option value="Parcial" ${p.status==='Parcial'?'selected':''}>Parcial</option>
                        <option value="Pago" ${p.status==='Pago'?'selected':''}>Pago</option>
                    </select>
                    <button onclick="payMBWay(${p.id})">MBWay</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function updateStatus(id, status){
    fetch('pagamentos_api.php', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:`action=updateStatus&id=${id}&status=${status}`
    }).then(res=>res.json()).then(r=>{
        if(r.status==='success') loadFinanceiro();
    });
}

function payMBWay(id){
    fetch('pagamentos_api.php', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:`action=mbwayPayment&id=${id}`
    }).then(res=>res.json()).then(r=>{
        Swal.fire({
            icon: 'success',
            title: 'Pagamento MBWay realizado!',
            toast: true,
            position: 'top-end',
            timer: 1500,
            showConfirmButton: false
        });
        loadFinanceiro();
    });
}

function loadRiscos(){
    fetch('riscos_api.php', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({action:'list', projeto_id})
    }).then(res=>res.json()).then(data=>{
        const tbody = document.querySelector('#riscos-table tbody');
        tbody.innerHTML = '';
        data.forEach(r=>{
            const statusClass = 'status-' + r.status.toLowerCase().replace(' ', '-');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.id}</td>
                <td>${r.projeto_id}</td>
                <td>${r.descricao}</td>
                <td>${r.categoria}</td>
                <td>${r.probabilidade}</td>
                <td>${r.impacto}</td>
                <td class="${statusClass}">${r.status}</td>
                <td>
                    <select onchange="updateRiscoStatus(${r.id}, this.value)">
                        <option value="Aberto" ${r.status==='Aberto'?'selected':''}>Aberto</option>
                        <option value="Em Mitigacao" ${r.status==='Em Mitigacao'?'selected':''}>Em Mitigação</option>
                        <option value="Mitigado" ${r.status==='Mitigado'?'selected':''}>Mitigado</option>
                    </select>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function updateRiscoStatus(id, status){
    fetch('riscos_api.php', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:`action=updateStatus&id=${id}&status=${status}`
    }).then(res=>res.json()).then(r=>{
        if(r.status==='success') {
            loadRiscos();
            Swal.fire({
                icon: 'success',
                title: 'Status do risco atualizado!',
                toast: true,
                position: 'top-end',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function generateRiscosPDF(){
    window.open('generate_riscos_pdf.php', '_blank');
}

// Inicializa checklist, financeiro e riscos
loadDashboardChecklist();
loadFinanceiro();
loadRiscos();
</script>
</body>
</html>
