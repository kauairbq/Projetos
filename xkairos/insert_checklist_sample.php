<?php
include 'includes/config.php';

$projeto_id = 1; // ID do projeto de exemplo
$etapas = [
    'Solicitação recebida e registrada',
    'Consultoria feita e aprovada',
    'Peças compradas / recebidas',
    'Montagem completa',
    'Testes de performance realizados',
    'Limpeza final e ajustes',
    'Entrega realizada',
    'Registro no CRM atualizado',
    'Suporte pós-venda ativo'
];

foreach ($etapas as $etapa) {
    $stmt = $pdo->prepare("INSERT INTO projeto_checklist (projeto_id, etapa, concluida) VALUES (?, ?, 0)");
    $stmt->execute([$projeto_id, $etapa]);
}

echo "Dados de exemplo inseridos na tabela projeto_checklist.";
?>
