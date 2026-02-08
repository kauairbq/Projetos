<?php
include "includes/config.php";

try {
    $sql = "CREATE TABLE IF NOT EXISTS riscos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projeto_id INT NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        categoria VARCHAR(50),
        probabilidade ENUM('Baixa','Media','Alta') DEFAULT 'Baixa',
        impacto ENUM('Baixo','Médio','Alto') DEFAULT 'Baixo',
        status ENUM('Aberto','Em Mitigacao','Mitigado') DEFAULT 'Aberto',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);

    $sql2 = "CREATE TABLE IF NOT EXISTS mitigacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        risco_id INT NOT NULL,
        acao VARCHAR(255) NOT NULL,
        concluido TINYINT(1) DEFAULT 0,
        FOREIGN KEY (risco_id) REFERENCES riscos(id)
    )";
    $pdo->exec($sql2);

    echo "Tabelas riscos e mitigacoes criadas com sucesso!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
