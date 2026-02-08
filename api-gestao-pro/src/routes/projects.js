const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const query = isAdmin ? 'SELECT * FROM projects ORDER BY created_at DESC' : 'SELECT * FROM projects WHERE owner_id=$1 ORDER BY created_at DESC';
  const params = isAdmin ? [] : [req.user.id];
  const { rows } = await pool.query(query, params);
  return res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Nome obrigat?rio' });
  const { rows } = await pool.query(
    'INSERT INTO projects (owner_id, name, description) VALUES ($1,$2,$3) RETURNING *',
    [req.user.id, name, description || null]
  );
  return res.status(201).json(rows[0]);
});

router.put('/:id', auth, async (req, res) => {
  const { name, description, status } = req.body || {};
  const { rows } = await pool.query(
    'UPDATE projects SET name=$1, description=$2, status=$3 WHERE id=$4 RETURNING *',
    [name, description, status || 'ativo', req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Projeto n?o encontrado' });
  return res.json(rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  return res.status(204).end();
});

router.get('/:id/tasks', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks WHERE project_id=$1 ORDER BY created_at DESC', [req.params.id]);
  return res.json(rows);
});

router.post('/:id/tasks', auth, async (req, res) => {
  const { title, description, due_date, status } = req.body || {};
  if (!title) return res.status(400).json({ error: 'T?tulo obrigat?rio' });
  const { rows } = await pool.query(
    'INSERT INTO tasks (project_id, title, description, due_date, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.params.id, title, description || null, due_date || null, status || 'pendente']
  );
  return res.status(201).json(rows[0]);
});

module.exports = router;
