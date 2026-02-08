<?php
include 'includes/config.php';

try {
    // Atualizar nome do cliente no CRM
    $stmt = $pdo->prepare("UPDATE clientes SET nome = ? WHERE email = ?");
    $stmt->execute(['Kauai Rocha', 'kauai@adm.com']);

    echo "Nome do cliente atualizado com sucesso!<br>";
    echo "Novo Nome: Kauai Rocha<br>";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
