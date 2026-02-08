<?php
include '../includes/config.php';
session_start();
if(!isset($_SESSION['cliente_id'])){
    header('Location: login.php'); exit;
}
$cliente_id = $_SESSION['cliente_id'];
$cliente_nome = $_SESSION['cliente_nome'];

// Buscar dados do cliente
$stmt = $pdo->prepare('SELECT * FROM clientes WHERE id = ?');
$stmt->execute([$cliente_id]);
$cliente = $stmt->fetch();

if($_SERVER['REQUEST_METHOD']==='POST'){
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $morada = $_POST['morada'] ?? '';
    $codigo_postal = $_POST['codigo_postal'] ?? '';
    $cidade = $_POST['cidade'] ?? '';
    $pais = $_POST['pais'] ?? 'Portugal';
    $nif = $_POST['nif'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $nome_empresa = $_POST['nome_empresa'] ?? '';
    $email_faturamento = $_POST['email_faturamento'] ?? '';
    $senha_atual = $_POST['senha_atual'];
    $nova_senha = $_POST['nova_senha'];

    // Verificar senha atual se estiver mudando
    if(!empty($nova_senha)){
        if(!password_verify($senha_atual, $cliente['senha'])){
            $erro = 'Senha atual incorreta!';
        } else {
            $nova_senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE clientes SET nome = ?, email = ?, morada = ?, codigo_postal = ?, cidade = ?, pais = ?, nif = ?, telefone = ?, nome_empresa = ?, email_faturamento = ?, senha = ? WHERE id = ?');
            $stmt->execute([$nome, $email, $morada, $codigo_postal, $cidade, $pais, $nif, $telefone, $nome_empresa, $email_faturamento, $nova_senha_hash, $cliente_id]);
            $_SESSION['cliente_nome'] = $nome;
            $sucesso = 'Perfil atualizado com sucesso!';
        }
    } else {
        $stmt = $pdo->prepare('UPDATE clientes SET nome = ?, email = ?, morada = ?, codigo_postal = ?, cidade = ?, pais = ?, nif = ?, telefone = ?, nome_empresa = ?, email_faturamento = ? WHERE id = ?');
        $stmt->execute([$nome, $email, $morada, $codigo_postal, $cidade, $pais, $nif, $telefone, $nome_empresa, $email_faturamento, $cliente_id]);
        $_SESSION['cliente_nome'] = $nome;
        $sucesso = 'Perfil atualizado com sucesso!';
    }
}
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - Meu Perfil</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/home.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .dashboard-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: white;
        }
        .dashboard-header {
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px 0;
        }
        .dashboard-nav {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }
        .dashboard-nav h1 {
            color: #00F0FF;
            margin: 0;
        }
        .dashboard-nav .user-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .user-menu {
            position: relative;
        }
        .user-menu-btn {
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        .user-menu-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
        }
        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            min-width: 200px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        .user-dropdown.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .user-dropdown a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .user-dropdown a:hover {
            background: rgba(0, 240, 255, 0.1);
            color: #00F0FF;
        }
        .user-dropdown a:last-child {
            border-bottom: none;
        }
        .logout-link:hover {
            background: rgba(255, 71, 87, 0.2);
            color: #ff4757;
        }
        .dashboard-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 40px;
        }
        .welcome-section h2 {
            color: #00F0FF;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .welcome-section p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.2rem;
        }
        .profile-section {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 40px;
        }
        .profile-section h3 {
            color: #00F0FF;
            margin-bottom: 30px;
            font-size: 1.8rem;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 8px;
            font-weight: 500;
        }
        .form-group input {
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
        .form-group input:focus {
            border-color: #00F0FF;
            box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }
        .btn {
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
        }
        .success {
            color: #28a745;
            text-align: center;
            margin-bottom: 20px;
        }
        .error {
            color: #ff6b6b;
            text-align: center;
            margin-bottom: 20px;
        }
        .password-section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .password-section h4 {
            color: #00F0FF;
            margin-bottom: 20px;
        }
        .billing-section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .billing-section h4 {
            color: #00F0FF;
            margin-bottom: 20px;
        }
    </style>
    <script>
        function toggleUserMenu() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('show');
        }

        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    </script>
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <nav class="dashboard-nav">
                <div class="logo">
                    <img src="../imagens/Imagem do WhatsApp de 2025-10-21 à(s) 09.56.28_5c6d7850.jpg" alt="Xkairos Tech Logo" style="height: 40px; width: 40px; border-radius: 50%; object-fit: cover;">
                    <h1>Xkairos Tech</h1>
                </div>
                <div class="user-info">
                    <div class="user-menu">
                        <button class="user-menu-btn" onclick="toggleUserMenu()">
                            <i class="fas fa-user"></i> <?php echo htmlspecialchars($cliente_nome); ?>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-dropdown" id="userDropdown">
                            <a href="../index.php"><i class="fas fa-home"></i> Página Inicial</a>
                            <a href="dashboard.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                            <a href="perfil.php"><i class="fas fa-user-edit"></i> Meu Perfil</a>
                            <a href="solicitacoes.php"><i class="fas fa-clipboard-list"></i> Minhas Solicitações</a>
                            <a href="pagamentos.php"><i class="fas fa-credit-card"></i> Pagamentos</a>
                            <a href="logout.php" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                        </div>
                    </div>
                </div>
            </nav>
        </header>

        <main class="dashboard-content">
            <section class="welcome-section">
                <h2>Meu Perfil</h2>
                <p>Gerencie suas informações pessoais</p>
            </section>

            <section class="profile-section">
                <h3>Informações Pessoais</h3>

                <?php if(isset($sucesso)) echo "<p class='success'>$sucesso</p>"; ?>
                <?php if(isset($erro)) echo "<p class='error'>$erro</p>"; ?>

                <form method="POST">
                    <div class="form-group">
                        <label for="nome">Nome Completo</label>
                        <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($cliente['nome']); ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($cliente['email']); ?>" required>
                    </div>

                    <!-- Campos de faturamento -->
                    <div class="billing-section">
                        <h4>Informações de Faturamento</h4>
                        <div class="form-group">
                            <label for="morada">Morada</label>
                            <input type="text" id="morada" name="morada" value="<?php echo htmlspecialchars($cliente['morada'] ?? ''); ?>" placeholder="Ex: Rua das Flores, 123">
                        </div>
                        <div class="form-group">
                            <label for="codigo_postal">Código Postal</label>
                            <input type="text" id="codigo_postal" name="codigo_postal" value="<?php echo htmlspecialchars($cliente['codigo_postal'] ?? ''); ?>" placeholder="Ex: 1234-567">
                        </div>
                        <div class="form-group">
                            <label for="cidade">Cidade</label>
                            <input type="text" id="cidade" name="<?php echo htmlspecialchars($cliente['cidade'] ?? ''); ?>" placeholder="Ex: Lisboa">
                        </div>
                        <div class="form-group">
                            <label for="pais">País</label>
                            <input type="text" id="pais" name="pais" value="<?php echo htmlspecialchars($cliente['pais'] ?? 'Portugal'); ?>" placeholder="Ex: Portugal">
                        </div>
                        <div class="form-group">
                            <label for="nif">NIF</label>
                            <input type="text" id="nif" name="nif" value="<?php echo htmlspecialchars($cliente['nif'] ?? ''); ?>" placeholder="Ex: 123456789">
                        </div>
                        <div class="form-group">
                            <label for="telefone">Telefone</label>
                            <input type="text" id="telefone" name="telefone" value="<?php echo htmlspecialchars($cliente['telefone'] ?? ''); ?>" placeholder="Ex: +351 912 345 678">
                        </div>
                        <div class="form-group">
                            <label for="nome_empresa">Nome da Empresa (opcional)</label>
                            <input type="text" id="nome_empresa" name="nome_empresa" value="<?php echo htmlspecialchars($cliente['nome_empresa'] ?? ''); ?>" placeholder="Ex: Empresa XYZ">
                        </div>
                        <div class="form-group">
                            <label for="email_faturamento">Email de Faturamento (opcional)</label>
                            <input type="email" id="email_faturamento" name="email_faturamento" value="<?php echo htmlspecialchars($cliente['email_faturamento'] ?? ''); ?>" placeholder="Ex: faturamento@empresa.com">
                        </div>
                    </div>

                    <div class="password-section">
                        <h4>Alterar Senha (opcional)</h4>
                        <div class="form-group">
                            <label for="senha_atual">Senha Atual</label>
                            <input type="password" id="senha_atual" name="senha_atual">
                        </div>
                        <div class="form-group">
                            <label for="nova_senha">Nova Senha</label>
                            <input type="password" id="nova_senha" name="nova_senha">
                        </div>
                    </div>

                    <button type="submit" class="btn">Salvar Alterações</button>
                </form>
            </section>
        </main>
    </div>
</body>
</html>
