<?php
include '../includes/config.php';

$action = $_POST['action'] ?? '';
switch($action){
    case 'add':
        $stmt = $pdo->prepare("INSERT INTO pagamentos 
            (projeto_id, cliente_nome, taxa_fixa, valor_pecas, margem, servicos_adicionais, total) 
            VALUES (?,?,?,?,?,?,?)");
        $stmt->execute([
            $_POST['projeto_id'],
            $_POST['cliente_nome'],
            $_POST['taxa_fixa'],
            $_POST['valor_pecas'],
            $_POST['margem'],
            $_POST['servicos_adicionais'],
            $_POST['total']
        ]);
        echo json_encode(['status'=>'success']);
        break;

    case 'updateStatus':
        $stmt = $pdo->prepare("UPDATE pagamentos SET status=? WHERE id=?");
        $stmt->execute([$_POST['status'], $_POST['id']]);
        echo json_encode(['status'=>'success']);
        break;

    case 'list':
        $stmt = $pdo->query("SELECT * FROM pagamentos ORDER BY data_criacao DESC");
        $pagamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($pagamentos);
        break;

    case 'mbwayPayment':
        // Aqui você vai integrar a API de teste MBWay
        echo json_encode(['status'=>'success', 'message'=>'Pagamento MBWay simulado']);
        break;
}
?>
