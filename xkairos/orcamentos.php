<?php
session_start();
include "includes/config.php";

// Verificar se cliente está logado
$is_logged_in = isset($_SESSION['cliente_id']);

if ($is_logged_in) {
    $stmt = $pdo->prepare("SELECT nome, email FROM clientes WHERE id = ?");
    $stmt->execute([$_SESSION['cliente_id']]);
    $cliente_data = $stmt->fetch();
    $cliente_nome = $cliente_data['nome'] ?? '';
    $cliente_email = $cliente_data['email'] ?? '';
} else {
    $cliente_nome = '';
    $cliente_email = '';
}

// Processar formulário de orçamento
$message = '';
$message_type = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar se usuário está logado
    if (!$is_logged_in) {
        $message = 'Você precisa estar logado para solicitar orçamento. <a href="cliente/login.php">Fazer login</a> ou <a href="cliente/register.php">Registrar</a>';
        $message_type = 'error';
    } else {
        try {
            // Dados comuns
            $tipo_servico = $_POST['tipo_servico'] ?? 'montagem';
            $nome = trim($_POST['nome'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $telefone = trim($_POST['telefone'] ?? '');
            $localidade = trim($_POST['localidade'] ?? '');
            $urgencia = $_POST['urgencia'] ?? '';
            $observacoes = trim($_POST['observacoes'] ?? '');

        // Verificar se cliente já existe
        $stmt = $pdo->prepare("SELECT id FROM clientes WHERE email = ?");
        $stmt->execute([$email]);
        $cliente = $stmt->fetch();

        if (!$cliente) {
            // Criar novo cliente
            $stmt = $pdo->prepare("INSERT INTO clientes (nome, email, data_cadastro) VALUES (?, ?, NOW())");
            $stmt->execute([$nome, $email]);
            $cliente_id = $pdo->lastInsertId();
        } else {
            $cliente_id = $cliente['id'];
        }

        // Preparar dados específicos do serviço
        $total = 0;
        $cpu = $gpu = $ram = $ssd = $placa_mae = $cooler = $mouse = $keyboard = $speakers = $webcam = $monitors = $power_supply = $case = null;
        $cpu_preco = $gpu_preco = $ram_preco = $ssd_preco = $placa_mae_preco = $cooler_preco = $mouse_preco = $keyboard_preco = $speakers_preco = $webcam_preco = $monitors_preco = $power_supply_preco = $case_preco = 0;

        // Campos específicos por tipo de serviço
        $uso_pc = $orcamento_max = $pecas_existentes = $tipo_manutencao = $problema = $tipo_consultoria = $duvida = null;

        if ($tipo_servico === 'montagem') {
            $uso_pc = $_POST['uso_pc'] ?? '';
            $orcamento_max = floatval($_POST['orcamento_max'] ?? 0);
            $pecas_existentes = trim($_POST['pecas_existentes'] ?? '');

            // Calcular total baseado nos componentes selecionados
            if (isset($_POST['cpu'])) {
                $cpu = $_POST['cpu'];
                $cpu_preco = floatval($_POST['cpu_preco'] ?? 0);
                $total += $cpu_preco;
            }
            if (isset($_POST['gpu'])) {
                $gpu = $_POST['gpu'];
                $gpu_preco = floatval($_POST['gpu_preco'] ?? 0);
                $total += $gpu_preco;
            }
            if (isset($_POST['ram'])) {
                $ram = $_POST['ram'];
                $ram_preco = floatval($_POST['ram_preco'] ?? 0);
                $total += $ram_preco;
            }
            if (isset($_POST['ssd'])) {
                $ssd = $_POST['ssd'];
                $ssd_preco = floatval($_POST['ssd_preco'] ?? 0);
                $total += $ssd_preco;
            }
            if (isset($_POST['placa_mae'])) {
                $placa_mae = $_POST['placa_mae'];
                $placa_mae_preco = floatval($_POST['placa_mae_preco'] ?? 0);
                $total += $placa_mae_preco;
            }
            if (isset($_POST['cooler'])) {
                $cooler = $_POST['cooler'];
                $cooler_preco = floatval($_POST['cooler_preco'] ?? 0);
                $total += $cooler_preco;
            }
            if (isset($_POST['mouse'])) {
                $mouse = $_POST['mouse'];
                $mouse_preco = floatval($_POST['mouse_preco'] ?? 0);
                $total += $mouse_preco;
            }
            if (isset($_POST['keyboard'])) {
                $keyboard = $_POST['keyboard'];
                $keyboard_preco = floatval($_POST['keyboard_preco'] ?? 0);
                $total += $keyboard_preco;
            }
            if (isset($_POST['speakers'])) {
                $speakers = $_POST['speakers'];
                $speakers_preco = floatval($_POST['speakers_preco'] ?? 0);
                $total += $speakers_preco;
            }
            if (isset($_POST['webcam'])) {
                $webcam = $_POST['webcam'];
                $webcam_preco = floatval($_POST['webcam_preco'] ?? 0);
                $total += $webcam_preco;
            }
            if (isset($_POST['monitors'])) {
                $monitors = $_POST['monitors'];
                $monitors_preco = floatval($_POST['monitors_preco'] ?? 0);
                $total += $monitors_preco;
            }
            if (isset($_POST['power_supply'])) {
                $power_supply = $_POST['power_supply'];
                $power_supply_preco = floatval($_POST['power_supply_preco'] ?? 0);
                $total += $power_supply_preco;
            }
            if (isset($_POST['case'])) {
                $case = $_POST['case'];
                $case_preco = floatval($_POST['case_preco'] ?? 0);
                $total += $case_preco;
            }

        } elseif ($tipo_servico === 'manutencao') {
            $tipo_manutencao = $_POST['tipo_manutencao'] ?? '';
            $problema = trim($_POST['problema'] ?? '');
            // Valor estimado para manutenção
            $total = 50.00;

        } elseif ($tipo_servico === 'consultoria') {
            $tipo_consultoria = $_POST['tipo_consultoria'] ?? '';
            $duvida = trim($_POST['duvida'] ?? '');
            // Valor estimado para consultoria
            $total = 30.00;
        }

        // Inserir solicitação
        $stmt = $pdo->prepare("INSERT INTO solicitacoes (
            cliente_id, cliente_nome, cliente_email, tipo_servico, telefone, localidade,
            urgencia, observacoes, uso_pc, orcamento_max, pecas_existentes,
            tipo_manutencao, problema, tipo_consultoria, duvida,
            cpu, gpu, ram, ssd, placa_mae, cooler, mouse, keyboard, speakers, webcam, monitors, power_supply, case,
            cpu_preco, gpu_preco, ram_preco, ssd_preco, placa_mae_preco, cooler_preco, mouse_preco, keyboard_preco, speakers_preco, webcam_preco, monitors_preco, power_supply_preco, case_preco,
            total, data_solicitacao
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
        )");

        $stmt->execute([
            $cliente_id, $nome, $email, $tipo_servico, $telefone, $localidade,
            $urgencia, $observacoes, $uso_pc, $orcamento_max, $pecas_existentes,
            $tipo_manutencao, $problema, $tipo_consultoria, $duvida,
            $cpu, $gpu, $ram, $ssd, $placa_mae, $cooler, $mouse, $keyboard, $speakers, $webcam, $monitors, $power_supply, $case,
            $cpu_preco, $gpu_preco, $ram_preco, $ssd_preco, $placa_mae_preco, $cooler_preco, $mouse_preco, $keyboard_preco, $speakers_preco, $webcam_preco, $monitors_preco, $power_supply_preco, $case_preco,
            $total
        ]);

        $message = 'Orçamento solicitado com sucesso! Entraremos em contato em até 24 horas.';
        $message_type = 'success';

    } catch (PDOException $e) {
        $message = 'Erro ao processar solicitação: ' . $e->getMessage();
        $message_type = 'error';
    }
}
}
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - Solicite Seu Orçamento</title>
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/home.css">
<link rel="stylesheet" href="assets/css/servicos.css">
<link rel="stylesheet" href="assets/css/projetos.css">
<link rel="stylesheet" href="assets/css/admin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header>
        <nav class="top-nav">
            <div class="nav-left">
                <div class="logo">
                    <img src="imagens/Imagem do WhatsApp de 2025-10-21 à(s) 09.56.28_5c6d7850.jpg" alt="Xkairos Tech Logo" style="height: 40px; width: 40px; border-radius: 50%; object-fit: cover;">
                    <h1>Xkairos Tech</h1>
                </div>
            </div>
            <div class="nav-right">
                <div class="menu-toggle" id="menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <ul class="nav-menu nav-menu-3d" id="nav-menu">
                    <li><a href="index.php">Inicio</a></li>
                    <li><a href="http://localhost/xkairos/index.php#contato">Contato</a></li>
                </ul>
            </div>
        </nav>
    </header>

<?php
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'montagem';
?>

<!-- HERO ORÇAMENTOS -->
<div class="hero-section">
    <div class="hero-content">
        <div class="hero-badge">
            <i class="fas fa-star"></i>
            <span>Atendimento Premium</span>
        </div>
        <h1><i class="fas fa-calculator"></i> Solicite Seu Orçamento Gratuito</h1>
        <p>Transforme sua ideia em realidade com nossos serviços especializados em tecnologia. Preencha o formulário abaixo e receba uma proposta personalizada em até 24 horas.</p>
        <div class="hero-stats">
            <div class="stat">
                <span class="stat-number">500+</span>
                <span class="stat-label">PCs Montados</span>
            </div>
            <div class="stat">
                <span class="stat-number">98%</span>
                <span class="stat-label">Satisfação</span>
            </div>
            <div class="stat">
                <span class="stat-number">24h</span>
                <span class="stat-label">Resposta</span>
            </div>
        </div>
        <a href="#budget-form" class="hero-cta">
            <i class="fas fa-arrow-down"></i>
            Começar Agora
        </a>
    </div>
    <div class="hero-visual">
        <div class="floating-elements">
            <div class="floating-icon icon-1"><i class="fas fa-cogs"></i></div>
            <div class="floating-icon icon-2"><i class="fas fa-microchip"></i></div>
            <div class="floating-icon icon-3"><i class="fas fa-memory"></i></div>
            <div class="floating-icon icon-4"><i class="fas fa-hdd"></i></div>
        </div>
    </div>
</div>

<!-- FORMULÁRIO DE ORÇAMENTO -->
<section class="budget-form-section">
    <div class="container">
        <div class="budget-form-wrapper">
            <!-- Seleção de Tipo -->
            <div class="service-type-selector">
                <h3>Selecione o Tipo de Serviço</h3>
                <div class="service-types">
                    <button class="service-type-btn <?php echo $tipo == 'montagem' ? 'active' : ''; ?>" data-type="montagem">
                        <i class="fas fa-cogs"></i>
                        <span>Montagem de PC</span>
                    </button>
                    <button class="service-type-btn <?php echo $tipo == 'manutencao' ? 'active' : ''; ?>" data-type="manutencao">
                        <i class="fas fa-tools"></i>
                        <span>Manutenção</span>
                    </button>
                    <button class="service-type-btn <?php echo $tipo == 'consultoria' ? 'active' : ''; ?>" data-type="consultoria">
                        <i class="fas fa-lightbulb"></i>
                        <span>Consultoria</span>
                    </button>
                </div>
            </div>

            <!-- COMPONENTES PARA MONTAGEM (se for montagem) -->
            <section class="components-section" id="components-section" style="display: <?php echo $tipo == 'montagem' ? 'block' : 'none'; ?>; padding: 40px 0;">
                <div class="container">
                    <div class="components-header">
                        <div class="components-badge">
                            <i class="fas fa-cogs"></i>
                            <span>Configurador Inteligente</span>
                        </div>
                        <h2>Componentes Sugeridos</h2>
                        <p>Baseado no seu uso, sugerimos estes componentes de alta performance. Personalize conforme sua preferência e veja o orçamento em tempo real.</p>
                        <div class="components-features">
                            <div class="feature">
                                <i class="fas fa-check-circle"></i>
                                <span>Compatibilidade Garantida</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-shield-alt"></i>
                                <span>Garantia Estendida</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-truck"></i>
                                <span>Entrega Expressa</span>
                            </div>
                        </div>
                    </div>

                    <div class="components-grid">
                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-microchip"></i>
                            </div>
                            <h4>Processador CPU</h4>
                            <p>Potência de processamento para suas tarefas</p>
                            <select class="component-select" data-component="cpu" name="cpu">
                                <option value="">Selecione o Processador</option>
                                <option value="Intel i5-12400F" data-price="250">Intel i5-12400F - €250</option>
                                <option value="Intel i7-12700K" data-price="350">Intel i7-12700K - €350</option>
                                <option value="AMD Ryzen 5 5600" data-price="200">AMD Ryzen 5 5600 - €200</option>
                                <option value="AMD Ryzen 7 5700X" data-price="400" selected="selected">AMD Ryzen 7 5700X - €400</option>
                            </select>
                            <input type="hidden" name="cpu_preco" id="cpu_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-video"></i>
                            </div>
                            <h4>Placa de Vídeo GPU</h4>
                            <p>Performance gráfica excepcional</p>
                            <select class="component-select" data-component="gpu" name="gpu">
                                <option value="">Selecione a GPU</option>
                                <option value="RTX 3060" data-price="400">RTX 3060 - €400</option>
                                <option value="RTX 4070" data-price="600">RTX 4070 - €600</option>
                                <option value="RX 6600" data-price="300">RX 6600 - €300</option>
                                <option value="RTX 4070 Ti" data-price="800" selected="selected">RTX 4070 Ti - €800</option>
                            </select>
                            <input type="hidden" name="gpu_preco" id="gpu_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-memory"></i>
                            </div>
                            <h4>Memória RAM</h4>
                            <p>Multitarefa fluida e rápida</p>
                            <select class="component-select" data-component="ram" name="ram">
                                <option value="">Selecione a RAM</option>
                                <option value="16GB DDR4 3200MHz" data-price="80">16GB DDR4 3200MHz - €80</option>
                                <option value="32GB DDR4 3200MHz" data-price="120">32GB DDR4 3200MHz - €120</option>
                                <option value="32GB DDR5 5600MHz" data-price="150" selected="selected">32GB DDR5 5600MHz - €150</option>
                            </select>
                            <input type="hidden" name="ram_preco" id="ram_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-hdd"></i>
                            </div>
                            <h4>Armazenamento SSD</h4>
                            <p>Velocidade e capacidade para seus dados</p>
                            <select class="component-select" data-component="ssd" name="ssd">
                                <option value="">Selecione o SSD</option>
                                <option value="500GB NVMe" data-price="70">500GB NVMe - €70</option>
                                <option value="1TB NVMe" data-price="100">1TB NVMe - €100</option>
                                <option value="2TB NVMe" data-price="150" selected="selected">2TB NVMe - €150</option>
                            </select>
                            <input type="hidden" name="ssd_preco" id="ssd_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-microchip"></i>
                            </div>
                            <h4>Placa-Mãe</h4>
                            <p>Base para conectar todos os componentes</p>
                            <select class="component-select" data-component="placa_mae" name="placa_mae">
                                <option value="">Selecione a Placa-Mãe</option>
                                <option value="B450M" data-price="80">ASRock B450M - €80</option>
                                <option value="B550M" data-price="100">MSI B550M - €100</option>
                                <option value="Z690" data-price="150" selected="selected">ASUS Z690 - €150</option>
                            </select>
                            <input type="hidden" name="placa_mae_preco" id="placa_mae_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-fan"></i>
                            </div>
                            <h4>Cooler</h4>
                            <p>Refrigeração eficiente para o processador</p>
                            <select class="component-select" data-component="cooler" name="cooler">
                                <option value="">Selecione o Cooler</option>
                                <option value="Cooler Stock" data-price="0">Cooler Stock - €0</option>
                                <option value="Cooler 120mm" data-price="30">Cooler 120mm - €30</option>
                                <option value="AIO 240mm" data-price="80" selected="selected">AIO 240mm - €80</option>
                            </select>
                            <input type="hidden" name="cooler_preco" id="cooler_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-mouse"></i>
                            </div>
                            <h4>Mouse</h4>
                            <p>Precisão e conforto para suas tarefas</p>
                            <select class="component-select" data-component="mouse" name="mouse">
                                <option value="">Selecione o Mouse</option>
                                <option value="Mouse Óptico Básico" data-price="15">Mouse Óptico Básico - €15</option>
                                <option value="Mouse Gamer RGB" data-price="40" selected="selected">Mouse Gamer RGB - €40</option>
                                <option value="Mouse Wireless" data-price="25">Mouse Wireless - €25</option>
                            </select>
                            <input type="hidden" name="mouse_preco" id="mouse_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-keyboard"></i>
                            </div>
                            <h4>Teclado</h4>
                            <p>Digitação confortável e responsiva</p>
                            <select class="component-select" data-component="keyboard" name="keyboard">
                                <option value="">Selecione o Teclado</option>
                                <option value="Teclado Membrana" data-price="20">Teclado Membrana - €20</option>
                                <option value="Teclado Mecânico RGB" data-price="60" selected="selected">Teclado Mecânico RGB - €60</option>
                                <option value="Teclado Wireless" data-price="35">Teclado Wireless - €35</option>
                            </select>
                            <input type="hidden" name="keyboard_preco" id="keyboard_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-volume-up"></i>
                            </div>
                            <h4>Caixas de Som</h4>
                            <p>Áudio de qualidade para entretenimento</p>
                            <select class="component-select" data-component="speakers" name="speakers">
                                <option value="">Selecione as Caixas</option>
                                <option value="Caixas 2.0 Básicas" data-price="25">Caixas 2.0 Básicas - €25</option>
                                <option value="Caixas 2.1 com Subwoofer" data-price="50" selected="selected">Caixas 2.1 com Subwoofer - €50</option>
                                <option value="Soundbar" data-price="40">Soundbar - €40</option>
                            </select>
                            <input type="hidden" name="speakers_preco" id="speakers_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-video"></i>
                            </div>
                            <h4>Webcam</h4>
                            <p>Para videochamadas e streaming</p>
                            <select class="component-select" data-component="webcam" name="webcam">
                                <option value="">Selecione a Webcam</option>
                                <option value="Webcam 720p" data-price="20">Webcam 720p - €20</option>
                                <option value="Webcam 1080p" data-price="35">Webcam 1080p - €35</option>
                                <option value="Webcam 4K" data-price="60" selected="selected">Webcam 4K - €60</option>
                            </select>
                            <input type="hidden" name="webcam_preco" id="webcam_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-desktop"></i>
                            </div>
                            <h4>Monitor</h4>
                            <p>Display de alta qualidade</p>
                            <select class="component-select" data-component="monitors" name="monitors">
                                <option value="">Selecione o Monitor</option>
                                <option value="Monitor 24\" 1080p" data-price="120">Monitor 24" 1080p - €120</option>
                                <option value="Monitor 27\" 1440p" data-price="200">Monitor 27" 1440p - €200</option>
                                <option value="Monitor 32\" 4K" data-price="300" selected="selected">Monitor 32" 4K - €300</option>
                            </select>
                            <input type="hidden" name="monitors_preco" id="monitors_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-plug"></i>
                            </div>
                            <h4>Fonte de Alimentação</h4>
                            <p>Energia estável para todos os componentes</p>
                            <select class="component-select" data-component="power_supply" name="power_supply">
                                <option value="">Selecione a Fonte</option>
                                <option value="Fonte 500W 80+ Bronze" data-price="50">Fonte 500W 80+ Bronze - €50</option>
                                <option value="Fonte 650W 80+ Gold" data-price="80">Fonte 650W 80+ Gold - €80</option>
                                <option value="Fonte 750W 80+ Platinum" data-price="120" selected="selected">Fonte 750W 80+ Platinum - €120</option>
                            </select>
                            <input type="hidden" name="power_supply_preco" id="power_supply_preco_hidden">
                        </div>

                        <div class="component-card">
                            <div class="component-icon">
                                <i class="fas fa-archive"></i>
                            </div>
                            <h4>Gabinete</h4>
                            <p>Proteção e organização dos componentes</p>
                            <select class="component-select" data-component="case" name="case">
                                <option value="">Selecione o Gabinete</option>
                                <option value="Gabinete Básico" data-price="40">Gabinete Básico - €40</option>
                                <option value="Gabinete Mid Tower" data-price="60">Gabinete Mid Tower - €60</option>
                                <option value="Gabinete Full Tower" data-price="100" selected="selected">Gabinete Full Tower - €100</option>
                            </select>
                            <input type="hidden" name="case_preco" id="case_preco_hidden">
                        </div>
                    </div>

                    <div class="total-calculator">
                        <div class="calculator-header">
                            <i class="fas fa-calculator"></i>
                            <h3>Orçamento em Tempo Real</h3>
                        </div>
                        <div class="total-display">
                            <div class="total-amount">
                                <span class="currency">€</span>
                                <span id="total-estimate" class="amount">0</span>
                            </div>
                            <div class="total-label">Total Estimado</div>
                        </div>
                        <div class="calculator-features">
                            <div class="calc-feature">
                                <i class="fas fa-clock"></i>
                                <span>Montagem incluída</span>
                            </div>
                            <div class="calc-feature">
                                <i class="fas fa-tools"></i>
                                <span>Teste de qualidade</span>
                            </div>
                            <div class="calc-feature">
                                <i class="fas fa-headset"></i>
                                <span>Suporte técnico</span>
                            </div>
                        </div>
                        <p class="disclaimer">* Este é um valor estimativo. O preço final pode variar conforme disponibilidade e mão de obra. Inclui montagem profissional e garantia.</p>
                    </div>
                </div>
            </section>

            <!-- Mensagem de feedback -->
            <?php if (!empty($message)): ?>
            <div class="message <?php echo $message_type; ?>" style="margin-bottom: 30px; padding: 15px; border-radius: 8px; text-align: center; font-weight: 500;">
                <?php echo htmlspecialchars($message); ?>
            </div>
            <?php endif; ?>

            <!-- Formulário -->
            <form class="budget-form" id="budget-form" method="POST">
                <input type="hidden" name="tipo_servico" id="tipo_servico" value="<?php echo $tipo; ?>">

                <!-- Dados Pessoais -->
                <div class="form-section">
                    <h4><i class="fas fa-user"></i> Dados Pessoais</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="nome">Nome Completo *</label>
                            <input type="text" id="nome" name="nome" value="<?php echo htmlspecialchars($cliente_nome); ?>" required>
                        </div>
                        <div class="form-group">
                            <label for="email">E-mail *</label>
                            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($cliente_email); ?>" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="telefone">Telefone *</label>
                            <input type="tel" id="telefone" name="telefone" required>
                        </div>
                        <div class="form-group">
                            <label for="localidade">Localidade</label>
                            <input type="text" id="localidade" name="localidade">
                        </div>
                    </div>
                </div>

                <!-- Detalhes do Serviço -->
                <div class="form-section" id="service-details">
                    <!-- Montagem de PC -->
                    <div class="service-detail" id="montagem-detail" style="display: <?php echo $tipo == 'montagem' ? 'block' : 'none'; ?>">
                        <h4><i class="fas fa-cogs"></i> Detalhes da Montagem</h4>
                        <div class="form-group">
                            <label for="uso_pc">Uso Principal do PC *</label>
                            <select id="uso_pc" name="uso_pc" required>
                                <option value="">Selecione</option>
                                <option value="gaming">Gaming</option>
                                <option value="trabalho">Trabalho/Design</option>
                                <option value="streaming">Streaming</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="orcamento_max">Orçamento Máximo (€)</label>
                            <input type="number" id="orcamento_max" name="orcamento_max" placeholder="Ex: 1500">
                        </div>
                        <div class="form-group">
                            <label for="pecas_existentes">Já possui alguma peça?</label>
                            <textarea id="pecas_existentes" name="pecas_existentes" placeholder="Liste as peças que já possui (CPU, GPU, RAM, etc.)"></textarea>
                        </div>
                    </div>

                    <!-- Manutenção -->
                    <div class="service-detail" id="manutencao-detail" style="display: <?php echo $tipo == 'manutencao' ? 'none' : 'none'; ?>">
                        <h4><i class="fas fa-tools"></i> Detalhes da Manutenção</h4>
                        <div class="form-group">
                            <label for="tipo_manutencao">Tipo de Manutenção *</label>
                            <select id="tipo_manutencao" name="tipo_manutencao" required>
                                <option value="">Selecione</option>
                                <option value="limpeza">Limpeza Geral</option>
                                <option value="upgrade">Upgrade de Componentes</option>
                                <option value="reparo">Reparo de Defeito</option>
                                <option value="diagnostico">Diagnóstico</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="problema">Descreva o problema ou necessidade</label>
                            <textarea id="problema" name="problema" placeholder="Descreva detalhadamente o problema ou o que precisa ser feito"></textarea>
                        </div>
                    </div>

                    <!-- Consultoria -->
                    <div class="service-detail" id="consultoria-detail" style="display: <?php echo $tipo == 'consultoria' ? 'none' : 'none'; ?>">
                        <h4><i class="fas fa-lightbulb"></i> Detalhes da Consultoria</h4>
                        <div class="form-group">
                            <label for="tipo_consultoria">Tipo de Consultoria *</label>
                            <select id="tipo_consultoria" name="tipo_consultoria" required>
                                <option value="">Selecione</option>
                                <option value="compra">Orientação para Compra</option>
                                <option value="compatibilidade">Verificação de Compatibilidade</option>
                                <option value="otimizacao">Otimização de Performance</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="duvida">Sua dúvida ou necessidade</label>
                            <textarea id="duvida" name="duvida" placeholder="Descreva sua dúvida ou o que precisa de orientação"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Preferências -->
                <div class="form-section">
                    <h4><i class="fas fa-clock"></i> Preferências</h4>
                    <div class="form-group">
                        <label for="urgencia">Urgência *</label>
                        <select id="urgencia" name="urgencia" required>
                            <option value="">Selecione</option>
                            <option value="baixa">Baixa (até 1 semana)</option>
                            <option value="media">Média (até 3 dias)</option>
                            <option value="alta">Alta (até 24h)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="observacoes">Observações Adicionais</label>
                        <textarea id="observacoes" name="observacoes" placeholder="Alguma informação adicional que considere importante"></textarea>
                    </div>
                </div>

                <!-- Submit -->
                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-paper-plane"></i> Solicitar Orçamento
                    </button>
                </div>
            </form>
        </div>
    </div>
</section>

<script>
// Menu hambúrguer interativo com hover
const navRight = document.querySelector('.nav-right');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

// Abre menu ao passar o mouse sobre nav-right
navRight.addEventListener('mouseenter', function() {
    menuToggle.classList.add('active');
    navMenu.classList.add('active');
});

// Fecha menu quando o mouse sai de nav-right
navRight.addEventListener('mouseleave', function() {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
});

// Fecha menu ao clicar em um link
document.querySelectorAll('.nav-menu-3d a').forEach(link => {
    link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});
</script>

<script>
// Troca de tipo de serviço
document.querySelectorAll('.service-type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const type = this.dataset.type;

        // Atualiza botões
        document.querySelectorAll('.service-type-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Atualiza campo hidden
        document.getElementById('tipo_servico').value = type;

        // Mostra/esconde seções
        document.querySelectorAll('.service-detail').forEach(detail => detail.style.display = 'none');
        document.getElementById(type + '-detail').style.display = 'block';

        // Mostra componentes se for montagem
        document.getElementById('components-section').style.display = type === 'montagem' ? 'block' : 'none';

        // Atualiza required fields
        updateRequiredFields(type);
    });
});

