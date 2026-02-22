const express = require('express');
const { getLanding } = require('../controllers/branding.controller');

const router = express.Router();

router.get('/:slug', getLanding);

module.exports = router;
