<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/config.php';

// Handle client edit
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_client'])) {
    $id = $_POST['id'];
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $telefone = $_POST['telefone'];
    $endereco = $_POST['endereco'];

    $stmt = $pdo->prepare("UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?");
    $stmt->execute([$nome, $email, $telefone, $endereco, $id]);
    header('Location: clientes.php');
    exit;
}

// Handle client delete
if (isset($_GET['delete_client'])) {
    $id = $_GET['delete_client'];
    $stmt = $pdo->prepare("DELETE FROM clientes WHERE id = ?");
    $stmt->execute([$id]);
    header('Location: clientes.php');
    exit;
}

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_status'])) {
    $id = $_POST['solicitacao_id'];
    $status = $_POST['status'];

    $stmt = $pdo->prepare("UPDATE solicitacoes SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    header('Location: clientes.php');
    exit;
}

// Fetch all clients with their solicitacoes
$stmt = $pdo->query("SELECT * FROM clientes ORDER BY created_at DESC");
$clients = $stmt->fetchAll();

foreach ($clients as &$client) {
    $stmt = $pdo->prepare("SELECT * FROM solicitacoes WHERE cliente_id = ? ORDER BY created_at DESC");
    $stmt->execute([$client['id']]);
    $client['solicitacoes'] = $stmt->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Clientes e Solicitações - Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .client-card { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; }
        .solicitacao { background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .status-select { margin-left: 10px; }
        .edit-form { display: none; }
        .edit-btn { cursor: pointer; color: blue; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Gerenciar Clientes e Solicitações</h1>
        <a href="dashboard.php">Voltar ao Dashboard</a>

        <?php foreach ($clients as $client): ?>
            <div class="client-card">
                <h3><?php echo htmlspecialchars($client['nome']); ?> (ID: <?php echo $client['id']; ?>)</h3>
                <p>Email: <?php echo htmlspecialchars($client['email']); ?></p>
                <p>Telefone: <?php echo htmlspecialchars($client['telefone']); ?></p>
                <p>Endereço: <?php echo htmlspecialchars($client['endereco']); ?></p>
                <p>Data Cadastro: <?php echo date('d/m/Y', strtotime($client['created_at'])); ?></p>
                <button class="edit-btn" onclick="toggleEdit(<?php echo $client['id']; ?>)">Editar Cliente</button>
                <a href="?delete_client=<?php echo $client['id']; ?>" onclick="return confirm('Tem certeza que deseja excluir este cliente?')">Excluir Cliente</a>

                <form method="POST" class="edit-form" id="edit-<?php echo $client['id']; ?>">
                    <input type="hidden" name="id" value="<?php echo $client['id']; ?>">
                    <label>Nome: <input type="text" name="nome" value="<?php echo htmlspecialchars($client['nome']); ?>" required></label><br>
                    <label>Email: <input type="email" name="email" value="<?php echo htmlspecialchars($client['email']); ?>" required></label><br>
                    <label>Telefone: <input type="text" name="telefone" value="<?php echo htmlspecialchars($client['telefone']); ?>"></label><br>
                    <label>Endereço: <textarea name="endereco"><?php echo htmlspecialchars($client['endereco']); ?></textarea></label><br>
                    <button type="submit" name="edit_client">Salvar</button>
                    <button type="button" onclick="toggleEdit(<?php echo $client['id']; ?>)">Cancelar</button>
                </form>

                <h4>Solicitações:</h4>
                <?php if (empty($client['solicitacoes'])): ?>
                    <p>Nenhuma solicitação.</p>
                <?php else: ?>
                    <?php foreach ($client['solicitacoes'] as $solicitacao): ?>
                        <div class="solicitacao">
                            <p>ID: <?php echo $solicitacao['id']; ?> | Total: €<?php echo number_format($solicitacao['total'], 2); ?> | Status: 
                                <form method="POST" style="display:inline;">
                                    <input type="hidden" name="solicitacao_id" value="<?php echo $solicitacao['id']; ?>">
                                    <select name="status" onchange="this.form.submit()">
                                        <option value="pendente" <?php if ($solicitacao['status'] == 'pendente') echo 'selected'; ?>>Pendente</option>
                                        <option value="em andamento" <?php if ($solicitacao['status'] == 'em andamento') echo 'selected'; ?>>Em Andamento</option>
                                        <option value="concluido" <?php if ($solicitacao['status'] == 'concluido') echo 'selected'; ?>>Concluído</option>
                                    </select>
                                    <input type="hidden" name="update_status" value="1">
                                </form>
                            </p>
                            <p>Data: <?php echo date('d/m/Y', strtotime($solicitacao['created_at'])); ?></p>
                            <a href="../crm/orcamento.php?id=<?php echo $solicitacao['id']; ?>" target="_blank">Gerar PDF</a>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </div>

    <script>
        function toggleEdit(id) {
            const form = document.getElementById('edit-' + id);
            form.style.display = form.style.display === 'block' ? 'none' : 'block';
        }
    </script>
</body>
</html>
