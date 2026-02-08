<?php
include 'includes/config.php';

try {
    $id = 1;
    $stmt = $pdo->prepare('SELECT * FROM solicitacoes WHERE id=?');
    $stmt->execute([$id]);
    $s = $stmt->fetch();

    if ($s) {
        echo "Solicitação encontrada:<br>";
        echo "ID: " . $s['id'] . "<br>";
        echo "Cliente: " . $s['cliente_nome'] . "<br>";
        echo "CPU: " . $s['cpu'] . "<br>";
        echo "GPU: " . $s['gpu'] . "<br>";
        echo "RAM: " . $s['ram'] . "<br>";
        echo "SSD: " . $s['ssd'] . "<br>";
        echo "Total: " . $s['total'] . "<br>";
        echo "Status: " . $s['status'] . "<br>";
    } else {
        echo "Solicitação não encontrada";
    }
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
