<?php
session_start();
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $stmt = $pdo->prepare('SELECT password FROM admin WHERE username = ?');
        $stmt->execute([$username]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password'])) {
            $_SESSION['admin_logged_in'] = true;
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Credenciais inválidas';
        }
    } catch (PDOException $e) {
        $error = 'Erro no banco de dados';
    }
}
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - Admin Login</title>
    <link rel="stylesheet" href="../xkairos_tech/css/auth.css">
</head>
<body>
    <div class="auth-container">
        <div class="forms-wrapper" id="forms-wrapper">
            <!-- Formulário de Login Admin -->
            <form class="form login-form" method="POST">
                <h2>Login Admin</h2>
                <div class="input-group">
                    <input type="text" name="username" required>
                    <label>Usuário</label>
                </div>
                <div class="input-group">
                    <input type="password" name="password" required>
                    <label>Senha</label>
                </div>
                <button type="submit" class="btn">Entrar</button>
                <?php if(isset($error)) echo "<p style='color: #00F0FF; text-align: center; margin-top: 10px;'>$error</p>"; ?>
            </form>

            <!-- Formulário de Registro (para efeito 3D) -->
            <form class="form register-form" method="POST" action="register.php">
                <h2>Registrar Admin</h2>
                <div class="input-group">
                    <input type="text" name="username" required>
                    <label>Usuário</label>
                </div>
                <div class="input-group">
                    <input type="email" name="email" required>
                    <label>Email</label>
                </div>
                <div class="input-group">
                    <input type="password" name="password" required>
                    <label>Senha</label>
                </div>
                <button type="submit" class="btn">Registrar</button>
            </form>
        </div>
    </div>

    <script src="../xkairos_tech/js/auth.js"></script>
</body>
</html>
