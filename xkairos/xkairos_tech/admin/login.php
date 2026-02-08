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
  <title>Xkairos Tech | Login</title>
  <link rel="stylesheet" href="../../xkairos_tech/assets/css/pages/admin.css">
  <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
</head>

<body>
  <div class="container" id="container">

    <!-- Painel Login -->
    <div class="form-container sign-in-container">
      <form action="#" method="POST">
        <h1>Entrar</h1>
        <span>use suas credenciais</span>

        <?php if (isset($error)): ?>
          <div class="error-message" style="color: red; text-align: center; margin-bottom: 15px;"><?php echo $error; ?></div>
        <?php endif; ?>

        <input type="text" name="username" placeholder="Usuário" required>
        <input type="password" name="password" placeholder="Senha" required>

        <button type="submit">Login</button>
      </form>
    </div>

    <!-- Painel Lateral -->
    <div class="overlay-container">
      <div class="overlay">
        <div class="overlay-panel overlay-right">
          <h1>Bem-vindo ao Painel!</h1>
          <p>Entre com suas credenciais para acessar o sistema administrativo da Xkairos Tech</p>
        </div>
      </div>
    </div>

  </div>

</body>
</html>
