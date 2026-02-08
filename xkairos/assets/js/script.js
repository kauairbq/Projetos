// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-image');

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

setInterval(nextSlide, 3000); // Change slide every 3 seconds

// Budget calculator
const selects = document.querySelectorAll('select');
const totalPrice = document.getElementById('total-price');

function calculateTotal() {
    let total = 0;
    selects.forEach(select => {
        total += parseInt(select.value) || 0;
    });
    totalPrice.textContent = total;
}

selects.forEach(select => {
    select.addEventListener('change', calculateTotal);
});

// Generate budget button
document.getElementById('generate-budget').addEventListener('click', function() {
    const components = {
        cpu: document.getElementById('cpu').options[document.getElementById('cpu').selectedIndex].text,
        gpu: document.getElementById('gpu').options[document.getElementById('gpu').selectedIndex].text,
        ram: document.getElementById('ram').options[document.getElementById('ram').selectedIndex].text,
        ssd: document.getElementById('ssd').options[document.getElementById('ssd').selectedIndex].text
    };

    const total = parseInt(totalPrice.textContent);

    // Create form data to send to CRM
    const formData = new FormData();
    formData.append('cpu', components.cpu);
    formData.append('gpu', components.gpu);
    formData.append('ram', components.ram);
    formData.append('ssd', components.ssd);
    formData.append('total', total);

    // For now, just show an alert. In a real implementation, this would send to the server
    alert(`Orçamento gerado!\n\nCPU: ${components.cpu}\nGPU: ${components.gpu}\nRAM: ${components.ram}\nSSD: ${components.ssd}\n\nTotal: €${total}\n\nSerá redirecionado para o CRM para finalizar.`);
});

// Contact form submission
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    this.reset();
});

// Smooth scrolling for navigation
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


