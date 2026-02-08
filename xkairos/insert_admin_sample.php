<?php
require_once 'includes/config.php';

try {
    $username = 'kauai rocha';
    $email = 'kauai@adm.com';
    $password = password_hash('031018', PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO admin (username, email, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = ?');
    $stmt->execute([$username, $email, $password, $password]);

    echo 'Admin inserido com sucesso!';
} catch (PDOException $e) {
    echo 'Erro: ' . $e->getMessage();
}
?>
