<?php
include "../includes/config.php";
session_start();

if (!isset($_SESSION['cliente_id'])) {
    header("Location: login.php");
    exit;
}

require('../vendor/fpdf/fpdf.php');

class PDF extends FPDF {
    function Header() {
        $this->SetFont('Arial','B',15);
        $this->Cell(0,10,'Status do Checklist de Projeto',0,1,'C');
        $this->Ln(10);
    }

    function Footer() {
        $this->SetY(-15);
        $this->SetFont('Arial','I',8);
        $this->Cell(0,10,'Página '.$this->PageNo(),0,0,'C');
    }
}

$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial','',12);

// Buscar checklist do cliente
$stmt = $pdo->prepare("SELECT * FROM projeto_checklist WHERE cliente_id = ? ORDER BY etapa");
$stmt->execute([$_SESSION['cliente_id']]);
$checklist = $stmt->fetchAll();

if (count($checklist) > 0) {
    foreach ($checklist as $item) {
        $status = $item['concluido'] ? 'Concluído' : 'Pendente';
        $pdf->Cell(0,10, mb_convert_encoding($item['etapa'] . ' - ' . $status, 'ISO-8859-1', 'UTF-8'),0,1);
    }
} else {
    $pdf->Cell(0,10, mb_convert_encoding('Nenhum item no checklist encontrado.', 'ISO-8859-1', 'UTF-8'),0,1);
}

$pdf->Output('D', 'checklist_status.pdf');
?>
