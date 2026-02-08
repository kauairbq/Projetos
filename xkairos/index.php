<?php
include "includes/config.php";
session_start();
$is_logged_in = isset($_SESSION['cliente_id']);
$cliente_nome = $is_logged_in ? $_SESSION['cliente_nome'] : '';
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xkairos Tech - Montagem e Manutenção de PCs</title>
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
                <ul class="nav-menu">
                    <li><a href="orcamentos.php">Orçamento</a></li>
                    <li><a href="#contato">Contato</a></li>
                    <?php if ($is_logged_in): ?>
                        <li><a href="cliente/dashboard.php"><i class="fas fa-user"></i> Área do Cliente</a></li>
                    <?php else: ?>
                        <li><a href="cliente/login.php"><i class="fas fa-user"></i> Login</a></li>
                    <?php endif; ?>
                </ul>
            </div>
        </nav>
    </header>

<!-- HERO PRINCIPAL -->
<div class="hero-section">
    <div class="hero-content">
        <div class="hero-badge">
            <i class="fas fa-star"></i>
            <span>Atendimento Premium</span>
        </div>
        <h2><i class="fas fa-rocket"></i> Bem-vindo à Xkairos Tech</h2>
        <p>Consultoria e montagem de PCs gamers com performance, inovação e engenharia de precisão.</p>
        <div class="hero-stats">
            <div class="stat">
                <i class="fas fa-users"></i>
                <span>100+ Clientes</span>
            </div>
            <div class="stat">
                <i class="fas fa-cogs"></i>
                <span>500+ PCs Montados</span>
            </div>
            <div class="stat">
                <i class="fas fa-star"></i>
                <span>5.0 Avaliação</span>
            </div>
        </div>
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

<!-- SERVIÇOS -->
<section id="servicos" class="services">
    <div class="services-header">
        <div class="services-badge">
            <i class="fas fa-wrench"></i>
            <span>Soluções Técnicas</span>
        </div>
        <h2>Nossos Serviços</h2>
        <p>Serviços especializados para todas as suas necessidades tecnológicas</p>
    </div>
    <div class="services-grid">
        <a href="orcamentos.php?tipo=montagem" class="service-card">
            <div class="service-icon-wrapper">
                <i class="fas fa-cogs"></i>
                <div class="service-glow"></div>
            </div>
            <div class="service-content">
                <h3>Montagem de PCs</h3>
                <p>Montagem personalizada de PCs gamer e workstation com garantia total.</p>
                <div class="service-features">
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Hardware Premium</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>Garantia Total</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-clock"></i>
                        <span>Entrega Rápida</span>
                    </div>
                </div>
                <div class="price-tag">
                    <span class="price">A partir de €200</span>
                    <span class="cta">Solicitar Orçamento</span>
                </div>
            </div>
        </a>
        <a href="orcamentos.php?tipo=manutencao" class="service-card">
            <div class="service-icon-wrapper">
                <i class="fas fa-tools"></i>
                <div class="service-glow"></div>
            </div>
            <div class="service-content">
                <h3>Manutenção</h3>
                <p>Limpeza, upgrades e reparos de computadores com performance máxima.</p>
                <div class="service-features">
                    <div class="feature-item">
                        <i class="fas fa-broom"></i>
                        <span>Limpeza Profissional</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-arrow-up"></i>
                        <span>Upgrades</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-wrench"></i>
                        <span>Reparos</span>
                    </div>
                </div>
                <div class="price-tag">
                    <span class="price">A partir de €50</span>
                    <span class="cta">Agendar Serviço</span>
                </div>
            </div>
        </a>
        <a href="orcamentos.php?tipo=consultoria" class="service-card">
            <div class="service-icon-wrapper">
                <i class="fas fa-lightbulb"></i>
                <div class="service-glow"></div>
            </div>
            <div class="service-content">
                <h3>Consultoria Técnica</h3>
                <p>Orientação profissional na escolha de hardware e compatibilidade.</p>
                <div class="service-features">
                    <div class="feature-item">
                        <i class="fas fa-brain"></i>
                        <span>Análise Técnica</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-balance-scale"></i>
                        <span>Compatibilidade</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Otimização</span>
                    </div>
                </div>
                <div class="price-tag">
                    <span class="price">Grátis</span>
                    <span class="cta">Falar com Especialista</span>
                </div>
            </div>
        </a>
    </div>
</section>



