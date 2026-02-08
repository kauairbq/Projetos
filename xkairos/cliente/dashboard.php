<?php
include '../includes/config.php';
session_start();
if(!isset($_SESSION['cliente_id'])){
    header('Location: login.php'); exit;
}
$cliente_id = $_SESSION['cliente_id'];
$cliente_nome = $_SESSION['cliente_nome'];

// Buscar solicitações do cliente
$stmt = $pdo->prepare('SELECT * FROM solicitacoes WHERE cliente_id = ? ORDER BY data_solicitacao DESC');
$stmt->execute([$cliente_id]);
$solicitacoes = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - Dashboard Cliente</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/home.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .dashboard-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: white;
        }
        .dashboard-header {
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px 0;
        }
        .dashboard-nav {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }
        .dashboard-nav h1 {
            color: #00F0FF;
            margin: 0;
        }
        .dashboard-nav .user-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .logout-btn {
            background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
        }
        .dashboard-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 40px;
        }
        .welcome-section h2 {
            color: #00F0FF;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .welcome-section p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.2rem;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            transition: all 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 240, 255, 0.2);
        }
        .stat-icon {
            font-size: 3rem;
            color: #00F0FF;
            margin-bottom: 15px;
        }
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: white;
            margin-bottom: 5px;
        }
        .stat-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.1rem;
        }
        .solicitacoes-section {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
        }
        .solicitacoes-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        .solicitacoes-header h3 {
            color: #00F0FF;
            margin: 0;
            font-size: 1.8rem;
        }
        .new-solicitacao-btn {
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .new-solicitacao-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
        }
        .solicitacoes-table {
            width: 100%;
            border-collapse: collapse;
        }
        .solicitacoes-table th,
        .solicitacoes-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .solicitacoes-table th {
            color: #00F0FF;
            font-weight: 600;
        }
        .solicitacoes-table td {
            color: rgba(255, 255, 255, 0.8);
        }
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        .status-pendente {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
        }
        .status-aprovado {
            background: rgba(40, 167, 69, 0.2);
            color: #28a745;
        }
        .status-rejeitado {
            background: rgba(220, 53, 69, 0.2);
            color: #dc3545;
        }
        .status-concluido {
            background: rgba(0, 240, 255, 0.2);
            color: #00F0FF;
        }
        .no-solicitacoes {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            padding: 40px;
        }
        .user-menu {
            position: relative;
        }
        .user-menu-btn {
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        .user-menu-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
        }
        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            min-width: 200px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        .user-dropdown.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .user-dropdown a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .user-dropdown a:hover {
            background: rgba(0, 240, 255, 0.1);
            color: #00F0FF;
        }
        .user-dropdown a:last-child {
            border-bottom: none;
        }
        .logout-link:hover {
            background: rgba(255, 71, 87, 0.2);
            color: #ff4757;
        }
    </style>
    <script>
        function toggleUserMenu() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('show');
        }

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    </script>
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <nav class="dashboard-nav">
                <div class="logo">
                    <img src="../imagens/Imagem do WhatsApp de 2025-10-21 à(s) 09.56.28_5c6d7850.jpg" alt="Xkairos Tech Logo" style="height: 40px; width: 40px; border-radius: 50%; object-fit: cover;">
                    <h1>Xkairos Tech</h1>
                </div>
                <div class="user-info">
                    <div class="user-menu">
                        <button class="user-menu-btn" onclick="toggleUserMenu()">
                            <i class="fas fa-user"></i> <?php echo htmlspecialchars($cliente_nome); ?>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-dropdown" id="userDropdown">
                            <a href="../index.php"><i class="fas fa-home"></i> Página Inicial</a>
                            <a href="dashboard.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                            <a href="perfil.php"><i class="fas fa-user-edit"></i> Meu Perfil</a>
                            <a href="solicitacoes.php"><i class="fas fa-clipboard-list"></i> Minhas Solicitações</a>
                            <a href="pagamentos.php"><i class="fas fa-credit-card"></i> Pagamentos</a>
                            <a href="logout.php" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                        </div>
                    </div>
                </div>
            </nav>
        </header>

        <main class="dashboard-content">
            <section class="welcome-section">
                <h2>Bem-vindo, <?php echo htmlspecialchars($cliente_nome); ?>!</h2>
                <p>Gerencie suas supervisão e acompanhe o andamento de seus projetos</p>
            </section>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="stat-number"><?php echo count($solicitacoes); ?></div>
                    <div class="stat-label">Total de Solicitações</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-number">
                        <?php echo count(array_filter($solicitacoes, function($s) { return $s['status'] === 'Pendente'; })); ?>
                    </div>
                    <div class="stat-label">Pendentes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-number">
                        <?php echo count(array_filter($solicitacoes, function($s) { return $s['status'] === 'Concluido'; })); ?>
                    </div>
                    <div class="stat-label">Concluídas</div>
                </div>
            </div>

            <section class="solicitacoes-section">
                <div class="solicitacoes-header">
                    <h3>Minhas Solicitações</h3>
                    <a href="../orcamentos.php" class="new-solicitacao-btn">
                        <i class="fas fa-plus"></i> Nova Solicitação
                    </a>
                </div>

                <?php if (empty($solicitacoes)): ?>
                    <div class="no-solicitacoes">
                        <i class="fas fa-inbox fa-3x" style="color: rgba(255, 255, 255, 0.3); margin-bottom: 20px;"></i>
                        <p>Você ainda não fez nenhuma solicitação.</p>
                        <p>Clique em "Nova Solicitação" para começar!</p>
                    </div>
                <?php else: ?>
                    <table class="solicitacoes-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Data</th>
                                <th>CPU</th>
                                <th>GPU</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($solicitacoes as $solicitacao): ?>
                                <tr>
                                    <td>#<?php echo $solicitacao['id']; ?></td>
                                    <td><?php echo date('d/m/Y', strtotime($solicitacao['data_solicitacao'])); ?></td>
                                    <td><?php echo htmlspecialchars($solicitacao['cpu'] ?: 'N/A'); ?></td>
                                    <td><?php echo htmlspecialchars($solicitacao['gpu'] ?: 'N/A'); ?></td>
                                    <td>€<?php echo number_format($solicitacao['total'], 2, ',', '.'); ?></td>
                                    <td>
                                        <span class="status-badge status-<?php echo strtolower($solicitacao['status']); ?>">
                                            <?php echo htmlspecialchars($solicitacao['status']); ?>
                                        </span>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </section>
        </main>
    </div>
</body>
</html>
