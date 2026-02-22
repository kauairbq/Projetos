const express = require('express');

const { health } = require('../controllers/health.controller');
const authRoutes = require('./auth.routes');
const userRoutes = require('./users.routes');
const challengeRoutes = require('./challenges.routes');
const workoutRoutes = require('./workouts.routes');
const serviceRoutes = require('./services.routes');
const feedbackRoutes = require('./feedback.routes');
const adminRoutes = require('./admin.routes');
const brandingRoutes = require('./branding.routes');
const landingRoutes = require('./landing.routes');
const supportRoutes = require('./support.routes');
const tenantsRoutes = require('./tenants.routes');
const billingRoutes = require('./billing.routes');

const router = express.Router();

router.get('/health', health);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/challenges', challengeRoutes);
router.use('/workouts', workoutRoutes);
router.use('/services', serviceRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);
router.use('/branding', brandingRoutes);
router.use('/landing', landingRoutes);
router.use('/support', supportRoutes);
router.use('/tenants', tenantsRoutes);
router.use('/billing', billingRoutes);

module.exports = router;
