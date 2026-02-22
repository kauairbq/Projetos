const express = require('express');
const {
  getLeaderboard,
  getMetrics,
  getHistory,
  postWorkout
} = require('../controllers/workouts.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { denyTenantRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authRequired, denyTenantRoles('MASTER_ADMIN'));

router.get('/leaderboard', getLeaderboard);
router.get('/metrics', getMetrics);
router.get('/history', getHistory);
router.post('/', postWorkout);

module.exports = router;
