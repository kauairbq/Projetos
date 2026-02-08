/**
 * Main JavaScript for Rock Band Website
 * Handles general functionality, animations, and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeAnimations();
    initializeScrollEffects();
    initializeSmoothScrolling();
    initializeImageLazyLoading();
    initializeBackToTop();
    initializeMobileMenu();

    // Performance optimization
    optimizePerformance();
});

/**
 * Initialize scroll-triggered animations
 */
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.member-card, .show-card, .timeline-item, .single-card, .contact-info, .contact-form');
    animateElements.forEach(el => observer.observe(el));
}

/**
 * Initialize scroll effects
 */
function initializeScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    const hero = document.querySelector('.hero');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Header hide/show on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;

        // Parallax effect for hero background (if video/image is used)
        if (hero) {
            const scrolled = scrollTop * 0.5;
            hero.style.transform = `translateY(${scrolled}px)`;
        }

        // Update active navigation link
        updateActiveNavLink();
    });
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
}

/**
 * Initialize lazy loading for images
 */
function initializeImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

/**
 * Initialize back to top button
 */
function initializeBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Voltar ao topo');
    document.body.appendChild(backToTopBtn);

    // Style the button
    Object.assign(backToTopBtn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'var(--primary-color)',
        color: 'var(--light-color)',
        border: 'none',
        cursor: 'pointer',
        opacity: '0',
        visibility: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: '1000',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });
}

/**
 * Initialize mobile menu (if needed for smaller screens)
 */
function initializeMobileMenu() {
    const nav = document.querySelector('nav');
    const navUl = document.querySelector('nav ul');

    if (window.innerWidth <= 768) {
        // Create mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.setAttribute('aria-label', 'Menu');
        nav.appendChild(mobileMenuBtn);

        // Style mobile menu button
        Object.assign(mobileMenuBtn.style, {
            background: 'none',
            border: 'none',
            color: 'var(--light-color)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            marginLeft: '1rem'
        });

        // Hide original nav
        navUl.style.display = 'none';

        // Create mobile menu
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = navUl.innerHTML;
        document.body.appendChild(mobileMenu);

        // Style mobile menu
        Object.assign(mobileMenu.style, {
            position: 'fixed',
            top: '100%',
            left: '0',
            width: '100%',
            height: 'calc(100vh - 80px)',
            background: 'var(--dark-color)',
            padding: '2rem',
            transform: 'translateY(-100%)',
            transition: 'transform 0.3s ease',
            zIndex: '999',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        });

        // Style mobile menu links
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            Object.assign(link.style, {
                color: 'var(--light-color)',
                fontSize: '1.5rem',
                margin: '1rem 0',
                textDecoration: 'none',
                display: 'block'
            });
        });

        // Toggle mobile menu
        function toggleMobileMenu() {
            const isActive = mobileMenu.style.transform === 'translateY(0%)';
            mobileMenu.style.transform = isActive ? 'translateY(-100%)' : 'translateY(0%)';
            mobileMenuBtn.innerHTML = isActive ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
        }

        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // Close mobile menu when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', toggleMobileMenu);
        });
    }
}

/**
 * Performance optimizations
 */
function optimizePerformance() {
    // Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debouncing to scroll handlers
    const debouncedScroll = debounce(() => {
        // Any scroll-dependent functions can be called here
    }, 16); // ~60fps

    window.addEventListener('scroll', debouncedScroll);

    // Preload critical resources
    const preloadLinks = [
        'css/style.css',
        'css/responsive.css',
        'css/animations.css',
        'js/contact.js',
        'js/darkmode.js'
    ];

    preloadLinks.forEach(link => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'preload';
        linkElement.href = link;
        linkElement.as = link.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(linkElement);
    });
}

/**
 * Utility functions
 */
function getCurrentTheme() {
    return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Make utility functions globally available
window.RockBandUtils = {
    getCurrentTheme,
    setTheme
};
