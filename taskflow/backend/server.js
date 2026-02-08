const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const tasksRouter = require('./routes/tasks');
const { router: authRouter } = require('./routes/auth');

const rootEnv = path.resolve(__dirname, '../../..', '.env');
require('dotenv').config({ path: fs.existsSync(rootEnv) ? rootEnv : undefined });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.TASKFLOW_PORT || process.env.PORT || 3000;
const MONGODB_URI =
  process.env.TASKFLOW_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://admin:03101812%40@localhost:27017/taskflow?authSource=admin';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter);

// Default route
app.get('/', (req, res) => {
  res.send('TaskFlow Backend API');
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// WebSocket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('taskUpdate', (data) => {
    socket.to(data.userId).emit('taskUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
