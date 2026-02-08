<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/config.php';

// Handle CRUD operations
$message = '';
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    try {
        if (isset($_POST['create'])) {
            $stmt = $pdo->prepare('INSERT INTO pecas (tipo, nome, preco, estoque, imagem, categoria, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $_POST['tipo'],
                $_POST['nome'],
                $_POST['preco'],
                $_POST['estoque'],
                $_POST['imagem'] ?? '',
                $_POST['categoria'],
                $_POST['descricao']
            ]);
            $message = 'Peça criada com sucesso!';
        } elseif (isset($_POST['update'])) {
            $stmt = $pdo->prepare('UPDATE pecas SET tipo=?, nome=?, preco=?, estoque=?, imagem=?, categoria=?, descricao=? WHERE id=?');
            $stmt->execute([
                $_POST['tipo'],
                $_POST['nome'],
                $_POST['preco'],
                $_POST['estoque'],
                $_POST['imagem'] ?? '',
                $_POST['categoria'],
                $_POST['descricao'],
                $_POST['id']
            ]);
            $message = 'Peça atualizada com sucesso!';
        } elseif (isset($_POST['delete'])) {
            $stmt = $pdo->prepare('DELETE FROM pecas WHERE id=?');
            $stmt->execute([$_POST['id']]);
            $message = 'Peça excluída com sucesso!';
        }
    } catch (PDOException $e) {
        $message = 'Erro: ' . $e->getMessage();
    }
}

// Get all pecas
$stmt = $pdo->query('SELECT * FROM pecas ORDER BY tipo, nome');
$pecas = $stmt->fetchAll();

// Get categories for filter
$stmt = $pdo->query('SELECT DISTINCT categoria FROM pecas WHERE categoria IS NOT NULL ORDER BY categoria');
$categorias = $stmt->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Peças - Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .pecas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .peca-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
        .peca-card img { max-width: 100%; height: 150px; object-fit: cover; border-radius: 4px; }
        .peca-card h3 { margin: 10px 0; color: #333; }
        .peca-card p { margin: 5px 0; }
        .peca-card .preco { font-weight: bold; color: #28a745; }
        .peca-card .estoque { color: #dc3545; }
        .form-container { background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .form-row { display: flex; gap: 10px; margin: 10px 0; }
        .form-row input, .form-row select, .form-row textarea { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .form-row textarea { height: 80px; }
        .btn { padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary { background: #007bff; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-success { background: #28a745; color: white; }
        .message { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Gestão de Peças</h1>
        <a href="dashboard.php">Voltar ao Dashboard</a> | <a href="logout.php">Logout</a>

        <?php if ($message): ?>
            <div class="message <?php echo strpos($message, 'Erro') === 0 ? 'error' : 'success'; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <div class="form-container">
            <h2>Adicionar Nova Peça</h2>
            <form method="POST">
                <div class="form-row">
                    <select name="tipo" required>
                        <option value="">Selecione o Tipo</option>
                        <option value="CPU">CPU</option>
                        <option value="GPU">GPU</option>
                        <option value="RAM">RAM</option>
                        <option value="SSD">SSD</option>
                        <option value="Placa Mãe">Placa Mãe</option>
                        <option value="Cooler">Cooler</option>
                    </select>
                    <input type="text" name="nome" placeholder="Nome da Peça" required>
                    <input type="number" name="preco" step="0.01" placeholder="Preço (€)" required>
                </div>
                <div class="form-row">
                    <input type="number" name="estoque" placeholder="Estoque" required>
                    <input type="text" name="categoria" placeholder="Categoria">
                    <input type="url" name="imagem" placeholder="URL da Imagem">
                </div>
                <div class="form-row">
                    <textarea name="descricao" placeholder="Descrição"></textarea>
                </div>
                <button type="submit" name="create" class="btn btn-primary">Adicionar Peça</button>
            </form>
        </div>

        <h2>Peças Cadastradas</h2>
        <div class="pecas-grid">
            <?php foreach ($pecas as $peca): ?>
                <div class="peca-card">
                    <?php if ($peca['imagem']): ?>
                        <img src="<?php echo htmlspecialchars($peca['imagem']); ?>" alt="<?php echo htmlspecialchars($peca['nome']); ?>">
                    <?php endif; ?>
                    <h3><?php echo htmlspecialchars($peca['nome']); ?></h3>
                    <p><strong>Tipo:</strong> <?php echo htmlspecialchars($peca['tipo']); ?></p>
                    <p><strong>Categoria:</strong> <?php echo htmlspecialchars($peca['categoria'] ?? 'N/A'); ?></p>
                    <p class="preco">€<?php echo number_format($peca['preco'], 2); ?></p>
                    <p class="estoque">Estoque: <?php echo $peca['estoque']; ?></p>
                    <?php if ($peca['descricao']): ?>
                        <p><?php echo htmlspecialchars($peca['descricao']); ?></p>
                    <?php endif; ?>

                    <form method="POST" style="margin-top: 10px;">
                        <input type="hidden" name="id" value="<?php echo $peca['id']; ?>">
                        <div class="form-row">
                            <select name="tipo" required>
                                <option value="CPU" <?php echo $peca['tipo'] == 'CPU' ? 'selected' : ''; ?>>CPU</option>
                                <option value="GPU" <?php echo $peca['tipo'] == 'GPU' ? 'selected' : ''; ?>>GPU</option>
                                <option value="RAM" <?php echo $peca['tipo'] == 'RAM' ? 'selected' : ''; ?>>RAM</option>
                                <option value="SSD" <?php echo $peca['tipo'] == 'SSD' ? 'selected' : ''; ?>>SSD</option>
                                <option value="Placa Mãe" <?php echo $peca['tipo'] == 'Placa Mãe' ? 'selected' : ''; ?>>Placa Mãe</option>
                                <option value="Cooler" <?php echo $peca['tipo'] == 'Cooler' ? 'selected' : ''; ?>>Cooler</option>
                            </select>
                            <input type="text" name="nome" value="<?php echo htmlspecialchars($peca['nome']); ?>" required>
                            <input type="number" name="preco" step="0.01" value="<?php echo $peca['preco']; ?>" required>
                        </div>
                        <div class="form-row">
                            <input type="number" name="estoque" value="<?php echo $peca['estoque']; ?>" required>
                            <input type="text" name="categoria" value="<?php echo htmlspecialchars($peca['categoria'] ?? ''); ?>">
                            <input type="url" name="imagem" value="<?php echo htmlspecialchars($peca['imagem'] ?? ''); ?>">
                        </div>
                        <div class="form-row">
                            <textarea name="descricao"><?php echo htmlspecialchars($peca['descricao'] ?? ''); ?></textarea>
                        </div>
                        <button type="submit" name="update" class="btn btn-success">Atualizar</button>
                        <button type="submit" name="delete" class="btn btn-danger" onclick="return confirm('Tem certeza que deseja excluir esta peça?')">Excluir</button>
                    </form>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</body>
</html>
