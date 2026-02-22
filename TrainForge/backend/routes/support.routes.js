const express = require('express');
const {
  getTickets,
  postTicket,
  getTicketTimeline,
  postTicketMessage,
  patchTicketStatus
} = require('../controllers/support.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authRequired);

router.get('/tickets', getTickets);
router.post('/tickets', postTicket);
router.get('/tickets/:id/timeline', getTicketTimeline);
router.post('/tickets/:id/messages', postTicketMessage);
router.patch('/tickets/:id/status', allowRoles('admin', 'trainer'), patchTicketStatus);

module.exports = router;
