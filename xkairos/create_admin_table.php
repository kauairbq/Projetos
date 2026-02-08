<?php
require_once 'includes/config.php';

try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )');
    echo 'Tabela admin criada com sucesso!';
} catch (PDOException $e) {
    echo 'Erro: ' . $e->getMessage();
}
?>
