const express = require('express');
const {
  register,
  login,
  refresh,
  requestActivationToken,
  verifyActivationTokenController,
  me,
  logout,
  logoutAll
} = require('../controllers/auth.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
router.post('/activation/request', authLimiter, requestActivationToken);
router.post('/activation/verify', authLimiter, verifyActivationTokenController);
router.get('/me', authRequired, me);
router.post('/logout', authRequired, logout);
router.post('/logout-all', authRequired, logoutAll);

module.exports = router;
