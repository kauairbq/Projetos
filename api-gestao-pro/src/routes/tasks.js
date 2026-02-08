const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.put('/:id', auth, async (req, res) => {
  const { title, description, due_date, status } = req.body || {};
  const { rows } = await pool.query(
    'UPDATE tasks SET title=$1, description=$2, due_date=$3, status=$4 WHERE id=$5 RETURNING *',
    [title, description, due_date || null, status || 'pendente', req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Tarefa n?o encontrada' });
  return res.json(rows[0]);
});

router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body || {};
  const { rows } = await pool.query('UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *', [status || 'pendente', req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Tarefa n?o encontrada' });
  return res.json(rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
  return res.status(204).end();
});

module.exports = router;
