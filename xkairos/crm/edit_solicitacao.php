<?php
include "../includes/config.php";
session_start();

if (!isset($_SESSION['cliente_id'])) {
    header("Location: login.php");
    exit;
}

$id = $_GET['id'] ?? 0;

// Buscar solicitação
$stmt = $pdo->prepare("SELECT * FROM solicitacoes WHERE id = ? AND cliente_email = (SELECT email FROM clientes WHERE id = ?)");
$stmt->execute([$id, $_SESSION['cliente_id']]);
$solicitacao = $stmt->fetch();

if (!$solicitacao) {
    die("Solicitação não encontrada ou não pertence a você.");
}

include "../includes/header.php";
?>

<h2>Editar Solicitação</h2>

<form action="update_solicitacao.php" method="post">
    <input type="hidden" name="id" value="<?= $solicitacao['id'] ?>">

    <label>CPU:</label>
    <input type="text" name="cpu" value="<?= htmlspecialchars($solicitacao['cpu']) ?>" required><br>

    <label>GPU:</label>
    <input type="text" name="gpu" value="<?= htmlspecialchars($solicitacao['gpu']) ?>" required><br>

    <label>RAM:</label>
    <input type="text" name="ram" value="<?= htmlspecialchars($solicitacao['ram']) ?>" required><br>

    <label>SSD:</label>
    <input type="text" name="ssd" value="<?= htmlspecialchars($solicitacao['ssd']) ?>" required><br>

    <label>Placa Mãe:</label>
    <input type="text" name="placa_mae" value="<?= htmlspecialchars($solicitacao['placa_mae'] ?? '') ?>" required><br>

    <label>Cooler:</label>
    <input type="text" name="cooler" value="<?= htmlspecialchars($solicitacao['cooler'] ?? '') ?>" required><br>

    <button type="submit">Atualizar</button>
</form>

<a href="dashboard.php">Voltar</a>

<?php include "../includes/footer.php"; ?>
