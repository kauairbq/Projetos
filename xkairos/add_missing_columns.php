<?php
include "includes/config.php";

try {
    // Adicionar colunas faltantes para componentes
    $alter_queries = [
        "ALTER TABLE solicitacoes ADD COLUMN cpu_preco DECIMAL(10,2) DEFAULT 0 AFTER cpu",
        "ALTER TABLE solicitacoes ADD COLUMN gpu_preco DECIMAL(10,2) DEFAULT 0 AFTER gpu",
        "ALTER TABLE solicitacoes ADD COLUMN ram_preco DECIMAL(10,2) DEFAULT 0 AFTER ram",
        "ALTER TABLE solicitacoes ADD COLUMN ssd_preco DECIMAL(10,2) DEFAULT 0 AFTER ssd",
        "ALTER TABLE solicitacoes ADD COLUMN placa_mae_preco DECIMAL(10,2) DEFAULT 0 AFTER placa_mae",
        "ALTER TABLE solicitacoes ADD COLUMN cooler_preco DECIMAL(10,2) DEFAULT 0 AFTER cooler"
    ];

    foreach ($alter_queries as $query) {
        try {
            $pdo->exec($query);
            echo "Coluna adicionada com sucesso: " . substr($query, strpos($query, 'ADD COLUMN') + 11) . "<br>";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') === false) {
                echo "Erro ao adicionar coluna: " . $e->getMessage() . "<br>";
            } else {
                echo "Coluna já existe: " . substr($query, strpos($query, 'ADD COLUMN') + 11) . "<br>";
            }
        }
    }

    echo "<br>Colunas faltantes adicionadas com sucesso!";

} catch (PDOException $e) {
    die("Erro geral: " . $e->getMessage());
}
?>
