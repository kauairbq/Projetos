// Versao offline (sem dependencias externas). Para tempo real, corra o server.js (porta 4001) e ligue o cliente Socket.IO.

const rooms = ['geral', 'suporte', 'devs'];
const messages = { geral: [], suporte: [], devs: [] };
let currentRoom = 'geral';
const user = 'user-' + Math.floor(Math.random() * 900 + 100);

const statusEl = document.getElementById('status');
const roomsEl = document.getElementById('rooms');
const messagesEl = document.getElementById('messages');
const formEl = document.getElementById('form');
const textEl = document.getElementById('text');
const fileEl = document.getElementById('file');
const connectBtn = document.getElementById('connectBtn');

let connected = true; // offline demo fica "online"

function renderRooms() {
  roomsEl.innerHTML = '';
  rooms.forEach((room) => {
    const btn = document.createElement('button');
    btn.className = `room-btn ${currentRoom === room ? 'active' : ''}`;
    btn.textContent = `#${room}`;
    btn.onclick = () => {
      currentRoom = room;
      statusEl.textContent = `Online | sala ${currentRoom}`;
      renderRooms();
      renderMessages();
    };
    roomsEl.appendChild(btn);
  });
}

function renderMessages() {
  messagesEl.innerHTML = '';
  messages[currentRoom].forEach((m) => {
    const wrap = document.createElement('div');
    wrap.className = m.system ? 'system' : 'msg';
    if (m.system) {
      wrap.textContent = m.text;
    } else {
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `<span>${m.user}<span class=\"badge\">${m.room}</span></span><span>${m.time}</span>`;
      const text = document.createElement('div');
      text.className = 'text';
      text.textContent = m.text;
      wrap.appendChild(meta);
      wrap.appendChild(text);
      if (m.file) {
        const file = document.createElement('div');
        file.className = 'file-preview';
        file.textContent = `Anexo: ${m.file.name} (${m.file.size} KB)`;
        wrap.appendChild(file);
      }
    }
    messagesEl.appendChild(wrap);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addMessage({ room, text, file }) {
  const entry = {
    room,
    user,
    text,
    file,
    time: new Date().toLocaleTimeString(),
  };
  messages[room].push(entry);
  if (messages[room].length > 100) messages[room].shift();
  renderMessages();
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = textEl.value.trim();
  const file = fileEl.files[0];
  if (!text && !file) return;
  let filePayload = null;
  if (file) {
    filePayload = { name: file.name, size: Math.round(file.size / 1024) };
  }
  addMessage({ room: currentRoom, text, file: filePayload });
  textEl.value = '';
  fileEl.value = '';
});

connectBtn.addEventListener('click', () => {
  connected = true;
  statusEl.textContent = `Online | sala ${currentRoom}`;
  connectBtn.style.display = 'none';
});

// seeds demo
messages.geral.push({ system: true, text: 'Bem-vindo! Esta é uma pré-visualização offline.', time: '' });
messages.geral.push({ room: 'geral', user: 'alice', text: 'Olá! Quando subimos o backend?', time: '10:30' });
messages.geral.push({ room: 'geral', user: 'bob', text: 'Podemos começar pelo Socket.io no 4001.', time: '10:32' });

renderRooms();
renderMessages();
statusEl.textContent = `Online | sala ${currentRoom}`;
connectBtn.style.display = 'none';
