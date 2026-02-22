const express = require('express');

const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const { getMyBilling, getPlans, postUpgrade } = require('../controllers/billing.controller');

const router = express.Router();

router.get('/me', authRequired, allowRoles('admin', 'trainer'), getMyBilling);
router.get('/plans', authRequired, allowRoles('admin', 'trainer'), getPlans);
router.post('/upgrade', authRequired, allowRoles('admin', 'trainer'), postUpgrade);

module.exports = router;

