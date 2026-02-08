<?php
include 'includes/config.php';

try {
    // Adicionar colunas para o gabinete (case)
    $alter_queries = [
        "ALTER TABLE solicitacoes ADD COLUMN case VARCHAR(100) AFTER power_supply",
        "ALTER TABLE solicitacoes ADD COLUMN case_preco DECIMAL(10,2) DEFAULT 0 AFTER case"
    ];

    foreach ($alter_queries as $query) {
        try {
            $pdo->exec($query);
            echo "Executado: $query<br>";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') === false) {
                echo "Erro ao executar $query: " . $e->getMessage() . "<br>";
            } else {
                echo "Coluna já existe: $query<br>";
            }
        }
    }

    echo "<br>Colunas do gabinete foram adicionadas com sucesso!";

} catch (PDOException $e) {
    echo "Erro geral: " . $e->getMessage();
}
?>
