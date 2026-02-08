<?php
include "includes/config.php";
include "includes/header.php";
?>

<section class="privacy-policy">
    <div class="container">
        <div class="policy-header">
            <a href="index.php" class="home-button">
                <i class="fas fa-home"></i> Voltar ao Início
            </a>
            <h1>Política de Privacidade</h1>
            <p class="last-updated">Última atualização: <?php echo date('d/m/Y'); ?></p>
        </div>

        <div class="policy-content">
            <div class="policy-intro">
                <div class="intro-card">
                    <i class="fas fa-shield-alt"></i>
                    <h2>1. Introdução</h2>
                    <p>A Xkairos Tech ("nós", "nosso" ou "empresa") respeita a sua privacidade e está comprometida em proteger as suas informações pessoais. Esta Política de Privacidade explica como recolhemos, utilizamos, divulgamos e protegemos as suas informações quando utiliza o nosso website e serviços.</p>
                </div>
            </div>

            <div class="policy-section">
                <h2><i class="fas fa-database"></i> 2. Informações que Recolhemos</h2>
                <div class="subsection">
                    <h3>2.1 Informações Fornecidas por Si</h3>
                    <p>Quando utiliza os nossos serviços, pode fornecer-nos informações pessoais, tais como:</p>
                    <ul>
                        <li><i class="fas fa-user"></i> Nome e informações de contacto</li>
                        <li><i class="fas fa-credit-card"></i> Informações de faturação e pagamento</li>
                        <li><i class="fas fa-project-diagram"></i> Informações sobre os seus projetos e requisitos</li>
                        <li><i class="fas fa-envelope"></i> Comunicações connosco</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>2.2 Informações Recolhidas Automaticamente</h3>
                    <p>Quando visita o nosso website, podemos recolher automaticamente certas informações, incluindo:</p>
                    <ul>
                        <li><i class="fas fa-globe"></i> Endereço IP e localização</li>
                        <li><i class="fas fa-desktop"></i> Tipo de navegador e sistema operativo</li>
                        <li><i class="fas fa-clock"></i> Páginas visitadas e tempo gasto no site</li>
                        <li><i class="fas fa-cookie-bite"></i> Cookies e tecnologias similares</li>
                    </ul>
                </div>
            </div>

            <div class="policy-section">
                <h2><i class="fas fa-cogs"></i> 3. Como Utilizamos as Suas Informações</h2>
                <p>Utilizamos as informações recolhidas para:</p>
                <ul>
                    <li><i class="fas fa-tools"></i> Fornecer e melhorar os nossos serviços</li>
                    <li><i class="fas fa-shopping-cart"></i> Processar pedidos e pagamentos</li>
                    <li><i class="fas fa-comments"></i> Comunicar consigo sobre os seus projetos</li>
                    <li><i class="fas fa-gavel"></i> Cumprir obrigações legais</li>
                    <li><i class="fas fa-user-friends"></i> Melhorar a experiência do utilizador</li>
                </ul>
            </div>

            <div class="policy-section">
                <h2><i class="fas fa-share-alt"></i> 4. Partilha de Informações</h2>
                <p>Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros, exceto:</p>
                <ul>
                    <li><i class="fas fa-check-circle"></i> Com o seu consentimento explícito</li>
                    <li><i class="fas fa-balance-scale"></i> Para cumprir obrigações legais</li>
                    <li><i class="fas fa-lock"></i> Para proteger os nossos direitos e segurança</li>
                    <li><i class="fas fa-handshake"></i> Com prestadores de serviços que nos ajudam a operar (sob acordos de confidencialidade)</li>
                </ul>
            </div>

            <div class="policy-section">
                <h2><i class="fas fa-shield-alt"></i> 5. Segurança dos Dados</h2>
                <p>Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger as suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.</p>
            </div>

            <div class="policy-section">
                <h2><i class="fas fa-cookie-bite"></i> 6. Cookies</h2>
                <p>Utilizamos cookies para melhorar a sua experiência no nosso website. Pode controlar as definições de cookies através do seu navegador.</p>
            </div>

            <div class="policy-section">
                <h2><i class="fas fa-user-check"></i> 7. Os Seus Direitos</h2>
                <p>De acordo com a legislação aplicável, tem o direito de:</p>
                <ul>
                    <li><i class="fas fa-eye"></i> Aceder às suas informações pessoais</li>
                    <li><i class="fas fa-edit"></i> Corrigir informações inexatas</li>
                    <li><i class="fas fa-trash-alt"></i> Eliminar as suas informações</li>
                    <li><i class="fas fa-ban"></i> Restringir ou opor-se ao processamento</li>
                    <li><i class="fas fa-download"></i> Portabilidade dos dados</li>
                </ul>
            </div>

            <div class="policy-section">
                <h2><i class="fas fa-envelope"></i> 8. Contacto</h2>
                <p>Se tiver dúvidas sobre esta Política de Privacidade ou quiser exercer os seus direitos, contacte-nos através de:</p>
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>info@xkairos.tech</span>
                    </div>
                    <div class="contact-item">
                        <i class="fab fa-whatsapp"></i>
                        <span>+351 912 345 678</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Viseu, Portugal</span>
                    </div>
                </div>
            </div>

            <div class="policy-section">
                <h2><i class="fas fa-edit"></i> 9. Alterações a Esta Política</h2>
                <p>Podemos atualizar esta Política de Privacidade periodicamente. Notificá-lo-emos sobre alterações significativas através do nosso website ou por email.</p>
            </div>
        </div>
    </div>
