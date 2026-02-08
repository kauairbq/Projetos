const boardEl = document.getElementById('board');
const movesEl = document.getElementById('moves');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const difficultyEl = document.getElementById('difficulty');
const resetBtn = document.getElementById('resetBtn');
const toastEl = document.getElementById('toast');

const icons = ['?','??','?','??','??','??','??','??','??','??','??','??','??','??','?','??'];
const configs = {
  easy: { cols: 4, rows: 4 },
  medium: { cols: 5, rows: 4 },
  hard: { cols: 6, rows: 4 }
};

let firstCard = null;
let lock = false;
let moves = 0;
let score = 0;
let matched = 0;
let totalPairs = 0;
let timer = null;
let seconds = 0;
let started = false;

function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    seconds += 1;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(diff) {
  const { cols, rows } = configs[diff];
  totalPairs = (cols * rows) / 2;
  const chosen = shuffle(icons).slice(0, totalPairs);
  const deck = shuffle([...chosen, ...chosen]);
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  boardEl.innerHTML = '';
  deck.forEach((symbol, index) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.setAttribute('data-symbol', symbol);
    card.setAttribute('aria-label', 'Carta virada');
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">?</div>
        <div class="card-face card-back">${symbol}</div>
      </div>
    `;
    card.addEventListener('click', () => handleFlip(card));
    boardEl.appendChild(card);
  });
}

function resetGame() {
  stopTimer();
  seconds = 0;
  started = false;
  timeEl.textContent = '00:00';
  moves = 0;
  score = 0;
  matched = 0;
  movesEl.textContent = '0';
  scoreEl.textContent = '0';
  firstCard = null;
  lock = false;
  buildDeck(difficultyEl.value);
}

function handleFlip(card) {
  if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (!started) { started = true; startTimer(); }
  card.classList.add('flipped');
  if (!firstCard) {
    firstCard = card;
    return;
  }

  moves += 1;
  movesEl.textContent = moves;
  const secondCard = card;
  checkMatch(firstCard, secondCard);
  firstCard = null;
}

function checkMatch(c1, c2) {
  const same = c1.dataset.symbol === c2.dataset.symbol;
  if (same) {
    c1.classList.add('matched');
    c2.classList.add('matched');
    matched += 1;
    score += 150 - Math.max(0, moves - matched) * 5;
    scoreEl.textContent = Math.max(score, 0);
    showToast('Par encontrado!');
    if (matched === totalPairs) {
      stopTimer();
      showToast('Vit?ria! Tempo: ' + timeEl.textContent + ' | Movimentos: ' + moves);
    }
    return;
  }

  lock = true;
  setTimeout(() => {
    c1.classList.remove('flipped');
    c2.classList.remove('flipped');
    lock = false;
  }, 800);
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1500);
}

resetBtn.addEventListener('click', resetGame);
difficultyEl.addEventListener('change', resetGame);

resetGame();
