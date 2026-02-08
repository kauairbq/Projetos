<?php
include "includes/config.php";

try {
    // Adicionar colunas para suportar todos os tipos de serviço
    $alter_queries = [
        "ALTER TABLE solicitacoes ADD COLUMN tipo_servico VARCHAR(20) DEFAULT 'montagem' AFTER cliente_email",
        "ALTER TABLE solicitacoes ADD COLUMN telefone VARCHAR(20) AFTER tipo_servico",
        "ALTER TABLE solicitacoes ADD COLUMN localidade VARCHAR(100) AFTER telefone",
        "ALTER TABLE solicitacoes ADD COLUMN urgencia VARCHAR(20) AFTER localidade",
        "ALTER TABLE solicitacoes ADD COLUMN observacoes TEXT AFTER urgencia",

        // Campos específicos para montagem
        "ALTER TABLE solicitacoes ADD COLUMN uso_pc VARCHAR(50) AFTER observacoes",
        "ALTER TABLE solicitacoes ADD COLUMN orcamento_max DECIMAL(10,2) DEFAULT 0 AFTER uso_pc",
        "ALTER TABLE solicitacoes ADD COLUMN pecas_existentes TEXT AFTER orcamento_max",

        // Campos específicos para manutenção
        "ALTER TABLE solicitacoes ADD COLUMN tipo_manutencao VARCHAR(50) AFTER pecas_existentes",
        "ALTER TABLE solicitacoes ADD COLUMN problema TEXT AFTER tipo_manutencao",

        // Campos específicos para consultoria
        "ALTER TABLE solicitacoes ADD COLUMN tipo_consultoria VARCHAR(50) AFTER problema",
        "ALTER TABLE solicitacoes ADD COLUMN duvida TEXT AFTER tipo_consultoria"
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

    echo "<br>Tabela solicitacoes atualizada com sucesso para suportar todos os tipos de serviço!";

} catch (PDOException $e) {
    die("Erro geral: " . $e->getMessage());
}
?>
