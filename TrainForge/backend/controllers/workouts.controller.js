const { createWorkout, leaderboard, metrics, historyByUser } = require('../models/workout.model');

async function getLeaderboard(req, res, next) {
  try {
    const limit = Math.max(3, Math.min(50, Number(req.query.limit || 10)));
    const data = await leaderboard(req.user.tid, limit);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getMetrics(req, res, next) {
  try {
    const isManager = req.user.role === 'admin' || req.user.role === 'trainer';
    const useUserId = isManager && req.query.scope === 'global' ? null : req.user.sub;
    const data = await metrics(req.user.tid, useUserId);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const isManager = req.user.role === 'admin' || req.user.role === 'trainer';
    const userId = isManager && req.query.userId ? Number(req.query.userId) : req.user.sub;
    const data = await historyByUser(req.user.tid, userId);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function postWorkout(req, res, next) {
  try {
    const { challengeId, title, modality, durationMinutes, calories, points, completedAt } = req.body;

    const data = await createWorkout({
      tenant_id: req.user.tid,
      actor_user_id: req.user.sub,
      student_id: req.body.studentId || null,
      challenge_id: challengeId || null,
      title: title || 'Workout',
      modality: modality || 'General',
      duration_minutes: Number(durationMinutes || 0),
      calories: Number(calories || 0),
      points: Number(points || 0),
      completed_at: completedAt || new Date()
    });

    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getLeaderboard,
  getMetrics,
  getHistory,
  postWorkout
};
