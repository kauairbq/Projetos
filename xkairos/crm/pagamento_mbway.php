<?php
include '../includes/config.php';
include '../includes/header.php';
session_start();

// Aplicar estilos globais da Xkairos Tech
echo '<link rel="stylesheet" href="../assets/css/base/variables.css">';
echo '<link rel="stylesheet" href="../assets/css/base/reset.css">';
echo '<link rel="stylesheet" href="../assets/css/base/typography.css">';
echo '<link rel="stylesheet" href="../assets/css/base/utilities.css">';
echo '<link rel="stylesheet" href="../assets/css/layout/header.css">';
echo '<link rel="stylesheet" href="../assets/css/layout/footer.css">';
echo '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">';

// Obter dados via GET ou POST
$solicitacao_id = $_GET['id'] ?? $_POST['solicitacao_id'] ?? null;
$valor = $_POST['valor'] ?? null;

// Verificar se solicitacao_id foi fornecido
if (!$solicitacao_id) {
    die('ID da solicitação não fornecido.');
}

// Buscar o total da solicitação para calcular o valor se não fornecido
if (!$valor) {
    $stmt = $pdo->prepare('SELECT * FROM solicitacoes WHERE id=?');
    $stmt->execute([$solicitacao_id]);
    $s = $stmt->fetch();
    if (!$s) die('Solicitação não encontrada.');
    // Calcular total com peças + taxa
    $pecas_precos = [
        $s['cpu_preco'] ?? 0,
        $s['gpu_preco'] ?? 0,
        $s['ram_preco'] ?? 0,
        $s['ssd_preco'] ?? 0,
        $s['placa_mae_preco'] ?? 0,
        $s['cooler_preco'] ?? 0,
        $s['case_preco'] ?? 0
    ];
    $subtotal = array_sum($pecas_precos);
    $taxaServico = 200;
    $valor = $subtotal + $taxaServico;
}

$stmt = $pdo->prepare('INSERT INTO pagamentos (solicitacao_id, metodo, valor, status) VALUES (?,?,?,?)');
$stmt->execute([$solicitacao_id,'MBWAY',$valor,'Pago']); // Simular como pago
?>

<div class="container">
    <div class="payment-success">
        <div class="payment-header">
            <h1>Pagamento MBWAY</h1>
            <div class="payment-status success">
                <i class="fas fa-check-circle"></i>
                <span>Pagamento Efetuado com Sucesso!</span>
            </div>
        </div>

        <div class="payment-details">
            <div class="detail-item">
                <span class="label">ID da Solicitação:</span>
                <span class="value">#<?php echo $solicitacao_id; ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Valor Pago:</span>
                <span class="value">€<?php echo number_format($valor, 2, ',', '.'); ?></span>
            </div>
            <div class="detail-item">
                <span class="label">Método:</span>
                <span class="value">MBWAY</span>
            </div>
            <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status-paid">Pago</span>
            </div>
        </div>

        <?php if(isset($_POST['parcelas'])): ?>
        <div class="parcelamento-info">
            <h3>Parcelamento</h3>
            <?php
            $parcelas = $_POST['parcelas'];
            $valor_parcela = $valor / $parcelas;
            ?>
            <p>Parcelado em <?php echo $parcelas; ?>x de €<?php echo number_format($valor_parcela, 2, ',', '.'); ?> cada</p>
        </div>
        <?php endif; ?>

        <div class="payment-actions">
            <a href="dashboard.php" class="btn btn-primary">
                <i class="fas fa-arrow-left"></i> Voltar ao Dashboard
            </a>
            <a href="orcamento.php?id=<?php echo $solicitacao_id; ?>" class="btn btn-secondary">
                <i class="fas fa-file-pdf"></i> Ver Orçamento
            </a>
        </div>
    </div>
</div>

<style>
.payment-success {
    max-width: 600px;
    margin: 2rem auto;
    background: var(--color-bg-alt);
    border-radius: var(--radius);
    padding: 2rem;
    box-shadow: var(--shadow);
    border: 1px solid rgba(100, 255, 218, 0.1);
}

.payment-header {
    text-align: center;
    margin-bottom: 2rem;
}



.payment-header h1 {
    color: var(--color-primary);
    margin-bottom: 1rem;
    font-size: 2rem;
    font-weight: 700;
    text-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
}

.payment-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: var(--radius);
    font-weight: bold;
    background: rgba(100, 255, 218, 0.1);
    border: 1px solid rgba(100, 255, 218, 0.2);
}

.payment-status.success {
    background: rgba(100, 255, 218, 0.1);
    color: var(--color-primary);
}

.payment-status i {
    font-size: 1.5rem;
    color: var(--color-primary);
}

.payment-details {
    background: var(--color-bg);
    border-radius: var(--radius);
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(100, 255, 218, 0.1);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(100, 255, 218, 0.1);
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-item .label {
    font-weight: bold;
    color: var(--color-text-alt);
    font-size: 0.95rem;
}

.detail-item .value {
    color: var(--color-text);
    font-weight: 500;
    font-size: 0.95rem;
}

.status-paid {
    color: var(--color-primary) !important;
    font-weight: bold;
}

.parcelamento-info {
    background: rgba(100, 255, 218, 0.05);
    border: 1px solid var(--color-primary);
    border-radius: var(--radius);
    padding: 1rem;
    margin-bottom: 2rem;
    text-align: center;
}

.parcelamento-info h3 {
    color: var(--color-primary);
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
    font-weight: 600;
}

.parcelamento-info p {
    color: var(--color-text);
    margin: 0;
    font-size: 0.95rem;
}

.payment-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    font-size: 0.95rem;
    border: 2px solid transparent;
}

.btn-primary {
    background: var(--color-primary);
    color: var(--color-bg);
    box-shadow: 0 4px 15px rgba(100, 255, 218, 0.3);
}

.btn-primary:hover {
    background: #4ade80;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(100, 255, 218, 0.4);
}

.btn-secondary {
    background: var(--color-bg-alt);
    color: var(--color-text);
    border: 2px solid rgba(100, 255, 218, 0.2);
}

.btn-secondary:hover {
    background: var(--color-bg);
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .payment-success {
        margin: 1rem;
        padding: 1rem;
    }

    .payment-actions {
        flex-direction: column;
    }

    .btn {
        justify-content: center;
        width: 100%;
    }
}
</style>

<?php include '../includes/footer.php'; ?>
