<?php
include "includes/config.php";

try {
    $sql = "CREATE TABLE IF NOT EXISTS pagamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projeto_id INT NOT NULL,
        cliente_nome VARCHAR(255) NOT NULL,
        taxa_fixa DECIMAL(10,2) NOT NULL DEFAULT 0,
        valor_pecas DECIMAL(10,2) NOT NULL DEFAULT 0,
        margem DECIMAL(10,2) NOT NULL DEFAULT 0,
        servicos_adicionais DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        status ENUM('Pendente','Parcial','Pago') DEFAULT 'Pendente',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "Tabela pagamentos criada com sucesso!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
