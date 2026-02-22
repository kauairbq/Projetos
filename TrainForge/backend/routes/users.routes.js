const express = require('express');
const {
  getMe,
  updateMe,
  getMyHistory,
  getUsers,
  createTicket,
  getTickets
} = require('../controllers/users.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authRequired);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/me/history', getMyHistory);
router.get('/me/support', getTickets);
router.post('/me/support', createTicket);

router.get('/', allowRoles('admin', 'trainer'), getUsers);

module.exports = router;
