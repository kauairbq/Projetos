a<?php
include '../includes/config.php';

$action = $_POST['action'] ?? '';
switch($action){
    case 'add':
        $stmt = $pdo->prepare("INSERT INTO riscos (projeto_id, descricao, categoria, probabilidade, impacto) VALUES (?,?,?,?,?)");
        $stmt->execute([
            $_POST['projeto_id'],
            $_POST['descricao'],
            $_POST['categoria'],
            $_POST['probabilidade'],
            $_POST['impacto']
        ]);
        echo json_encode(['status'=>'success']);
        break;

    case 'updateStatus':
        $stmt = $pdo->prepare("UPDATE riscos SET status=? WHERE id=?");
        $stmt->execute([$_POST['status'], $_POST['id']]);
        echo json_encode(['status'=>'success']);
        break;

    case 'list':
        $projeto_id = $_POST['projeto_id'] ?? null;
        if ($projeto_id) {
            $stmt = $pdo->prepare("SELECT * FROM riscos WHERE projeto_id = ? ORDER BY data_criacao DESC");
            $stmt->execute([$projeto_id]);
        } else {
            $stmt = $pdo->query("SELECT * FROM riscos ORDER BY data_criacao DESC");
        }
        $riscos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($riscos);
        break;

    case 'addMitigacao':
        $stmt = $pdo->prepare("INSERT INTO mitigacoes (risco_id, acao) VALUES (?,?)");
        $stmt->execute([$_POST['risco_id'], $_POST['acao']]);
        echo json_encode(['status'=>'success']);
        break;

    case 'listMitigacoes':
        $stmt = $pdo->prepare("SELECT * FROM mitigacoes WHERE risco_id=?");
        $stmt->execute([$_POST['risco_id']]);
        $mitigacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($mitigacoes);
        break;
}
?>
