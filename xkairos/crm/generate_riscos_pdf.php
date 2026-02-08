<?php
include '../includes/config.php';
session_start();

if (!isset($_SESSION['cliente_id'])) {
    header("Location: login.php");
    exit;
}

require('../vendor/fpdf/fpdf.php');

class PDF extends FPDF {
    function Header() {
        $this->SetFont('Arial','B',15);
        $this->Cell(0,10,'Relatório de Riscos e Mitigações',0,1,'C');
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

// Buscar riscos do cliente
$stmt = $pdo->prepare("SELECT * FROM riscos WHERE projeto_id IN (SELECT id FROM solicitacoes WHERE cliente_email = (SELECT email FROM clientes WHERE id = ?)) ORDER BY data_criacao");
$stmt->execute([$_SESSION['cliente_id']]);
$riscos = $stmt->fetchAll();

if (count($riscos) > 0) {
    foreach ($riscos as $risco) {
        $pdf->Cell(0,10, mb_convert_encoding('Risco: ' . $risco['descricao'], 'ISO-8859-1', 'UTF-8'),0,1);
        $pdf->Cell(0,10, mb_convert_encoding('Categoria: ' . $risco['categoria'] . ' | Probabilidade: ' . $risco['probabilidade'] . ' | Impacto: ' . $risco['impacto'] . ' | Status: ' . $risco['status'], 'ISO-8859-1', 'UTF-8'),0,1);

        // Buscar mitigações
        $stmt_mit = $pdo->prepare("SELECT * FROM mitigacoes WHERE risco_id = ?");
        $stmt_mit->execute([$risco['id']]);
        $mitigacoes = $stmt_mit->fetchAll();

        if (count($mitigacoes) > 0) {
            $pdf->Cell(0,10, mb_convert_encoding('Mitigações:', 'ISO-8859-1', 'UTF-8'),0,1);
            foreach ($mitigacoes as $mit) {
                $pdf->Cell(0,10, mb_convert_encoding('- ' . $mit['acao'], 'ISO-8859-1', 'UTF-8'),0,1);
            }
        } else {
            $pdf->Cell(0,10, mb_convert_encoding('Nenhuma mitigação registrada.', 'ISO-8859-1', 'UTF-8'),0,1);
        }
        $pdf->Ln(5);
    }
} else {
    $pdf->Cell(0,10, mb_convert_encoding('Nenhum risco encontrado.', 'ISO-8859-1', 'UTF-8'),0,1);
}

$pdf->Output('D', 'riscos_relatorio.pdf');
?>
