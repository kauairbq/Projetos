<?php
include 'includes/config.php';

try {
    // Adicionar colunas para os novos componentes
    $alter_queries = [
        "ALTER TABLE solicitacoes ADD COLUMN mouse VARCHAR(100) AFTER cooler",
        "ALTER TABLE solicitacoes ADD COLUMN keyboard VARCHAR(100) AFTER mouse",
        "ALTER TABLE solicitacoes ADD COLUMN speakers VARCHAR(100) AFTER keyboard",
        "ALTER TABLE solicitacoes ADD COLUMN webcam VARCHAR(100) AFTER speakers",
        "ALTER TABLE solicitacoes ADD COLUMN monitors VARCHAR(100) AFTER webcam",
        "ALTER TABLE solicitacoes ADD COLUMN power_supply VARCHAR(100) AFTER monitors",

        // Preços correspondentes
        "ALTER TABLE solicitacoes ADD COLUMN mouse_preco DECIMAL(10,2) DEFAULT 0 AFTER mouse",
        "ALTER TABLE solicitacoes ADD COLUMN keyboard_preco DECIMAL(10,2) DEFAULT 0 AFTER keyboard",
        "ALTER TABLE solicitacoes ADD COLUMN speakers_preco DECIMAL(10,2) DEFAULT 0 AFTER speakers",
        "ALTER TABLE solicitacoes ADD COLUMN webcam_preco DECIMAL(10,2) DEFAULT 0 AFTER webcam",
        "ALTER TABLE solicitacoes ADD COLUMN monitors_preco DECIMAL(10,2) DEFAULT 0 AFTER monitors",
        "ALTER TABLE solicitacoes ADD COLUMN power_supply_preco DECIMAL(10,2) DEFAULT 0 AFTER power_supply"
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

    echo "<br>Todas as colunas foram adicionadas com sucesso!";

} catch (PDOException $e) {
    echo "Erro geral: " . $e->getMessage();
}
?>
