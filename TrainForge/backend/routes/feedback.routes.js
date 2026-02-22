const express = require('express');
const { postFeedback, getFeedback } = require('../controllers/feedback.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles, denyTenantRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authRequired, denyTenantRoles('MASTER_ADMIN'));

router.post('/', postFeedback);
router.get('/', allowRoles('admin', 'trainer'), getFeedback);

module.exports = router;
