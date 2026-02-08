<?php
include 'includes/config.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS projeto_checklist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projeto_id INT NOT NULL,
        etapa VARCHAR(255) NOT NULL,
        concluida TINYINT(1) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    echo "Tabela projeto_checklist criada com sucesso!";
} catch (PDOException $e) {
    echo "Erro ao criar tabela: " . $e->getMessage();
}
?>
