const express = require('express');
const {
  getSettings,
  patchSettings,
  getCatalog,
  postCatalog,
  patchCatalogToggle,
  deleteCatalog,
  postRequest,
  getRequests,
  patchRequestStatus,
  postQuote,
  getQuotes
} = require('../controllers/services.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles, denyTenantRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authRequired, denyTenantRoles('MASTER_ADMIN'));

router.get('/settings', allowRoles('admin', 'trainer'), getSettings);
router.patch('/settings', allowRoles('admin', 'trainer'), patchSettings);

router.get('/catalog', getCatalog);
router.post('/catalog', allowRoles('admin', 'trainer'), postCatalog);
router.patch('/catalog/:id/toggle', allowRoles('admin', 'trainer'), patchCatalogToggle);
router.delete('/catalog/:id', allowRoles('admin', 'trainer'), deleteCatalog);

router.get('/requests', getRequests);
router.post('/requests', postRequest);
router.patch('/requests/:id/status', allowRoles('admin', 'trainer'), patchRequestStatus);

router.get('/quotes', getQuotes);
router.post('/quotes', allowRoles('admin', 'trainer'), postQuote);

module.exports = router;
