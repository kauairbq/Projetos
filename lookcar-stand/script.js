const cars = [
  {
    title: 'Volvo XC40 Recharge',
    type: 'Eletrico',
    price: 48900,
    km: '18.200 km',
    year: '2023',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946dauto=format&fit=crop&w=800&q=60',
    tag: 'Eletrico',
  },
  {
    title: 'BMW X1 sDrive18d',
    type: 'SUV',
    price: 33900,
    km: '52.000 km',
    year: '2021',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946dauto=format&fit=crop&w=800&q=60',
    tag: 'SUV',
  },
  {
    title: 'Toyota Yaris Hybrid',
    type: 'Hibrido',
    price: 19900,
    km: '41.500 km',
    year: '2020',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946dauto=format&fit=crop&w=800&q=60',
    tag: 'Hibrido',
  },
  {
    title: 'Renault Clio TCe',
    type: 'Citadino',
    price: 14500,
    km: '36.800 km',
    year: '2021',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946dauto=format&fit=crop&w=800&q=60',
    tag: 'Citadino',
  },
  {
    title: 'Kia Sportage GT Line',
    type: 'SUV',
    price: 28900,
    km: '48.300 km',
    year: '2022',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946dauto=format&fit=crop&w=800&q=60',
    tag: 'SUV',
  },
  {
    title: 'Cupra Formentor',
    type: 'SUV',
    price: 37900,
    km: '27.400 km',
    year: '2023',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946dauto=format&fit=crop&w=800&q=60',
    tag: 'SUV',
  },
];

const cardsEl = document.getElementById('cards');
const searchEl = document.getElementById('search');
const tagsEl = document.getElementById('tags');
const orcamentoEl = document.getElementById('orcamento');
const tipoEl = document.getElementById('tipo');
const applyFiltersBtn = document.getElementById('applyFilters');

let activeTag = '';

function render(list) {
  cardsEl.innerHTML = list
    .map(
      (c) => `
      <article class="card car-card">
        <img src="${c.img}" alt="${c.title}" />
        <div class="tagline">
          <span class="badge">${c.type}</span>
          <span>${c.year}</span>
          <span>${c.km}</span>
        </div>
        <h3>${c.title}</h3>
        <p class="muted">Financiamento em ate 120 meses. Garantia e relatorio tecnico.</p>
        <div class="price">${c.price.toLocaleString('pt-PT')} €</div>
      </article>`
    )
    .join('');
}

function filterCars() {
  const term = (searchEl.value || '').toLowerCase();
  const max = Number(orcamentoEl.value || 0);
  const tipo = activeTag || tipoEl.value;

  const filtered = cars.filter((c) => {
    const matchTerm = term  c.title.toLowerCase().includes(term) : true;
    const matchTipo = tipo  c.type === tipo : true;
    const matchPrice = max > 0  c.price <= max : true;
    return matchTerm && matchTipo && matchPrice;
  });

  render(filtered);
}

if (tagsEl) {
  tagsEl.addEventListener('click', (e) => {
    if (e.target.matches('.pill')) {
      document.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
      e.target.classList.add('active');
      activeTag = e.target.dataset.tag || '';
      filterCars();
    }
  });
}

if (searchEl) searchEl.addEventListener('input', filterCars);
if (orcamentoEl) orcamentoEl.addEventListener('input', filterCars);
if (tipoEl) tipoEl.addEventListener('change', filterCars);
if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', filterCars);

render(cars);

// Menu interactions (dropdown + mobile)
const navDropdowns = document.querySelectorAll('.nav-dropdown');
navDropdowns.forEach((dd) => {
  const toggle = dd.querySelector('.dropdown-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      dd.classList.toggle('open');
    });
  }
});

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const overlay = document.getElementById('overlayMenu');
const closeMenu = document.getElementById('closeMenu');

function closeOverlay() {
  navLinks && navLinks.classList.remove('show');
  overlay && overlay.classList.remove('active');
}

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    overlay && overlay.classList.toggle('active');
  });
}

if (closeMenu) {
  closeMenu.addEventListener('click', closeOverlay);
}

document.querySelectorAll('.overlay-link').forEach((link) => {
  link.addEventListener('click', closeOverlay);
});
