const { query } = require('../utils/db');

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.floor(parsed);
}

async function getChallengeById(tenantId, id) {
  const rows = await query(
    `SELECT
        wc.*,
        tu.full_name AS created_by_name,
        JSON_UNQUOTE(JSON_EXTRACT(wc.scoring_rules_json, '$.modality')) AS modality,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(wc.scoring_rules_json, '$.weekly_target')) AS UNSIGNED) AS weekly_target,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(wc.scoring_rules_json, '$.daily_completion')) AS UNSIGNED) AS points_per_completion,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(wc.scoring_rules_json, '$.weekly_points_limit')) AS UNSIGNED) AS weekly_points_limit
     FROM weekly_challenges wc
     LEFT JOIN tenant_users tu ON tu.id = wc.created_by_user_id
     WHERE wc.tenant_id = ? AND wc.id = ?
     LIMIT 1`,
    [tenantId, id]
  );
  return rows[0] || null;
}

async function listChallenges(tenantId) {
  return query(
    `SELECT
        wc.*,
        tu.full_name AS created_by_name,
        JSON_UNQUOTE(JSON_EXTRACT(wc.scoring_rules_json, '$.modality')) AS modality,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(wc.scoring_rules_json, '$.weekly_target')) AS UNSIGNED) AS weekly_target,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(wc.scoring_rules_json, '$.daily_completion')) AS UNSIGNED) AS points_per_completion,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(wc.scoring_rules_json, '$.weekly_points_limit')) AS UNSIGNED) AS weekly_points_limit
     FROM weekly_challenges wc
     LEFT JOIN tenant_users tu ON tu.id = wc.created_by_user_id
     WHERE wc.tenant_id = ?
     ORDER BY wc.created_at DESC`,
    [tenantId]
  );
}

async function createChallenge(payload) {
  const result = await query(
    `INSERT INTO weekly_challenges
      (tenant_id, title, description, start_date, end_date, is_active, scoring_rules_json, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.tenant_id,
      payload.title,
      payload.description || null,
      payload.start_date,
      payload.end_date,
      payload.is_active ?? 1,
      JSON.stringify(payload.scoring_rules_json || { daily_completion: payload.points_per_completion || 10 }),
      payload.created_by_user_id
    ]
  );

  return getChallengeById(payload.tenant_id, result.insertId);
}

async function toggleChallenge(tenantId, id, isActive) {
  await query(
    'UPDATE weekly_challenges SET is_active = ? WHERE tenant_id = ? AND id = ?',
    [isActive ? 1 : 0, tenantId, id]
  );

  return getChallengeById(tenantId, id);
}

async function rankingByChallenge(tenantId, challengeId, top = 3) {
  const safeTop = Number.isFinite(Number(top))
    ? Math.max(1, Math.min(10, Number(top)))
    : 3;

  return query(
    `SELECT
        s.id,
        s.full_name,
        s.mode,
        cp.total_points
     FROM challenge_participation cp
     JOIN students s ON s.id = cp.student_id
     JOIN weekly_challenges wc ON wc.id = cp.challenge_id
     WHERE wc.tenant_id = ? AND cp.challenge_id = ?
     ORDER BY cp.total_points DESC, s.full_name ASC
     LIMIT ${safeTop}`,
    [tenantId, challengeId]
  );
}

async function pickDefaultStudent(tenantId) {
  const rows = await query(
    `SELECT id
     FROM students
     WHERE tenant_id = ? AND status = 'ACTIVE'
     ORDER BY created_at ASC
     LIMIT 1`,
    [tenantId]
  );
  return rows[0]?.id || null;
}

async function getCurrentStudentPoints(challengeId, studentId) {
  const rows = await query(
    `SELECT total_points
     FROM challenge_participation
     WHERE challenge_id = ? AND student_id = ?
     LIMIT 1`,
    [challengeId, studentId]
  );
  return Number(rows[0]?.total_points || 0);
}

async function completeChallenge({
  tenantId,
  challengeId,
  actorUserId,
  studentId,
  points,
  meta
}) {
  const challenge = await getChallengeById(tenantId, challengeId);
  if (!challenge) {
    throw { status: 404, message: 'Challenge not found.' };
  }

  const resolvedStudentId = studentId || (await pickDefaultStudent(tenantId));
  if (!resolvedStudentId) {
    throw { status: 400, message: 'No active student available for challenge completion.' };
  }

  const requestedPoints = parsePositiveInt(points);
  if (!requestedPoints) {
    throw { status: 400, message: 'Points must be greater than zero.' };
  }

  const weeklyPointsLimit = parsePositiveInt(challenge.weekly_points_limit);
  const currentPoints = await getCurrentStudentPoints(challengeId, resolvedStudentId);

  let awardedPoints = requestedPoints;
  if (weeklyPointsLimit) {
    const remaining = weeklyPointsLimit - currentPoints;

    if (remaining <= 0) {
      throw { status: 409, message: 'Limite semanal de pontuacao ja atingido para este aluno.' };
    }

    awardedPoints = Math.min(requestedPoints, remaining);
  }

  const logMeta = {
    ...(meta || {}),
    requested_points: requestedPoints,
    awarded_points: awardedPoints,
    weekly_points_limit: weeklyPointsLimit || null
  };

  await query(
    `INSERT INTO challenge_activity_log (challenge_id, student_id, activity_date, points, meta_json)
     VALUES (?, ?, CURDATE(), ?, ?)
     ON DUPLICATE KEY UPDATE
       points = VALUES(points),
       meta_json = VALUES(meta_json),
       created_at = CURRENT_TIMESTAMP`,
    [challengeId, resolvedStudentId, awardedPoints, JSON.stringify(logMeta)]
  );

  await query(
    `INSERT INTO challenge_participation (challenge_id, student_id, total_points, completed, updated_at)
     VALUES (?, ?, ?, 0, NOW())
     ON DUPLICATE KEY UPDATE
       total_points = total_points + VALUES(total_points),
       updated_at = NOW()`,
    [challengeId, resolvedStudentId, awardedPoints]
  );

  await query(
    `UPDATE challenge_participation cp
     JOIN weekly_challenges wc ON wc.id = cp.challenge_id
     SET cp.completed = CASE WHEN CURDATE() >= wc.end_date THEN 1 ELSE cp.completed END
     WHERE cp.challenge_id = ? AND cp.student_id = ?`,
    [challengeId, resolvedStudentId]
  );

  const ranking = await rankingByChallenge(tenantId, challengeId, 3);

  return {
    challenge,
    student_id: resolvedStudentId,
    requested_points: requestedPoints,
    awarded_points: awardedPoints,
    weekly_points_limit: weeklyPointsLimit || null,
    limit_reached: Boolean(weeklyPointsLimit && currentPoints + awardedPoints >= weeklyPointsLimit),
    top_three: ranking
  };
}

module.exports = {
  listChallenges,
  createChallenge,
  toggleChallenge,
  rankingByChallenge,
  completeChallenge,
  getChallengeById
};
