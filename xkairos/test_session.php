<?php
session_start();
include 'includes/config.php';

// Simular cliente logado
$_SESSION['cliente_id'] = 1; // Assumindo que existe um cliente com ID 1

// Verificar se cliente está logado
$is_logged_in = isset($_SESSION['cliente_id']);

if ($is_logged_in) {
    $stmt = $pdo->prepare('SELECT nome, email FROM clientes WHERE id = ?');
    $stmt->execute([$_SESSION['cliente_id']]);
    $cliente_data = $stmt->fetch();
    $cliente_nome = $cliente_data['nome'] ?? '';
    $cliente_email = $cliente_data['email'] ?? '';
} else {
    $cliente_nome = '';
    $cliente_email = '';
}

echo 'Cliente logado: ' . ($is_logged_in ? 'Sim' : 'Não') . PHP_EOL;
echo 'Nome: ' . $cliente_nome . PHP_EOL;
echo 'Email: ' . $cliente_email . PHP_EOL;
?>
