<?php
require_once 'includes/config.php';

$pecas = [
    ['tipo' => 'CPU', 'nome' => 'Intel Core i5-12400F', 'preco' => 189.99, 'estoque' => 15, 'categoria' => 'Intel', 'descricao' => 'Processador de 6 núcleos para gaming e produtividade'],
    ['tipo' => 'CPU', 'nome' => 'AMD Ryzen 5 5600X', 'preco' => 199.99, 'estoque' => 12, 'categoria' => 'AMD', 'descricao' => 'Processador de 6 núcleos com excelente performance'],
    ['tipo' => 'GPU', 'nome' => 'NVIDIA RTX 4060', 'preco' => 349.99, 'estoque' => 8, 'categoria' => 'NVIDIA', 'descricao' => 'Placa gráfica para gaming 1080p e 1440p'],
    ['tipo' => 'GPU', 'nome' => 'AMD Radeon RX 6600', 'preco' => 299.99, 'estoque' => 10, 'categoria' => 'AMD', 'descricao' => 'Excelente custo-benefício para gaming'],
    ['tipo' => 'RAM', 'nome' => 'Corsair Vengeance 16GB DDR4-3200', 'preco' => 79.99, 'estoque' => 25, 'categoria' => 'DDR4', 'descricao' => 'Kit de 2x8GB para ótimo desempenho'],
    ['tipo' => 'RAM', 'nome' => 'Kingston Fury 32GB DDR4-3600', 'preco' => 149.99, 'estoque' => 18, 'categoria' => 'DDR4', 'descricao' => 'Kit de 2x16GB para workstations'],
    ['tipo' => 'SSD', 'nome' => 'Samsung 970 EVO 500GB NVMe', 'preco' => 89.99, 'estoque' => 20, 'categoria' => 'NVMe', 'descricao' => 'SSD ultrarrápido para sistema operacional'],
    ['tipo' => 'SSD', 'nome' => 'WD Blue SN570 1TB NVMe', 'preco' => 119.99, 'estoque' => 15, 'categoria' => 'NVMe', 'descricao' => 'Excelente para armazenamento de jogos'],
    ['tipo' => 'Placa Mãe', 'nome' => 'ASUS Prime B660M-A', 'preco' => 129.99, 'estoque' => 12, 'categoria' => 'Intel', 'descricao' => 'Placa mãe para processadores Intel de 12ª geração'],
    ['tipo' => 'Placa Mãe', 'nome' => 'MSI B450 Tomahawk MAX', 'preco' => 109.99, 'estoque' => 14, 'categoria' => 'AMD', 'descricao' => 'Placa mãe robusta para Ryzen'],
    ['tipo' => 'Cooler', 'nome' => 'Cooler Master Hyper 212 EVO', 'preco' => 39.99, 'estoque' => 30, 'categoria' => 'Air', 'descricao' => 'Cooler a ar eficiente e silencioso'],
    ['tipo' => 'Cooler', 'nome' => 'NZXT Kraken X63', 'preco' => 149.99, 'estoque' => 8, 'categoria' => 'AIO', 'descricao' => 'Sistema de refrigeração líquida premium']
];

try {
    $stmt = $pdo->prepare('INSERT INTO pecas (tipo, nome, preco, estoque, categoria, descricao) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE preco = VALUES(preco), estoque = VALUES(estoque)');

    foreach ($pecas as $peca) {
        $stmt->execute([$peca['tipo'], $peca['nome'], $peca['preco'], $peca['estoque'], $peca['categoria'], $peca['descricao']]);
    }

    echo 'Peças de exemplo inseridas com sucesso!';
} catch (PDOException $e) {
    echo 'Erro: ' . $e->getMessage();
}
?>
