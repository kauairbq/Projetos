const express = require('express');
const {
  getOverview,
  getRankings,
  getTenantsKpis,
  getBillingOverview,
  getRevenueSeries,
  getRevenueBreakdown,
  getActivity,
  getInsights,
  postRunBillingCycle,
  postConfirmPayment,
  getSystemTickets,
  getSystemTicketTimeline,
  postSystemTicketReply,
  patchSystemTicketStatus
} = require('../controllers/admin.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authRequired);

router.get('/insights', allowRoles('admin', 'trainer'), getInsights);
router.get('/overview', allowRoles('admin'), getOverview);
router.get('/rankings', allowRoles('admin'), getRankings);
router.get('/tenants-kpis', allowRoles('admin'), getTenantsKpis);
router.get('/billing/overview', allowRoles('admin'), getBillingOverview);
router.get('/revenue/series', allowRoles('admin'), getRevenueSeries);
router.get('/revenue/breakdown', allowRoles('admin'), getRevenueBreakdown);
router.get('/activity', allowRoles('admin'), getActivity);
router.post('/billing/run-cycle', allowRoles('admin'), postRunBillingCycle);
router.post('/billing/invoices/:invoiceId/confirm-payment', allowRoles('admin'), postConfirmPayment);
router.get('/tickets', allowRoles('admin'), getSystemTickets);
router.get('/tickets/:id/timeline', allowRoles('admin'), getSystemTicketTimeline);
router.post('/tickets/:id/reply', allowRoles('admin'), postSystemTicketReply);
router.patch('/tickets/:id/status', allowRoles('admin'), patchSystemTicketStatus);

module.exports = router;
