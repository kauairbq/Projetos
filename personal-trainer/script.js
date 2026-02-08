const tips = [
  { title: 'Proteína a cada refeição', text: 'Inclui 20-40 g de proteína em cada refeição para recuperar e preservar massa magra.' },
  { title: 'Passos diários', text: '8-10k passos ajudam na saúde metabólica e aumentam o NEAT (gasto não-treino).' },
  { title: 'Sono primeiro', text: '7-9 horas, quarto escuro e fresco. Sono ruim sabota ganho de força e perda de gordura.' },
  { title: 'Progressão simples', text: 'Aumenta 1-2 reps ou 2,5-5 kg por semana quando a técnica está sólida.' },
  { title: 'Hidratação', text: 'Cerca de 35 ml/kg/dia. Ajusta em dias quentes ou treinos longos.' },
  { title: 'Alongar pós-treino', text: '5-8 minutos de mobilidade/alinhamento ajudam na recuperação e na postura.' },
];

const tipList = document.getElementById('tipList');
if (tipList) {
  tipList.innerHTML = tips
    .map(
      (t) =>
        `<div class="tip-card"><strong>${t.title}</strong><p class="muted">${t.text}</p></div>`
    )
    .join('');
}

// Plano detalhado: TMB + atividade + objetivo
const pesoDetEl = document.getElementById('pesoDet');
const alturaDetEl = document.getElementById('alturaDet');
const idadeDetEl = document.getElementById('idadeDet');
const sexoDetEl = document.getElementById('sexoDet');
const atividadeDetEl = document.getElementById('atividadeDet');
const objetivoDetEl = document.getElementById('objetivoDet');
const detOut = document.getElementById('detOut');
const calcDetBtn = document.getElementById('calcDet');

if (calcDetBtn) {
  calcDetBtn.addEventListener('click', () => {
    const peso = parseFloat(pesoDetEl.value);
    const altura = parseFloat(alturaDetEl.value);
    const idade = parseFloat(idadeDetEl.value);
    const sexo = sexoDetEl.value;
    const fator = parseFloat(atividadeDetEl.value);

    if (!peso || !altura || !idade || !fator) {
      detOut.textContent = 'Preenche sexo, idade, peso, altura e atividade.';
      return;
    }

    // Mifflin-St Jeor
    const tmb =
      sexo === 'm'
         10 * peso + 6.25 * altura - 5 * idade + 5
        : 10 * peso + 6.25 * altura - 5 * idade - 161;

    let tdee = tmb * fator;
    const objetivo = objetivoDetEl.value;
    if (objetivo === 'cutting') tdee -= 400;
    if (objetivo === 'bulking') tdee += 250;

    // macros: proteína 2 g/kg, gordura 0.9 g/kg, resto hidratos
    const prote = peso * 2;
    const gord = peso * 0.9;
    const carbs = (tdee - prote * 4 - gord * 9) / 4;
    const refeicoes = tdee > 2600  5 : tdee < 1800  3 : 4;

    // IMC e água
    const alturaM = altura / 100;
    const imc = peso / (alturaM * alturaM);
    let faixa = 'Saudável';
    if (imc < 18.5) faixa = 'Abaixo';
    else if (imc < 25) faixa = 'Saudável';
    else if (imc < 30) faixa = 'Excesso de peso';
    else faixa = 'Obesidade';
    const agua = (peso * 0.035).toFixed(2); // litros/dia (35 ml/kg)

    detOut.textContent = `TMB: ${tmb.toFixed(0)} kcal · TDEE: ${tdee.toFixed(
      0
    )} kcal · Macros: ${prote.toFixed(0)} g proteína · ${gord.toFixed(
      0
    )} g gordura · ${carbs.toFixed(0)} g hidratos · IMC: ${imc.toFixed(
      1
    )} (${faixa}) · Água: ${agua} L/dia`;

    detOut.innerHTML = `
      <div class="calc-output">
        <div class="calc-row"><span class="calc-label">TMB</span><span>${tmb.toFixed(0)} kcal</span></div>
        <div class="calc-row"><span class="calc-label">TDEE</span><span>${tdee.toFixed(0)} kcal</span></div>
        <div class="calc-row"><span class="calc-label">Proteína</span><span>${prote.toFixed(0)} g</span></div>
        <div class="calc-row"><span class="calc-label">Gordura</span><span>${gord.toFixed(0)} g</span></div>
        <div class="calc-row"><span class="calc-label">Hidratos</span><span>${carbs.toFixed(0)} g</span></div>
        <div class="calc-row"><span class="calc-label">Refeições sugeridas</span><span>${refeicoes}x/dia</span></div>
        <div class="calc-row"><span class="calc-label">IMC</span><span>${imc.toFixed(1)} (${faixa})</span></div>
        <div class="calc-row"><span class="calc-label">Água</span><span>${agua} L/dia</span></div>
      </div>`;
  });
}
