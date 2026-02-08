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
    <title>Xkairos Tech - Login Cliente</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/home.css">
    <style>
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            padding: 20px;
        }
        .login-form {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            backdrop-filter: blur(10px);
        }
        .login-form h2 {
            color: #00F0FF;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2rem;
        }
        .input-group {
            position: relative;
            margin-bottom: 20px;
        }
        .input-group input {
            width: 100%;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 16px;
            outline: none;
            transition: all 0.3s ease;
        }
        .input-group input:focus {
            border-color: #00F0FF;
            box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }
        .input-group label {
            position: absolute;
            top: 15px;
            left: 15px;
            color: rgba(255, 255, 255, 0.7);
            pointer-events: none;
            transition: all 0.3s ease;
        }
        .input-group input:focus + label,
        .input-group input:not(:placeholder-shown) + label {
            top: -10px;
            left: 10px;
            font-size: 12px;
            color: #00F0FF;
        }
        .btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
        }
        .error {
            color: #ff6b6b;
            text-align: center;
            margin-top: 15px;
        }
        .register-link {
            text-align: center;
            margin-top: 20px;
        }
        .register-link a {
            color: #00F0FF;
            text-decoration: none;
        }
        .register-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <form class="login-form" method="POST">
            <h2>Login Cliente</h2>
            <div class="input-group">
                <input type="email" name="email" id="email" required>
                <label for="email">Email</label>
            </div>
            <div class="input-group">
                <input type="password" name="senha" id="senha" required>
                <label for="senha">Senha</label>
            </div>
            <button type="submit" class="btn">Entrar</button>
            <?php if(isset($erro)) echo "<p class='error'>$erro</p>"; ?>
            <div class="register-link">
                <a href="register.php">Não tem conta? Registre-se</a>
            </div>
        </form>
    </div>
</body>
</html>
