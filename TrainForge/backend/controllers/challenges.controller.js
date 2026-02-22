const {
  listChallenges,
  createChallenge,
  toggleChallenge,
  rankingByChallenge,
  completeChallenge
} = require('../models/challenge.model');
const { createWorkout } = require('../models/workout.model');

function parseOptionalPositiveInt(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return NaN;
  }

  return Math.floor(parsed);
}

async function getChallenges(req, res, next) {
  try {
    const challenges = await listChallenges(req.user.tid);
    return res.json({ ok: true, data: challenges });
  } catch (err) {
    return next(err);
  }
}

async function postChallenge(req, res, next) {
  try {
    const {
      title,
      description,
      modality,
      weeklyTarget,
      pointsPerCompletion,
      pointsLimit,
      startsAt,
      endsAt,
      isActive
    } = req.body;

    if (!title || !startsAt || !endsAt) {
      return next({ status: 400, message: 'title, startsAt and endsAt are required.' });
    }

    const parsedLimit = parseOptionalPositiveInt(pointsLimit);
    if (Number.isNaN(parsedLimit)) {
      return next({ status: 400, message: 'pointsLimit must be a positive integer when provided.' });
    }

    const challenge = await createChallenge({
      tenant_id: req.user.tid,
      title,
      description,
      start_date: startsAt,
      end_date: endsAt,
      is_active: isActive ?? 1,
      created_by_user_id: req.user.sub,
      scoring_rules_json: {
        modality: modality || 'General',
        weekly_target: Number(weeklyTarget || 5),
        daily_completion: Number(pointsPerCompletion || 10),
        weekly_points_limit: parsedLimit
      }
    });

    return res.status(201).json({ ok: true, data: challenge });
  } catch (err) {
    return next(err);
  }
}

async function patchChallengeToggle(req, res, next) {
  try {
    const id = Number(req.params.id);
    const isActive = Number(req.body.isActive) === 1 || req.body.isActive === true;
    const challenge = await toggleChallenge(req.user.tid, id, isActive);
    return res.json({ ok: true, data: challenge });
  } catch (err) {
    return next(err);
  }
}

async function getChallengeRanking(req, res, next) {
  try {
    const id = Number(req.params.id);
    const top = Math.max(1, Math.min(10, Number(req.query.top || 3)));
    const ranking = await rankingByChallenge(req.user.tid, id, top);
    return res.json({ ok: true, data: ranking });
  } catch (err) {
    return next(err);
  }
}

async function postChallengeComplete(req, res, next) {
  try {
    const challengeId = Number(req.params.id);
    const { title, modality, durationMinutes, calories, points, studentId } = req.body;
    const completionPoints = Number(points || 10);

    const completion = await completeChallenge({
      tenantId: req.user.tid,
      challengeId,
      actorUserId: req.user.sub,
      studentId: studentId ? Number(studentId) : null,
      points: completionPoints,
      meta: {
        title: title || 'Challenge completion',
        modality: modality || 'General'
      }
    });

    const workout = await createWorkout({
      tenant_id: req.user.tid,
      actor_user_id: req.user.sub,
      student_id: completion.student_id,
      challenge_id: challengeId,
      title: title || 'Challenge completion',
      modality: modality || 'General',
      duration_minutes: Number(durationMinutes || 30),
      calories: Number(calories || 0),
      points: completion.awarded_points,
      completed_at: new Date()
    });

    return res.status(201).json({
      ok: true,
      data: {
        workout,
        challenge_completion: completion
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getChallenges,
  postChallenge,
  patchChallengeToggle,
  getChallengeRanking,
  postChallengeComplete
};