<!-- PROJETOS -->
<section id="projetos" class="projects">
    <div class="projects-header">
        <div class="projects-badge">
            <i class="fas fa-project-diagram"></i>
            <span>Portfólio de Sucesso</span>
        </div>
        <h2>Projetos Realizados</h2>
        <p>Transformações impressionantes que nossos clientes já vivenciaram</p>
    </div>
    <div class="projects-gallery">
        <div class="project-item">
            <div class="project-title">
                <i class="fas fa-gamepad"></i>
                <h3>PC Gamer para Streaming</h3>
            </div>
            <div class="before-after-container">
                <div class="image-wrapper">
                    <div class="image-label before-label">
                        <i class="fas fa-times-circle"></i>
                        <span>Antes</span>
                    </div>
                    <img src="imagens/pc antigo 1.jpg" alt="Antes">
                </div>
                <div class="arrow-container">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="image-wrapper">
                    <div class="image-label after-label">
                        <i class="fas fa-check-circle"></i>
                        <span>Depois</span>
                    </div>
                    <img src="imagens/pc novo 4.jpg" alt="Depois">
                </div>
            </div>
            <div class="project-specs">
                <div class="spec-item">
                    <i class="fas fa-microchip"></i>
                    <span>RTX 4070 + i7-13700K</span>
                </div>
                <div class="spec-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Performance 300% Melhor</span>
                </div>
            </div>
        </div>
        <div class="project-item">
            <div class="project-title">
                <i class="fas fa-palette"></i>
                <h3>Workstation para Design</h3>
            </div>
            <div class="before-after-container">
                <div class="image-wrapper">
                    <div class="image-label before-label">
                        <i class="fas fa-times-circle"></i>
                        <span>Antes</span>
                    </div>
                    <img src="imagens/pc antigo 2.jpg" alt="Antes">
                </div>
                <div class="arrow-container">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="image-wrapper">
                    <div class="image-label after-label">
                        <i class="fas fa-check-circle"></i>
                        <span>Depois</span>
                    </div>
                    <img src="imagens/pc novo 2.jpg" alt="Depois">
                </div>
            </div>
            <div class="project-specs">
                <div class="spec-item">
                    <i class="fas fa-memory"></i>
                    <span>64GB RAM + Threadripper</span>
                </div>
                <div class="spec-item">
                    <i class="fas fa-clock"></i>
                    <span>Renderização 5x Mais Rápida</span>
                </div>
            </div>
        </div>
        <div class="project-item">
            <div class="project-title">
                <i class="fas fa-code"></i>
                <h3>Setup para Desenvolvimento</h3>
            </div>
            <div class="before-after-container">
                <div class="image-wrapper">
                    <div class="image-label before-label">
                        <i class="fas fa-times-circle"></i>
                        <span>Antes</span>
                    </div>
                    <img src="imagens/pc antigo 3.jpg" alt="Antes">
                </div>
                <div class="arrow-container">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="image-wrapper">
                    <div class="image-label after-label">
                        <i class="fas fa-check-circle"></i>
                        <span>Depois</span>
                    </div>
                    <img src="imagens/pc novo 1.jpg" alt="Depois">
                </div>
            </div>
            <div class="project-specs">
                <div class="spec-item">
                    <i class="fas fa-microchip"></i>
                    <span>i9-12900K + 32GB DDR5</span>
                </div>
                <div class="spec-item">
                    <i class="fas fa-rocket"></i>
                    <span>Compilação 4x Mais Rápida</span>
                </div>
            </div>
        </div>
        <div class="project-item">
            <div class="project-title">
                <i class="fas fa-video"></i>
                <h3>Estação de Edição de Vídeo</h3>
            </div>
            <div class="before-after-container">
                <div class="image-wrapper">
                    <div class="image-label before-label">
                        <i class="fas fa-times-circle"></i>
                        <span>Antes</span>
                    </div>
                    <img src="imagens/pc antigo 4.jpg" alt="Antes">
                </div>
                <div class="arrow-container">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="image-wrapper">
                    <div class="image-label after-label">
                        <i class="fas fa-check-circle"></i>
                        <span>Depois</span>
                    </div>
                    <img src="imagens/pc novo 3.jpg" alt="Depois">
                </div>
            </div>
            <div class="project-specs">
                <div class="spec-item">
                    <i class="fas fa-memory"></i>
                    <span>RTX 4080 + 64GB RAM</span>
                </div>
                <div class="spec-item">
                    <i class="fas fa-clock"></i>
                    <span>Exportação 6x Mais Rápida</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CONTATO -->
<section id="contato" class="contact">
    <div class="contact-header">
        <h2>Entre em Contato</h2>
        <p>Estamos aqui para ajudar com suas necessidades tecnológicas</p>
    </div>
    <div class="contact-content">
        <div class="contact-info">
            <div class="info-item">
                <i class="fab fa-whatsapp"></i>
                <div>
                    <h4>WhatsApp</h4>
                    <p>+351 912 345 678</p>
                </div>
            </div>
            <div class="info-item">
                <i class="fas fa-envelope"></i>
                <div>
                    <h4>E-mail</h4>
                    <p>info@xkairos.tech</p>
                </div>
            </div>
            <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                    <h4>Localização</h4>
                    <p>Viseu, Portugal</p>
                </div>
            </div>
        </div>
        <form class="contact-form">
            <div class="form-group">
                <label for="nome">Nome</label>
                <input type="text" id="nome" name="nome" placeholder="Seu nome completo" required>
            </div>
            <div class="form-group">
                <label for="email">E-mail</label>
                <input type="email" id="email" name="email" placeholder="seu@email.com" required>
            </div>
            <div class="form-group">
                <label for="mensagem">Mensagem</label>
                <textarea id="mensagem" name="mensagem" placeholder="Digite sua mensagem aqui..." required></textarea>
            </div>
            <button type="submit" class="btn-submit">
                <i class="fas fa-paper-plane"></i>
                Enviar Mensagem
            </button>
        </form>
    </div>
</section>



<?php
include "includes/footer.php";
?>
