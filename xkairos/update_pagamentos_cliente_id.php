<?php
include "includes/config.php";

try {
    // Atualizar registros existentes com cliente_id = 1 (assumindo que é o cliente Kauai)
    $sql = "UPDATE pagamentos SET cliente_id = 1 WHERE cliente_id = 0 OR cliente_id IS NULL";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    echo "Registros de pagamentos atualizados com cliente_id = 1!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
