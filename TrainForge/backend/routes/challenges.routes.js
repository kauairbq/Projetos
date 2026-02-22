const express = require('express');
const {
  getChallenges,
  postChallenge,
  patchChallengeToggle,
  getChallengeRanking,
  postChallengeComplete
} = require('../controllers/challenges.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { allowRoles, denyTenantRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authRequired, denyTenantRoles('MASTER_ADMIN'));

router.get('/', getChallenges);
router.get('/:id/ranking', getChallengeRanking);
router.post('/:id/complete', postChallengeComplete);
router.post('/', allowRoles('admin', 'trainer'), postChallenge);
router.patch('/:id/toggle', allowRoles('admin', 'trainer'), patchChallengeToggle);

module.exports = router;
