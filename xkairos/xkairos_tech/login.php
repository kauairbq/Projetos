<?php
session_start();
require_once "includes/db_connect.php";
?>

<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xkairos Tech | Login & Registro</title>
  <link rel="stylesheet" href="css/auth.css">
</head>
<body>
  <div class="auth-container">
    <div class="forms-wrapper" id="forms-wrapper">

      <!-- LOGIN -->
      <form action="login_process.php" method="POST" class="form login-form">
        <h2>Bem-vindo de volta</h2>
        <div class="input-group">
          <input type="email" name="email" required>
          <label>Email</label>
        </div>
        <div class="input-group">
          <input type="password" name="password" required>
          <label>Palavra-passe</label>
        </div>
        <button type="submit" class="btn">Entrar</button>
        <p class="switch">Ainda não tem conta? <a href="#" id="show-register">Registe-se</a></p>
      </form>

      <!-- REGISTRO -->
      <form action="register_process.php" method="POST" class="form register-form">
        <h2>Criar conta</h2>
        <div class="input-group">
          <input type="text" name="name" required>
          <label>Nome</label>
        </div>
        <div class="input-group">
          <input type="email" name="email" required>
          <label>Email</label>
        </div>
        <div class="input-group">
          <input type="password" name="password" required>
          <label>Palavra-passe</label>
        </div>
        <button type="submit" class="btn">Registrar</button>
        <p class="switch">Já tem conta? <a href="#" id="show-login">Entrar</a></p>
      </form>

    </div>
  </div>

  <script src="js/auth.js"></script>
</body>
</html>