</section>

<style>
.privacy-policy {
    padding: var(--spacing-xl) var(--spacing-lg);
    background: var(--color-bg);
    color: var(--color-text);
    min-height: 100vh;
}

.privacy-policy .container {
    max-width: 900px;
    margin: 0 auto;
}

.policy-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 2px solid var(--color-primary);
    position: relative;
}

.home-button {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-primary);
    color: var(--color-bg);
    text-decoration: none;
    border-radius: var(--radius);
    font-weight: 500;
    transition: var(--transition);
}

.home-button:hover {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
}

.home-button i {
    font-size: 1rem;
}

.policy-header h1 {
    font-family: 'Orbitron', sans-serif;
    color: var(--color-primary);
    font-size: 2.5rem;
    margin-bottom: var(--spacing-sm);
}

.last-updated {
    color: var(--color-text-alt);
    font-style: italic;
    font-size: 1rem;
}

.policy-intro {
    margin-bottom: var(--spacing-xl);
}

.intro-card {
    background: var(--color-bg-alt);
    padding: var(--spacing-lg);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    text-align: center;
}

.intro-card i {
    font-size: 3rem;
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
}

.intro-card h2 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
    font-size: 1.5rem;
}

.intro-card p {
    line-height: 1.6;
    color: var(--color-text);
}

.policy-section {
    margin-bottom: var(--spacing-xl);
    background: var(--color-bg-alt);
    padding: var(--spacing-lg);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

.policy-section h2 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.policy-section h2 i {
    color: var(--color-primary);
}

.subsection {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-text-alt);
}

.subsection h3 {
    color: var(--color-accent);
    margin-bottom: var(--spacing-sm);
    font-size: 1.2rem;
}

.policy-section p {
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
    color: var(--color-text);
}

.policy-section ul {
    margin-left: 0;
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-md);
}

.policy-section li {
    margin-bottom: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--color-text);
}

.policy-section li i {
    color: var(--color-primary);
    min-width: 20px;
}

.contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
}

.contact-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--color-bg);
    border-radius: var(--radius);
    color: var(--color-text);
}

.contact-item i {
    color: var(--color-primary);
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .privacy-policy {
        padding: var(--spacing-lg) var(--spacing-md);
    }

    .policy-header h1 {
        font-size: 2rem;
    }

    .policy-section {
        padding: var(--spacing-md);
    }

    .contact-info {
        grid-template-columns: 1fr;
    }

    .policy-section h2 {
        font-size: 1.3rem;
    }
}
</style>

<?php
include "includes/footer.php";
?>
