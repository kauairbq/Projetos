const { query } = require('../utils/db');

async function createWorkout(payload) {
  const result = await query(
    `INSERT INTO workouts
      (tenant_id, actor_user_id, student_id, challenge_id, title, modality, duration_minutes, calories, points, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.tenant_id,
      payload.actor_user_id || null,
      payload.student_id || null,
      payload.challenge_id || null,
      payload.title,
      payload.modality || 'General',
      payload.duration_minutes || 0,
      payload.calories || 0,
      payload.points || 0,
      payload.completed_at || new Date()
    ]
  );

  const rows = await query('SELECT * FROM workouts WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0] || null;
}

async function leaderboard(tenantId, limit = 10) {
  const safeLimit = Number.isFinite(Number(limit))
    ? Math.max(1, Math.min(50, Number(limit)))
    : 10;

  const byChallenge = await query(
    `SELECT
        s.id,
        s.full_name,
        s.mode,
        SUM(cp.total_points) AS total_points,
        COUNT(cp.id) AS total_workouts
     FROM challenge_participation cp
     JOIN students s ON s.id = cp.student_id
     JOIN weekly_challenges wc ON wc.id = cp.challenge_id
     WHERE wc.tenant_id = ?
     GROUP BY s.id, s.full_name, s.mode
     ORDER BY total_points DESC
     LIMIT ${safeLimit}`,
    [tenantId]
  );

  if (byChallenge.length > 0) {
    return byChallenge;
  }

  return query(
    `SELECT
        s.id,
        s.full_name,
        s.mode,
        COALESCE(SUM(w.points), 0) AS total_points,
        COUNT(w.id) AS total_workouts
     FROM students s
     LEFT JOIN workouts w ON w.student_id = s.id
     WHERE s.tenant_id = ?
     GROUP BY s.id, s.full_name, s.mode
     ORDER BY total_points DESC, total_workouts DESC
     LIMIT ${safeLimit}`,
    [tenantId]
  );
}

async function metrics(tenantId, actorUserId = null) {
  const whereClause = actorUserId
    ? 'WHERE w.tenant_id = ? AND w.actor_user_id = ?'
    : 'WHERE w.tenant_id = ?';
  const params = actorUserId ? [tenantId, actorUserId] : [tenantId];

  const rows = await query(
    `SELECT COUNT(*) AS total_workouts,
            COALESCE(SUM(w.points), 0) AS total_points,
            COALESCE(AVG(w.duration_minutes), 0) AS avg_duration,
            COALESCE(SUM(w.calories), 0) AS total_calories
     FROM workouts w
     ${whereClause}`,
    params
  );

  return rows[0] || { total_workouts: 0, total_points: 0, avg_duration: 0, total_calories: 0 };
}

async function historyByUser(tenantId, actorUserId) {
  return query(
    `SELECT
        w.id,
        w.title,
        w.modality,
        w.duration_minutes,
        w.calories,
        w.points,
        w.completed_at,
        wc.title AS challenge_title,
        s.full_name AS student_name
     FROM workouts w
     LEFT JOIN weekly_challenges wc ON wc.id = w.challenge_id
     LEFT JOIN students s ON s.id = w.student_id
     WHERE w.tenant_id = ? AND w.actor_user_id = ?
     ORDER BY w.completed_at DESC
     LIMIT 100`,
    [tenantId, actorUserId]
  );
}

module.exports = {
  createWorkout,
  leaderboard,
  metrics,
  historyByUser
};
