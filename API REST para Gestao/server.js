const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const users = [
  { id: '1', name: 'Ana Silva', email: 'ana@example.com', role: 'admin' },
  { id: '2', name: 'Bruno Costa', email: 'bruno@example.com', role: 'user' }
];

function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token em falta' });
  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inv?lido' });
  }
}

app.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: 'Credenciais inv?lidas' });
  const token = jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token, user });
});

app.get('/users', auth, (_req, res) => res.json(users));

app.post('/users', auth, (req, res) => {
  const { name, email, role } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Nome e email s?o obrigat?rios' });
  const newUser = { id: String(users.length + 1), name, email, role: role || 'user' };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/docs', express.static(__dirname));

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`API REST de Gest?o em http://localhost:${PORT}`));
