import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import ProgressBar from '../src/components/ProgressBar.jsx';
import Home from '../src/pages/Home.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import { ToastProvider } from '../src/components/ToastProvider.jsx';

function run(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (error) {
    console.error(`[FAIL] ${name}`);
    throw error;
  }
}

run('ProgressBar limita valor maximo em 100%', () => {
  const html = renderToStaticMarkup(<ProgressBar value={145} label="Meta semanal" />);
  assert.match(html, /Meta semanal/);
  assert.match(html, /100%/);
});

run('Home renderiza titulo do produto e formulario de login', () => {
  const html = renderToStaticMarkup(<Home onAuth={() => {}} />);
  assert.match(html, /TrainForge/);
  assert.match(html, /Forjando performance e resultados/i);
  assert.match(html, /Entrar/);
});

run('Dashboard renderiza estrutura principal de metricas', () => {
  const html = renderToStaticMarkup(
    <ToastProvider>
      <Dashboard user={{ full_name: 'Kauai Rocha', role: 'admin' }} />
    </ToastProvider>
  );
  assert.match(html, /Dashboard de Performance/);
  assert.match(html, /Indicadores da semana/);
});

console.log('Frontend automated tests completed successfully.');
