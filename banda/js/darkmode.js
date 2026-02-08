document.addEventListener('DOMContentLoaded', () => {
  initTheme();
});

function initTheme() {
  const btn = document.getElementById('dark-mode-toggle');
  if (!btn) return;

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');

  applyTheme(initial);
  updateButton(initial);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    updateButton(next);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      const next = e.matches ? 'dark' : 'light';
      applyTheme(next);
      updateButton(next);
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark-mode', theme === 'dark');
  document.body.classList.toggle('dark-mode', theme === 'dark');
  localStorage.setItem('theme', theme);
}

function updateButton(theme) {
  const btn = document.getElementById('dark-mode-toggle');
  if (!btn) return;
  if (theme === 'dark') {
    btn.textContent = '☀️';
    btn.title = 'Alternar para modo claro';
    btn.setAttribute('aria-label', 'Alternar para modo claro');
  } else {
    btn.textContent = '🌙';
    btn.title = 'Alternar para modo escuro';
    btn.setAttribute('aria-label', 'Alternar para modo escuro');
  }
}