function updateRequiredFields(type) {
    // Remove required de todos
    document.querySelectorAll('select[required], textarea[required]').forEach(el => {
        el.required = false;
    });

    // Adiciona required conforme tipo
    if (type === 'montagem') {
        document.getElementById('uso_pc').required = true;
    } else if (type === 'manutencao') {
        document.getElementById('tipo_manutencao').required = true;
    } else if (type === 'consultoria') {
        document.getElementById('tipo_consultoria').required = true;
    }
}

// Calculadora de componentes
document.querySelectorAll('.component-select').forEach(select => {
    select.addEventListener('change', updateTotal);
});

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.component-select').forEach(select => {
        const selectedOption = select.options[select.selectedIndex];
        const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
        const component = select.getAttribute('data-component');
        const hiddenInput = document.getElementById(component + '_preco_hidden');
        if (hiddenInput) {
            hiddenInput.value = price;
        }
        total += price;
    });
    document.getElementById('total-estimate').textContent = total;
}

// Submit do formulário - removido para permitir processamento PHP
</script>

<style>
.top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background: rgba(10, 15, 28, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.nav-left {
    display: flex;
    align-items: center;
}

.nav-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.nav-right {
    display: flex;
    align-items: center;
}

.home-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #00F0FF;
    color: #0A0F1C;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.home-button:hover {
    background: #007bff;
    transform: translateY(-2px);
}

