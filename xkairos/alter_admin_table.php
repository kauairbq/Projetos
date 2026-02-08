<?php
require_once 'includes/config.php';

try {
    // Verificar se a coluna email já existe
    $stmt = $pdo->query("SHOW COLUMNS FROM admin LIKE 'email'");
    $exists = $stmt->fetch();

    if (!$exists) {
        // Adicionar coluna email se não existir
        $pdo->exec('ALTER TABLE admin ADD COLUMN email VARCHAR(100) UNIQUE AFTER username');
        echo 'Coluna email adicionada com sucesso!';
    } else {
        echo 'Coluna email já existe.';
    }
} catch (PDOException $e) {
    echo 'Erro: ' . $e->getMessage();
}
?>
