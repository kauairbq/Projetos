require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { apiLimiter } = require('./middlewares/rateLimit.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const apiRoutes = require('./routes');

const app = express();
const frontendDist = path.resolve(__dirname, '../frontend/dist');
const hasFrontendDist = fs.existsSync(frontendDist);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  if (hasFrontendDist) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }

  return res.json({ ok: true, service: 'TrainForge API', version: 'v1' });
});

app.get(['/personal/:slug/adm', '/gym/:slug/adm'], (_req, res) => {
  const target = process.env.SAAS_ADMIN_LOGIN_URL || '/saas/adm';
  return res.redirect(302, target);
});

app.get('/saas/adm', (_req, res) => {
  return res.json({
    ok: true,
    message: 'TrainForge admin login endpoint.',
    login: '/api/v1/auth/login'
  });
});

app.use('/api/v1', apiLimiter, apiRoutes);

if (hasFrontendDist) {
  app.use(express.static(frontendDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
