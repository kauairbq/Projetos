<?php
include 'includes/config.php';

try {
    // Atualizar credenciais do cliente no CRM
    $stmt = $pdo->prepare("UPDATE clientes SET email = ?, senha = ? WHERE email = ?");
    $stmt->execute(['kauai@adm.com', password_hash('031018', PASSWORD_DEFAULT), 'joao@example.com']);

    echo "Credenciais do CRM atualizadas com sucesso!<br>";
    echo "Novo Email: kauai@adm.com<br>";
    echo "Nova Senha: 031018<br>";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
