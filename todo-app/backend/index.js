const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const rootEnv = path.resolve(__dirname, '../../..', '.env');
require('dotenv').config({ path: fs.existsSync(rootEnv) ? rootEnv : undefined });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.TODO_PORT || process.env.PORT || 5000;
const MONGODB_URI =
  process.env.TODO_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/todoapp';

app.use(cors());
app.use(express.json());

// Mongoose model
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// REST API
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const task = new Task({ title });
  await task.save();
  io.emit('taskCreated', task);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const task = await Task.findByIdAndUpdate(id, updates, { new: true });
  if (task) {
    io.emit('taskUpdated', task);
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByIdAndDelete(id);
  if (task) {
    io.emit('taskDeleted', { id });
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Serve static frontend (optional)
app.use('/static-todo', express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

server.listen(PORT, () => {
  console.log(`Todo backend running on port ${PORT}`);
});
