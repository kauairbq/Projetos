<?php
include 'includes/config.php';

try {
    // Verificar se cliente já existe
    $stmt = $pdo->prepare("SELECT id FROM clientes WHERE email = ?");
    $stmt->execute(['joao@example.com']);
    $cliente = $stmt->fetch();
    if ($cliente) {
        $cliente_id = $cliente['id'];
        echo "Cliente já existe com ID: $cliente_id<br>";
    } else {
        $stmt = $pdo->prepare("INSERT INTO clientes (nome, email, senha) VALUES (?, ?, ?)");
        $stmt->execute(['João Silva', 'joao@example.com', password_hash('123456', PASSWORD_DEFAULT)]);
        $cliente_id = $pdo->lastInsertId();
        echo "Cliente inserido com ID: $cliente_id<br>";
    }

    // Inserir solicitação de exemplo
    $stmt = $pdo->prepare("INSERT INTO solicitacoes (cliente_id, cliente_nome, cliente_email, cpu, gpu, ram, ssd, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$cliente_id, 'João Silva', 'joao@example.com', 'Intel i5-12400F', 'RTX 4060', '16GB DDR4', '500GB SSD', 740.00, 'pendente']);
    $solicitacao_id = $pdo->lastInsertId();
    echo "Solicitação inserida com ID: $solicitacao_id<br>";

    echo "Dados de exemplo inseridos com sucesso!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
