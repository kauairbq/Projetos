<?php
include "../includes/config.php";
session_start();

if (!isset($_SESSION['cliente_id'])) {
    header("Location: login.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $cpu = $_POST['cpu'];
    $gpu = $_POST['gpu'];
    $ram = $_POST['ram'];
    $ssd = $_POST['ssd'];
    $placa_mae = $_POST['placa_mae'];
    $cooler = $_POST['cooler'];

    // Calcular novo total (simples, baseado em preços fixos)
    $precos = [
        'cpu' => 200,
        'gpu' => 300,
        'ram' => 100,
        'ssd' => 150,
        'placa_mae' => 100,
        'cooler' => 50
    ];
    $total = $precos['cpu'] + $precos['gpu'] + $precos['ram'] + $precos['ssd'] + $precos['placa_mae'] + $precos['cooler'];

    // Atualizar solicitação
    $stmt = $pdo->prepare("UPDATE solicitacoes SET cpu = ?, gpu = ?, ram = ?, ssd = ?, placa_mae = ?, cooler = ?, total = ? WHERE id = ? AND cliente_email = (SELECT email FROM clientes WHERE id = ?)");
    $stmt->execute([$cpu, $gpu, $ram, $ssd, $placa_mae, $cooler, $total, $id, $_SESSION['cliente_id']]);

    header("Location: dashboard.php");
    exit;
}
?>
