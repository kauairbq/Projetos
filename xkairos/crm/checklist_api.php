<?php
header('Content-Type: application/json');
include '../includes/config.php';
require '../vendor/fpdf/fpdf.php';

$action = $_POST['action'] ?? '';

if ($action === 'load') {
    $projeto_id = $_POST['projeto_id'] ?? 0;
    $stmt = $pdo->prepare("SELECT * FROM projeto_checklist WHERE projeto_id = ?");
    $stmt->execute([$projeto_id]);
    $checklist = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($checklist);
    exit;
} elseif ($action === 'save') {
    $projeto_id = $_POST['projeto_id'] ?? 0;
    $data = json_decode($_POST['data'], true);
    foreach ($data as $etapa => $concluida) {
        $stmt = $pdo->prepare("UPDATE projeto_checklist SET concluida = ? WHERE projeto_id = ? AND etapa = ?");
        $stmt->execute([$concluida, $projeto_id, $etapa]);
    }
    echo json_encode(['status' => 'success']);
    exit;
} elseif ($action === 'pdf') {
    $projeto_id = $_POST['projeto_id'] ?? 0;
    $stmt = $pdo->prepare("SELECT * FROM projeto_checklist WHERE projeto_id = ?");
    $stmt->execute([$projeto_id]);
    $checklist = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $pdf = new \FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial','B',16);
    $pdf->Cell(0,10,'Checklist - Projeto ID '.$projeto_id,0,1,'C');
    $pdf->Ln(5);
    $pdf->SetFont('Arial','',12);

    foreach($checklist as $item){
        $status = $item['concluida'] ? 'Concluída' : 'Pendente';
        $pdf->Cell(0,10,"- ".mb_convert_encoding($item['etapa'], 'ISO-8859-1', 'UTF-8')." : {$status}",0,1);
    }

    $pdf->Output('I', 'Checklist_Projeto_'.$projeto_id.'.pdf');
    exit;
} else {
    echo json_encode(['error' => 'Ação inválida']);
}
?>
