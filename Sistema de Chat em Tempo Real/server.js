const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

const history = {
  geral: [],
  suporte: [],
  devs: []
};

io.on('connection', (socket) => {
  let currentRoom = 'geral';
  socket.join(currentRoom);
  socket.emit('history', history[currentRoom]);

  socket.on('joinRoom', (room) => {
    if (!history[room]) history[room] = [];
    socket.leave(currentRoom);
    currentRoom = room;
    socket.join(currentRoom);
    socket.emit('history', history[currentRoom]);
    socket.to(currentRoom).emit('system', `Entrou na sala ${currentRoom}`);
  });

  socket.on('message', (payload = {}) => {
    const room = payload.room || currentRoom;
    if (!history[room]) history[room] = [];
    const entry = {
      room,
      user: payload.user || 'anon',
      text: payload.text || '',
      file: payload.file || null,
      ts: Date.now()
    };
    history[room].push(entry);
    if (history[room].length > 100) history[room].shift();
    io.to(room).emit('message', entry);
  });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => console.log(`Chat server on http://localhost:${PORT}`));