.home-button i {
    font-size: 1rem;
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.logo h1 {
    color: #00F0FF;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.nav-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 30px;
}

.nav-menu li a {
    color: #E0E0E0;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 8px 16px;
    border-radius: 6px;
}

.nav-menu li a:hover {
    color: #00F0FF;
    background: rgba(0, 240, 255, 0.1);
}

.hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0A0F1C 0%, #1F1F1F 100%);
    overflow: hidden;
    margin-bottom: 40px;
}

.hero-content {
    text-align: center;
    z-index: 2;
    max-width: 800px;
    padding: 40px 20px;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 25px;
    padding: 8px 16px;
    margin-bottom: 20px;
    color: #00F0FF;
    font-size: 0.9rem;
    font-weight: 500;
}

.hero-content h1 {
    color: #00F0FF;
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    text-shadow: 0 0 30px rgba(0, 240, 255, 0.3);
}

.hero-content p {
    color: #E0E0E0;
    font-size: 1.3rem;
    max-width: 600px;
    margin: 0 auto 40px;
    line-height: 1.6;
    font-weight: 300;
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 40px;
    flex-wrap: wrap;
}

.stat {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    color: #00F0FF;
    text-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}

.stat-label {
    color: #B0B0B0;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(45deg, #00F0FF, #007bff);
    color: white;
    padding: 16px 32px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(0, 240, 255, 0.3);
}

