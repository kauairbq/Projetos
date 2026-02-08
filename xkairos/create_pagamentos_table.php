<?php
include "includes/config.php";

try {
    $sql = "CREATE TABLE IF NOT EXISTS pagamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        solicitacao_id INT NOT NULL,
        metodo VARCHAR(50) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pendente',
        data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id)
    )";
    $pdo->exec($sql);
    echo "Tabela pagamentos criada com sucesso!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
