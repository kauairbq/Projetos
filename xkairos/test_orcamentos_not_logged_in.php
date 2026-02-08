<?php
session_start();
include "includes/config.php";

// Simular cliente NÃO logado (sem session)
unset($_SESSION['cliente_id']);

// Verificar se cliente está logado
$is_logged_in = isset($_SESSION['cliente_id']);

if ($is_logged_in) {
    $stmt = $pdo->prepare("SELECT nome, email FROM clientes WHERE id = ?");
    $stmt->execute([$_SESSION['cliente_id']]);
    $cliente_data = $stmt->fetch();
    $cliente_nome = $cliente_data['nome'] ?? '';
    $cliente_email = $cliente_data['email'] ?? '';
} else {
    $cliente_nome = '';
    $cliente_email = '';
}

echo "Cliente logado: " . ($is_logged_in ? 'Sim' : 'Não') . "\n";
echo "Nome: " . $cliente_nome . "\n";
echo "Email: " . $cliente_email . "\n";

// Simular o HTML do formulário
echo "\n--- Simulação do formulário ---\n";
echo "<input type=\"text\" id=\"nome\" name=\"nome\" value=\"" . htmlspecialchars($cliente_nome) . "\">\n";
echo "<input type=\"email\" id=\"email\" name=\"email\" value=\"" . htmlspecialchars($cliente_email) . "\">\n";
?>
