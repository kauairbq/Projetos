<?php
require_once 'includes/config.php';

try {
    // Verificar estrutura da tabela admin
    $stmt = $pdo->query('DESCRIBE admin');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Estrutura da tabela admin:\n";
    foreach ($columns as $column) {
        echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }

    // Verificar se o admin foi inserido
    $stmt = $pdo->query('SELECT id, username, email FROM admin');
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "\nAdmins cadastrados:\n";
    foreach ($admins as $admin) {
        echo "- ID: " . $admin['id'] . ", Username: " . $admin['username'] . ", Email: " . $admin['email'] . "\n";
    }

    // Verificar se a senha está correta
    $stmt = $pdo->prepare('SELECT password FROM admin WHERE username = ?');
    $stmt->execute(['kauai rocha']);
    $hashedPassword = $stmt->fetchColumn();

    if ($hashedPassword && password_verify('031018', $hashedPassword)) {
        echo "\n✅ Senha correta para o admin 'kauai rocha'!\n";
    } else {
        echo "\n❌ Senha incorreta ou admin não encontrado!\n";
    }

} catch (PDOException $e) {
    echo 'Erro: ' . $e->getMessage();
}
?>
