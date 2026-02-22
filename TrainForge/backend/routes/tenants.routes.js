const express = require('express');
const { getTenants, postTenant } = require('../controllers/tenants.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authRequired, allowRoles('admin'));

router.get('/', getTenants);
router.post('/', postTenant);

module.exports = router;
