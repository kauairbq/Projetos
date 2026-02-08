document.addEventListener('DOMContentLoaded', () => {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });
  tl.from('.nav', { y: -20, opacity: 0 })
    .from('.copy h1', { y: 20, opacity: 0 }, '-=0.4')
    .from('.copy .lede', { y: 20, opacity: 0 }, '-=0.5')
    .from('.cta', { y: 10, opacity: 0 }, '-=0.4')
    .from('.visual .card', { y: 30, opacity: 0, stagger: 0.1 }, '-=0.3');

  document.querySelectorAll('.section .card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${(x / rect.width - 0.5) * 6}px`);
      card.style.setProperty('--my', `${(y / rect.height - 0.5) * 6}px`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mx', '0px');
      card.style.setProperty('--my', '0px');
    });
  });

  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('feedback');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    feedback.textContent = 'Obrigado! Entraremos em contacto em breve.';
    form.reset();
  });
});
