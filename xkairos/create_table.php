<?php
include "includes/config.php";

try {
    $sql = "CREATE TABLE IF NOT EXISTS solicitacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        cliente_nome VARCHAR(100) NOT NULL,
        cliente_email VARCHAR(100) NOT NULL,
        cpu VARCHAR(50),
        gpu VARCHAR(50),
        ram VARCHAR(50),
        ssd VARCHAR(50),
        placa_mae VARCHAR(50),
        cooler VARCHAR(50),
        cpu_preco DECIMAL(10,2) DEFAULT 0,
        gpu_preco DECIMAL(10,2) DEFAULT 0,
        ram_preco DECIMAL(10,2) DEFAULT 0,
        ssd_preco DECIMAL(10,2) DEFAULT 0,
        placa_mae_preco DECIMAL(10,2) DEFAULT 0,
        cooler_preco DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pendente',
        data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $pdo->exec($sql);
    echo "Tabela solicitacoes criada com sucesso!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
