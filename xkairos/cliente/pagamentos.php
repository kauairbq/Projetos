<?php
include '../includes/config.php';
session_start();
if(!isset($_SESSION['cliente_id'])){
    header('Location: login.php'); exit;
}
$cliente_id = $_SESSION['cliente_id'];
$cliente_nome = $_SESSION['cliente_nome'];

// Buscar pagamentos do cliente
$stmt = $pdo->prepare('SELECT * FROM pagamentos WHERE cliente_id = ? ORDER BY data_pagamento DESC');
$stmt->execute([$cliente_id]);
$pagamentos = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - Meus Pagamentos</title>
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
        .pagamentos-section {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
        }
        .pagamentos-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        .pagamentos-header h3 {
            color: #00F0FF;
            margin: 0;
            font-size: 1.8rem;
        }
        .pagamentos-table {
            width: 100%;
            border-collapse: collapse;
        }
        .pagamentos-table th,
        .pagamentos-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .pagamentos-table th {
            color: #00F0FF;
            font-weight: 600;
        }
        .pagamentos-table td {
            color: rgba(255, 255, 255, 0.8);
        }
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        .status-completo {
            background: rgba(40, 167, 69, 0.2);
            color: #28a745;
        }
        .status-pendente {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
        }
        .status-falhou {
            background: rgba(220, 53, 69, 0.2);
            color: #dc3545;
        }
        .no-pagamentos {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            padding: 40px;
        }
        .pagamento-details {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            margin-top: 10px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .detail-label {
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
        }
        .detail-value {
            color: rgba(255, 255, 255, 0.9);
        }
        .expand-btn {
            background: none;
            border: none;
            color: #00F0FF;
            cursor: pointer;
            font-size: 0.9rem;
            padding: 5px;
            transition: all 0.3s ease;
        }
        .expand-btn:hover {
            color: #0080FF;
        }
        .total-section {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        .total-amount {
            font-size: 2rem;
            font-weight: bold;
            color: #00F0FF;
            margin-bottom: 5px;
        }
        .total-label {
            color: rgba(255, 255, 255, 0.7);
        }
    </style>
    <script>
        function toggleUserMenu() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('show');
        }

        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });

        function toggleDetails(id) {
            const details = document.getElementById('details-' + id);
            const btn = document.getElementById('btn-' + id);
            if (details.style.display === 'none' || details.style.display === '') {
                details.style.display = 'block';
                btn.innerHTML = '<i class="fas fa-chevron-up"></i> Ocultar Detalhes';
            } else {
                details.style.display = 'none';
                btn.innerHTML = '<i class="fas fa-chevron-down"></i> Ver Detalhes';
            }
        }
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
                <h2>Meus Pagamentos</h2>
                <p>Acompanhe o histórico de todos os seus pagamentos</p>
            </section>

            <?php
            $total_pago = 0;
            foreach ($pagamentos as $pagamento) {
                if ($pagamento['status'] === 'Completo') {
                    $total_pago += $pagamento['valor'];
                }
            }
            ?>

            <div class="total-section">
                <div class="total-amount">€<?php echo number_format($total_pago, 2, ',', '.'); ?></div>
                <div class="total-label">Total Pago</div>
            </div>

            <section class="pagamentos-section">
                <div class="pagamentos-header">
                    <h3>Histórico de Pagamentos</h3>
                </div>

                <?php if (empty($pagamentos)): ?>
                    <div class="no-pagamentos">
                        <i class="fas fa-credit-card fa-3x" style="color: rgba(255, 255, 255, 0.3); margin-bottom: 20px;"></i>
                        <p>Você ainda não fez nenhum pagamento.</p>
                        <p>Os pagamentos aparecerão aqui após serem processados.</p>
                    </div>
                <?php else: ?>
                    <table class="pagamentos-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Data</th>
                                <th>Valor</th>
                                <th>Método</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($pagamentos as $pagamento): ?>
                                <tr>
                                    <td>#<?php echo $pagamento['id']; ?></td>
                                    <td><?php echo date('d/m/Y H:i', strtotime($pagamento['data_pagamento'])); ?></td>
                                    <td>€<?php echo number_format($pagamento['valor'], 2, ',', '.'); ?></td>
                                    <td><?php echo htmlspecialchars($pagamento['metodo_pagamento']); ?></td>
                                    <td>
                                        <span class="status-badge status-<?php echo strtolower($pagamento['status']); ?>">
                                            <?php echo htmlspecialchars($pagamento['status']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <button class="expand-btn" id="btn-<?php echo $pagamento['id']; ?>" onclick="toggleDetails(<?php echo $pagamento['id']; ?>)">
                                            <i class="fas fa-chevron-down"></i> Ver Detalhes
                                        </button>
                                    </td>
                                </tr>
                                <tr id="details-<?php echo $pagamento['id']; ?>" style="display: none;">
                                    <td colspan="6">
                                        <div class="pagamento-details">
                                            <div class="detail-row">
                                                <span class="detail-label">Referência:</span>
                                                <span class="detail-value"><?php echo htmlspecialchars($pagamento['referencia'] ?: 'N/A'); ?></span>
                                            </div>
                                            <div class="detail-row">
                                                <span class="detail-label">Descrição:</span>
                                                <span class="detail-value"><?php echo htmlspecialchars($pagamento['descricao'] ?: 'Pagamento de serviço'); ?></span>
                                            </div>
                                            <div class="detail-row">
                                                <span class="detail-label">ID da Solicitação:</span>
                                                <span class="detail-value">#<?php echo htmlspecialchars($pagamento['solicitacao_id'] ?: 'N/A'); ?></span>
                                            </div>
                                        </div>
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
