<?php
include '../includes/config.php';
session_start();
if($_SERVER['REQUEST_METHOD']==='POST'){
    $email = $_POST['email'];
    $senha = $_POST['senha'];
    $stmt = $pdo->prepare('SELECT * FROM clientes WHERE email=?');
    $stmt->execute([$email]);
    $cliente = $stmt->fetch();
    if($cliente && password_verify($senha,$cliente['senha'])){
        $_SESSION['cliente_id'] = $cliente['id'];
        $_SESSION['cliente_nome'] = $cliente['nome'];
        header('Location: dashboard.php'); exit;
    } else $erro = 'Email ou senha incorretos!';
}
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - CRM Login</title>
    <link rel="stylesheet" href="../xkairos_tech/css/auth.css">
</head>
<body>
    <div class="auth-container">
        <div class="forms-wrapper" id="forms-wrapper">
            <!-- Formulário de Login -->
            <form class="form login-form" method="POST">
                <h2>Login CRM</h2>
                <div class="input-group">
                    <input type="email" name="email" required>
                    <label>Email</label>
                </div>
                <div class="input-group">
                    <input type="password" name="senha" required>
                    <label>Senha</label>
                </div>
                <button type="submit" class="btn">Entrar</button>
                <?php if(isset($erro)) echo "<p style='color: #00F0FF; text-align: center; margin-top: 10px;'>$erro</p>"; ?>
            </form>

            <!-- Formulário de Registro (para efeito 3D) -->
            <form class="form register-form" method="POST" action="register.php">
                <h2>Registrar</h2>
                <div class="input-group">
                    <input type="text" name="nome" required>
                    <label>Nome</label>
                </div>
                <div class="input-group">
                    <input type="email" name="email" required>
                    <label>Email</label>
                </div>
                <div class="input-group">
                    <input type="password" name="senha" required>
                    <label>Senha</label>
                </div>
                <button type="submit" class="btn">Registrar</button>
            </form>
        </div>
    </div>

    <script src="../xkairos_tech/js/auth.js"></script>
</body>
</html>
