const express = require('express');
const { getBranding, saveBranding } = require('../controllers/branding.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/:slug', getBranding);
router.post('/', authRequired, allowRoles('admin', 'trainer'), saveBranding);

module.exports = router;