.hero-cta:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(0, 240, 255, 0.4);
}

.hero-visual {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.floating-elements {
    position: relative;
    width: 100%;
    height: 100%;
}

.floating-icon {
    position: absolute;
    color: rgba(0, 240, 255, 0.1);
    font-size: 4rem;
    animation: float 6s ease-in-out infinite;
}

.icon-1 {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
}

.icon-2 {
    top: 60%;
    right: 15%;
    animation-delay: 2s;
}

.icon-3 {
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
}

.icon-4 {
    top: 30%;
    right: 10%;
    animation-delay: 1s;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0px) rotate(0deg);
    }
    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

@media (max-width: 768px) {
    .hero-content h1 {
        font-size: 2.5rem;
    }

    .hero-stats {
        gap: 20px;
    }

    .stat-number {
        font-size: 2rem;
    }

    .floating-icon {
        font-size: 2.5rem;
    }
}

.budget-form-section {
    padding: 60px 0;
    background: linear-gradient(135deg, #0A0F1C 0%, #1F1F1F 100%);
}

.budget-form-wrapper {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 40px;
    backdrop-filter: blur(10px);
}

.service-type-selector {
    margin-bottom: 60px;
}

.service-type-selector h3 {
    margin-bottom: 30px;
    color: #00F0FF;
    font-size: 1.5rem;
    text-align: center;
}

.service-types {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.service-type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
}

.service-type-btn:hover,
.service-type-btn.active {
    border-color: #00F0FF;
    background: rgba(0, 240, 255, 0.1);
    transform: translateY(-5px);
}

.service-type-btn i {
    font-size: 2rem;
    margin-bottom: 10px;
    color: #00F0FF;
}

.form-section {
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.form-section h4 {
    color: #00F0FF;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    flex: 1;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #E0E0E0;
    font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    color: #E0E0E0;
    font-size: 14px;
}

.form-group select option {
    background: #1F1F1F;
    color: #E0E0E0;
    padding: 8px;
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

.btn-primary {
    background: linear-gradient(45deg, #00F0FF, #007bff);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 auto;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 240, 255, 0.3);
}

.components-section {
    padding: 80px 0;
    background: linear-gradient(135deg, #0A0F1C 0%, #1F1F1F 100%);
}

.components-header {
    text-align: center;
    margin-bottom: 60px;
}

.components-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 25px;
    padding: 8px 16px;
    margin-bottom: 20px;
    color: #00F0FF;
    font-size: 0.9rem;
    font-weight: 500;
}

.components-header h2 {
    color: #00F0FF;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    text-shadow: 0 0 30px rgba(0, 240, 255, 0.3);
}

.components-header > p {
    color: #E0E0E0;
    font-size: 1.2rem;
    max-width: 700px;
    margin: 0 auto 30px;
    line-height: 1.6;
    font-weight: 300;
}

.components-features {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
}

.feature {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #B0B0B0;
    font-size: 0.95rem;
    font-weight: 500;
}

.feature i {
    color: #00F0FF;
    font-size: 1.1rem;
}

.components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    margin-bottom: 60px;
}

.component-card {
    background: rgba(255, 255, 255, 0.08);
    padding: 30px 25px;
    border-radius: 15px;
    text-align: center;
    border: 1px solid rgba(0, 240, 255, 0.1);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.component-card:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 240, 255, 0.3);
    box-shadow: 0 10px 30px rgba(0, 240, 255, 0.1);
}

.component-icon {
    font-size: 3rem;
    color: #00F0FF;
    margin-bottom: 15px;
}

.component-card h4 {
    color: #00F0FF;
    margin-bottom: 10px;
    font-size: 1.3rem;
    font-weight: 600;
}

.component-card p {
    color: #B0B0B0;
    font-size: 0.95rem;
    margin-bottom: 20px;
    line-height: 1.5;
}

.component-select {
    width: 100%;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #E0E0E0;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.component-select:focus {
    outline: none;
    border-color: #00F0FF;
    background: rgba(0, 240, 255, 0.05);
}

.component-select option {
    background: #1F1F1F;
    color: #E0E0E0;
    padding: 10px;
}

.total-calculator {
    text-align: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 15px;
    border: 1px solid rgba(0, 240, 255, 0.1);
    backdrop-filter: blur(10px);
    max-width: 500px;
    margin: 0 auto;
}

.total-calculator h4 {
    font-size: 2.5rem;
    color: #00F0FF;
    margin-bottom: 15px;
    font-weight: 700;
    text-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}

.disclaimer {
    color: #B0B0B0;
    font-size: 0.95rem;
    margin-top: 15px;
    font-style: italic;
    line-height: 1.5;
}

@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .service-types {
        flex-direction: column;
        align-items: center;
    }

    .budget-form-wrapper {
        padding: 20px;
    }
}
</style>

<?php
include "includes/footer.php";
?>