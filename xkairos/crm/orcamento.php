<?php
require '../vendor/fpdf/fpdf.php';
include '../includes/config.php';

// ID da solicitação
$id = $_GET['id'] ?? 0;

// Buscar dados da solicitação
$stmt = $pdo->prepare('SELECT * FROM solicitacoes WHERE id=?');
$stmt->execute([$id]);
$s = $stmt->fetch();

if (!$s) die('Solicitação não encontrada');

// Criar PDF
$pdf = new \FPDF();
$pdf->AddPage();

// Função para converter UTF-8 para ISO-8859-1
function encode($text) {
    return mb_convert_encoding($text, 'ISO-8859-1', 'UTF-8');
}

// Cores da empresa (baseadas na paleta do site)
$primaryColor = [100, 255, 218]; // #64FFDA (var(--color-primary))
$bgColor = [10, 25, 47]; // #0A192F (var(--color-bg))
$textColor = [230, 241, 255]; // #E6F1FF (var(--color-text))

// Header com gradiente
$pdf->SetFillColor($bgColor[0], $bgColor[1], $bgColor[2]);
$pdf->Rect(0, 0, 210, 50, 'F');

// Logo (usar imagem específica se disponível, senão texto)
$logoPath = '../imagens/Imagem do WhatsApp de 2025-10-21 à(s) 09.56.28_5c6d7850.jpg';
if(file_exists($logoPath)){
    $pdf->Image($logoPath, 10, 10, 30);
} else {
    // Fallback para texto se não houver logo
    $pdf->SetFont('Arial', 'B', 16);
    $pdf->SetXY(10, 15);
    $pdf->Cell(30, 8, encode('Xkairos'), 1, 0, 'C');
}

// Título
$pdf->SetTextColor($textColor[0], $textColor[1], $textColor[2]);
$pdf->SetFont('Arial', 'B', 20);
$pdf->SetXY(50, 15);
$pdf->Cell(0, 8, encode('Xkairos Tech'), 0, 1, 'L');

$pdf->SetFont('Arial', '', 12);
$pdf->SetXY(50, 25);
$pdf->Cell(0, 5, encode('Orçamento de Montagem de PC'), 0, 1, 'L');

// Reset para conteúdo
$pdf->SetTextColor(0, 0, 0);
$pdf->SetXY(10, 50);

// Informações do orçamento
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, encode('Informações do Orçamento'), 0, 1, 'L');
$pdf->Ln(2);

$pdf->SetFont('Arial', '', 11);
$infoData = [
    ['ID da Solicitação:', $s['id']],
    ['Cliente:', $s['cliente_nome']],
    ['Data da Solicitação:', date('d/m/Y H:i', strtotime($s['data_solicitacao']))],
    ['Status:', ucfirst($s['status'])]
];

foreach ($infoData as $info) {
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(50, 8, encode($info[0]), 0, 0);
    $pdf->SetFont('Arial', '', 11);
    $pdf->Cell(0, 8, encode($info[1]), 0, 1);
}

$pdf->Ln(5);

// Detalhes do PC
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, encode('Configuração do PC'), 0, 1, 'L');
$pdf->Ln(2);

// Tabela de componentes
$pdf->SetFillColor(240, 240, 240);
$pdf->SetDrawColor(200, 200, 200);
$pdf->SetLineWidth(0.3);

$header = ['Componente', 'Seleção', 'Preço (€)'];
$widths = [60, 70, 30];

$pdf->SetFont('Arial', 'B', 10);
for ($i = 0; $i < count($header); $i++) {
    $pdf->Cell($widths[$i], 10, encode($header[$i]), 1, 0, 'C', true);
}
$pdf->Ln();

