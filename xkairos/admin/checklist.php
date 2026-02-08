<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/config.php';

// Handle add step
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_step'])) {
    $projeto_id = $_POST['projeto_id'];
    $etapa = $_POST['etapa'];

    $stmt = $pdo->prepare("INSERT INTO projeto_checklist (projeto_id, etapa, concluida) VALUES (?, ?, 0)");
    $stmt->execute([$projeto_id, $etapa]);
    header('Location: checklist.php');
    exit;
}

// Handle delete step
if (isset($_GET['delete_step'])) {
    $id = $_GET['delete_step'];
    $stmt = $pdo->prepare("DELETE FROM projeto_checklist WHERE id = ?");
    $stmt->execute([$id]);
    header('Location: checklist.php');
    exit;
}

// Handle toggle status
if (isset($_GET['toggle'])) {
    $id = $_GET['toggle'];
    $stmt = $pdo->prepare("UPDATE projeto_checklist SET concluida = 1 - concluida WHERE id = ?");
    $stmt->execute([$id]);
    header('Location: checklist.php');
    exit;
}

// Fetch all checklists grouped by projeto_id
$stmt = $pdo->query("SELECT projeto_id, COUNT(*) as total_steps, SUM(concluida) as completed_steps FROM projeto_checklist GROUP BY projeto_id ORDER BY projeto_id DESC");
$checklists = $stmt->fetchAll();

foreach ($checklists as &$checklist) {
    $stmt = $pdo->prepare("SELECT * FROM projeto_checklist WHERE projeto_id = ? ORDER BY id");
    $stmt->execute([$checklist['projeto_id']]);
    $checklist['steps'] = $stmt->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Checklists de Projetos - Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .checklist-card { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; }
        .step { background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; }
        .completed { background: #d4edda; }
        .add-form { display: none; }
        .add-btn { cursor: pointer; color: blue; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Gerenciar Checklists de Projetos</h1>
        <a href="dashboard.php">Voltar ao Dashboard</a>

        <?php foreach ($checklists as $checklist): ?>
            <div class="checklist-card">
                <h3>Projeto ID: <?php echo $checklist['projeto_id']; ?> (<?php echo $checklist['completed_steps']; ?>/<?php echo $checklist['total_steps']; ?> concluídas)</h3>
                <button class="add-btn" onclick="toggleAdd(<?php echo $checklist['projeto_id']; ?>)">Adicionar Etapa</button>
                <a href="../crm/generate_checklist_pdf.php?projeto_id=<?php echo $checklist['projeto_id']; ?>" target="_blank">Gerar PDF</a>

                <form method="POST" class="add-form" id="add-<?php echo $checklist['projeto_id']; ?>">
                    <input type="hidden" name="projeto_id" value="<?php echo $checklist['projeto_id']; ?>">
                    <label>Etapa: <input type="text" name="etapa" required></label>
                    <button type="submit" name="add_step">Adicionar</button>
                    <button type="button" onclick="toggleAdd(<?php echo $checklist['projeto_id']; ?>)">Cancelar</button>
                </form>

                <?php foreach ($checklist['steps'] as $step): ?>
                    <div class="step <?php if ($step['concluida']) echo 'completed'; ?>">
                        <span><?php echo htmlspecialchars($step['etapa']); ?> - <?php echo $step['concluida'] ? 'Concluída' : 'Pendente'; ?></span>
                        <div>
                            <a href="?toggle=<?php echo $step['id']; ?>"><?php echo $step['concluida'] ? 'Marcar Pendente' : 'Marcar Concluída'; ?></a>
                            <a href="?delete_step=<?php echo $step['id']; ?>" onclick="return confirm('Tem certeza que deseja excluir esta etapa?')">Excluir</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>
    </div>

    <script>
        function toggleAdd(projeto_id) {
            const form = document.getElementById('add-' + projeto_id);
            form.style.display = form.style.display === 'block' ? 'none' : 'block';
        }
    </script>
</body>
</html>
