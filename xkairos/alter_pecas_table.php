<?php
require_once 'includes/config.php';

try {
    $pdo->exec('ALTER TABLE pecas ADD COLUMN imagem VARCHAR(255)');
    echo "Coluna 'imagem' adicionada!<br>";

    $pdo->exec('ALTER TABLE pecas ADD COLUMN categoria VARCHAR(50)');
    echo "Coluna 'categoria' adicionada!<br>";

    $pdo->exec('ALTER TABLE pecas ADD COLUMN descricao TEXT');
    echo "Coluna 'descricao' adicionada!<br>";

    $pdo->exec('ALTER TABLE pecas ADD COLUMN ativo BOOLEAN DEFAULT TRUE');
    echo "Coluna 'ativo' adicionada!<br>";

    $pdo->exec('ALTER TABLE pecas ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    echo "Coluna 'created_at' adicionada!<br>";

    $pdo->exec('ALTER TABLE pecas ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    echo "Coluna 'updated_at' adicionada!<br>";

    echo "Todas as colunas foram adicionadas com sucesso!";
} catch (PDOException $e) {
    echo 'Erro: ' . $e->getMessage();
}
?>
