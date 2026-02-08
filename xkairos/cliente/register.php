<?php
include '../includes/config.php';
session_start();
if($_SERVER['REQUEST_METHOD']==='POST'){
    $primeiro_nome = $_POST['primeiro_nome'];
    $ultimo_nome = $_POST['ultimo_nome'];
    $nome_completo = $primeiro_nome . ' ' . $ultimo_nome;
    $email = $_POST['email'];
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO clientes (nome,email,senha) VALUES (?,?,?)');
    try {
        $stmt->execute([$nome_completo,$email,$senha]);
        $_SESSION['cliente_id'] = $pdo->lastInsertId();
        $_SESSION['cliente_nome'] = $nome_completo;
        header('Location: dashboard.php'); exit;
        exit;
    } catch(PDOException $e){
        // Store a user-friendly error to display in the form
        $erro = "Erro ao registrar: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - Registro Cliente</title>
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
        .register-form {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            backdrop-filter: blur(10px);
        }
        .register-form h2 {
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
        .login-link {
            text-align: center;
            margin-top: 20px;
        }
        .login-link a {
            color: #00F0FF;
            text-decoration: none;
        }
        .login-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <form class="register-form" method="POST">
            <h2>Registrar Cliente</h2>
            <div class="input-group">
                <input type="text" name="primeiro_nome" id="primeiro_nome" required>
                <label for="primeiro_nome">Primeiro Nome</label>
            </div>
            <div class="input-group">
                <input type="text" name="ultimo_nome" id="ultimo_nome" required>
                <label for="ultimo_nome">Último Nome</label>
            </div>
            <div class="input-group">
                <input type="email" name="email" id="email" required>
                <label for="email">Email</label>
            </div>
            <div class="input-group">
                <input type="password" name="senha" id="senha" required>
                <label for="senha">Senha</label>
            </div>
            <button type="submit" class="btn">Registrar</button>
            <?php if(isset($erro)) echo "<p class='error'>$erro</p>"; ?>
            <div class="login-link">
                <a href="login.php">Já tem conta? Faça login</a>
            </div>
        </form>
    </div>
</body>
</html>
