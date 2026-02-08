<?php
session_start();
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare('INSERT INTO admin (username, password) VALUES (?, ?)');
        $stmt->execute([$username, $password]);
        $success = 'Admin registrado com sucesso!';
    } catch (PDOException $e) {
        $error = 'Erro: ' . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - Registrar Admin</title>
    <link rel="stylesheet" href="../xkairos_tech/css/auth.css">
</head>
<body>
    <div class="auth-container">
        <div class="forms-wrapper" id="forms-wrapper">
            <!-- Formulário de Registro Admin -->
            <form class="form register-form" method="POST">
                <h2>Registrar Admin</h2>
                <div class="input-group">
                    <input type="text" name="username" required>
                    <label>Usuário</label>
                </div>
                <div class="input-group">
                    <input type="password" name="password" required>
                    <label>Senha</label>
                </div>
                <button type="submit" class="btn">Registrar</button>
                <?php if(isset($error)) echo "<p style='color: #00F0FF; text-align: center; margin-top: 10px;'>$error</p>"; ?>
                <?php if(isset($success)) echo "<p style='color: #00F0FF; text-align: center; margin-top: 10px;'>$success</p>"; ?>
            </form>
        </div>
    </div>

    <script src="../xkairos_tech/js/auth.js"></script>
</body>
</html>
