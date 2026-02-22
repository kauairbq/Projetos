const { query } = require('../utils/db');

async function createFeedback(payload) {
  const result = await query(
    `INSERT INTO feedback (tenant_id, author_user_id, subject, message, rating)
     VALUES (?, ?, ?, ?, ?)`,
    [
      payload.tenant_id,
      payload.author_user_id || null,
      payload.subject,
      payload.message,
      payload.rating || 5
    ]
  );

  const rows = await query('SELECT * FROM feedback WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0] || null;
}

async function listFeedback(tenantId, limit = 100) {
  const safeLimit = Number.isFinite(Number(limit))
    ? Math.max(1, Math.min(100, Number(limit)))
    : 100;

  return query(
    `SELECT f.*, tu.full_name, tu.email
     FROM feedback f
     LEFT JOIN tenant_users tu ON tu.id = f.author_user_id
     WHERE f.tenant_id = ?
     ORDER BY f.created_at DESC
     LIMIT ${safeLimit}`,
    [tenantId]
  );
}

module.exports = { createFeedback, listFeedback };
