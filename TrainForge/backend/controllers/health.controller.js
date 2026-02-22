const { query } = require('../utils/db');

async function health(_req, res, next) {
  try {
    const db = await query('SELECT 1 AS ok');
    return res.json({ ok: true, data: { api: 'up', db: db?.[0]?.ok === 1 ? 'up' : 'unknown' } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { health };
