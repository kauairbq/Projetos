<?php
include 'includes/config.php';

try {
    // Verificar se a coluna cliente_id já existe
    $stmt = $pdo->query("DESCRIBE solicitacoes");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $has_cliente_id = false;
    foreach ($columns as $col) {
        if ($col['Field'] === 'cliente_id') {
            $has_cliente_id = true;
            break;
        }
    }

    if (!$has_cliente_id) {
        // Adicionar coluna cliente_id
        $pdo->exec("ALTER TABLE solicitacoes ADD COLUMN cliente_id INT NOT NULL AFTER id");

        // Adicionar chave estrangeira
        $pdo->exec("ALTER TABLE solicitacoes ADD CONSTRAINT fk_solicitacoes_cliente_id FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE");

        // Atualizar registros existentes com cliente_id baseado no email
        $pdo->exec("UPDATE solicitacoes s SET cliente_id = (SELECT id FROM clientes c WHERE c.email = s.cliente_email) WHERE cliente_id IS NULL OR cliente_id = 0");

        echo "Coluna cliente_id adicionada com sucesso à tabela solicitacoes!<br>";
        echo "Chave estrangeira criada!<br>";
        echo "Registros existentes atualizados!<br>";
    } else {
        echo "A coluna cliente_id já existe na tabela solicitacoes.<br>";
    }

    echo "Operação concluída com sucesso!";
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>
