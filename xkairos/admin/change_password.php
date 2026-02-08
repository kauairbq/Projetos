<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    // Get current admin password
    $stmt = $pdo->prepare('SELECT password FROM admin WHERE id = 1'); // Assuming single admin
    $stmt->execute();
    $admin = $stmt->fetch();

    if ($admin && password_verify($current_password, $admin['password'])) {
        if ($new_password === $confirm_password) {
            $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE admin SET password = ? WHERE id = 1');
            $stmt->execute([$hashed_password]);
            $success = 'Senha alterada com sucesso!';
        } else {
            $error = 'As novas senhas não coincidem.';
        }
    } else {
        $error = 'Senha atual incorreta.';
    }
}
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alterar Senha - Admin</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body>
    <div class="admin-dashboard">
        <div class="admin-sidebar">
            <h2>Admin Panel</h2>
            <ul>
                <li><a href="dashboard.php">Dashboard</a></li>
                <li><a href="clientes.php">Clientes</a></li>
                <li><a href="pecas.php">Peças</a></li>
                <li><a href="checklist.php">Checklists</a></li>
                <li><a href="change_password.php" class="active">Alterar Senha</a></li>
                <li><a href="logout.php">Logout</a></li>
            </ul>
        </div>
        <div class="admin-main">
            <h1>Alterar Senha</h1>
            <form method="POST" style="max-width: 400px; margin: 0 auto;">
                <div style="margin-bottom: 15px;">
                    <label for="current_password">Senha Atual:</label>
                    <input type="password" id="current_password" name="current_password" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="new_password">Nova Senha:</label>
                    <input type="password" id="new_password" name="new_password" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="confirm_password">Confirmar Nova Senha:</label>
                    <input type="password" id="confirm_password" name="confirm_password" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <button type="submit" style="background: #00F0FF; color: #1F1F1F; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Alterar Senha</button>
                <?php if(isset($error)) echo "<p style='color: red; margin-top: 10px;'>$error</p>"; ?>
                <?php if(isset($success)) echo "<p style='color: green; margin-top: 10px;'>$success</p>"; ?>
            </form>
        </div>
    </div>
</body>
</html>
