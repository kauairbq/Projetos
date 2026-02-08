<?php
include "includes/config.php";

try {
    // Adicionar colunas de faturamento à tabela clientes
    $alter_queries = [
        "ALTER TABLE clientes ADD COLUMN morada VARCHAR(255) DEFAULT NULL AFTER data_cadastro",
        "ALTER TABLE clientes ADD COLUMN codigo_postal VARCHAR(20) DEFAULT NULL AFTER morada",
        "ALTER TABLE clientes ADD COLUMN cidade VARCHAR(100) DEFAULT NULL AFTER codigo_postal",
        "ALTER TABLE clientes ADD COLUMN pais VARCHAR(100) DEFAULT 'Portugal' AFTER cidade",
        "ALTER TABLE clientes ADD COLUMN nif VARCHAR(20) DEFAULT NULL AFTER pais",
        "ALTER TABLE clientes ADD COLUMN telefone VARCHAR(20) DEFAULT NULL AFTER nif",
        "ALTER TABLE clientes ADD COLUMN nome_empresa VARCHAR(100) DEFAULT NULL AFTER telefone",
        "ALTER TABLE clientes ADD COLUMN email_faturamento VARCHAR(100) DEFAULT NULL AFTER nome_empresa"
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

    echo "<br>Colunas de faturamento adicionadas com sucesso à tabela clientes!";

} catch (PDOException $e) {
    die("Erro geral: " . $e->getMessage());
}
?>
