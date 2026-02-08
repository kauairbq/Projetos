<?php
include 'includes/config.php';

$novo_projeto_id = 2; // ID do novo projeto
$projeto_base_id = 1; // ID do projeto base (exemplo)

$stmt = $pdo->prepare("INSERT INTO projeto_checklist (projeto_id, etapa, concluida) SELECT ?, etapa, 0 FROM projeto_checklist WHERE projeto_id = ?");
$stmt->execute([$novo_projeto_id, $projeto_base_id]);

echo "Checklist clonado para o novo projeto ID $novo_projeto_id.";
?>
