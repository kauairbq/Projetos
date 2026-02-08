<?php
include "includes/config.php";

try {
    // Adicionar coluna cliente_id à tabela pagamentos
    $sql = "ALTER TABLE pagamentos ADD COLUMN cliente_id INT NOT NULL DEFAULT 1 AFTER id";
    $pdo->exec($sql);
    echo "Coluna cliente_id adicionada com sucesso à tabela pagamentos!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
