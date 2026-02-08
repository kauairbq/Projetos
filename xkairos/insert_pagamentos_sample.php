<?php
include "includes/config.php";

try {
    $stmt = $pdo->prepare("INSERT INTO pagamentos (solicitacao_id, metodo, valor, status) VALUES (?, ?, ?, ?)");
    $stmt->execute([1, 'MBWAY', 750.00, 'Pendente']);
    $stmt->execute([2, 'MBWAY', 910.00, 'Pago']);
    echo "Dados de exemplo inseridos na tabela pagamentos!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
