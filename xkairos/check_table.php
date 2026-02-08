<?php
include 'includes/config.php';

try {
    $result = $pdo->query('DESCRIBE solicitacoes');
    $columns = $result->fetchAll(PDO::FETCH_ASSOC);
    echo "Colunas da tabela solicitacoes:<br>";
    foreach ($columns as $col) {
        echo $col['Field'] . " - " . $col['Type'] . "<br>";
    }
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