// Lista completa de peças incluindo o gabinete
$pecas = [
    ['Processador', $s['cpu'] ?? 'Não selecionado', $s['cpu_preco'] ?? 0],
    ['Placa de Vídeo', $s['gpu'] ?? 'Não selecionado', $s['gpu_preco'] ?? 0],
    ['Memória RAM', $s['ram'] ?? 'Não selecionado', $s['ram_preco'] ?? 0],
    ['Armazenamento', $s['ssd'] ?? 'Não selecionado', $s['ssd_preco'] ?? 0],
    ['Placa-Mãe', $s['placa_mae'] ?? 'Não selecionado', $s['placa_mae_preco'] ?? 0],
    ['Cooler', $s['cooler'] ?? 'Não selecionado', $s['cooler_preco'] ?? 0],
    ['Gabinete', $s['case'] ?? 'Não selecionado', $s['case_preco'] ?? 0]
];

$pdf->SetFont('Arial', '', 9);
$subtotal = 0;
foreach($pecas as $index => $p){
    $fill = $index % 2 == 0;
    if ($fill) $pdf->SetFillColor(250, 250, 250);
    else $pdf->SetFillColor(255, 255, 255);

    $pdf->Cell($widths[0], 8, encode($p[0]), 1, 0, 'L', $fill);
    $pdf->Cell($widths[1], 8, encode($p[1]), 1, 0, 'L', $fill);
    $pdf->Cell($widths[2], 8, number_format($p[2], 2, ',', '.'), 1, 1, 'R', $fill);
    $subtotal += $p[2];
}

// Totais
$pdf->Ln(3);
$pdf->SetFont('Arial', 'B', 11);

// Subtotal
$pdf->SetFillColor(230, 230, 230);
$pdf->Cell(130, 10, encode('Subtotal dos Componentes'), 1, 0, 'L', true);
$pdf->Cell(30, 10, number_format($subtotal, 2, ',', '.'), 1, 1, 'R', true);

// Taxa de serviço
$taxaServico = 200;
$pdf->Cell(130, 10, encode('Taxa de Montagem e Configuração'), 1, 0, 'L', true);
$pdf->Cell(30, 10, number_format($taxaServico, 2, ',', '.'), 1, 1, 'R', true);

// Total final
$totalFinal = $subtotal + $taxaServico;
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetFillColor($bgColor[0], $bgColor[1], $bgColor[2]);
$pdf->SetTextColor(255, 255, 255);
$pdf->Cell(130, 12, encode('TOTAL'), 1, 0, 'L', true);
$pdf->Cell(30, 12, number_format($totalFinal, 2, ',', '.'), 1, 1, 'R', true);

// Reset text color
$pdf->SetTextColor(0, 0, 0);

// Observações
if (!empty($s['observacoes'])) {
    $pdf->Ln(5);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(0, 8, encode('Observações:'), 0, 1);
    $pdf->SetFont('Arial', '', 10);
    $pdf->MultiCell(0, 6, encode($s['observacoes']));
}

// Footer posicionado no final da página
$pdf->SetY(-50);
$pdf->SetFont('Arial', '', 8);
$pdf->SetTextColor(100, 100, 100);
$pdf->Cell(0, 5, encode('Xkairos Tech - Tecnologia e Inovação'), 0, 1, 'C');
$pdf->Cell(0, 5, encode('Contato: +351 XXX XXX XXX | Email: info@xkairost.tech'), 0, 1, 'C');
$pdf->Cell(0, 5, encode('Orçamento válido por 30 dias | Data de emissão: ') . date('d/m/Y'), 0, 1, 'C');

// Link de pagamento
$pdf->Ln(3);
$pdf->SetTextColor($primaryColor[0], $primaryColor[1], $primaryColor[2]);
$pdf->SetFont('Arial', 'U', 10);
$pdf->Cell(0, 8, encode('Clique aqui para efetuar o pagamento'), 0, 1, 'C', false, 'http://localhost/xkairos/crm/pagamento_mbway.php?id=' . $s['id']);

$pdf->Output('I', 'Orcamento_XkairosTech_' . $s['id'] . '.pdf');
