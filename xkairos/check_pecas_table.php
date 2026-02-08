<?php
require_once 'includes/config.php';

try {
    $stmt = $pdo->query('DESCRIBE pecas');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Estrutura da tabela 'pecas':<br>";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']}<br>";
    }
} catch (PDOException $e) {
    echo 'Erro: ' . $e->getMessage();
}
?>
