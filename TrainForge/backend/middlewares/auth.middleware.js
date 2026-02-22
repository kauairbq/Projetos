const { verifyAccessToken } = require('../utils/jwt');

function authRequired(req, _res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return next({ status: 401, message: 'Missing access token.' });
  }

  try {
    req.user = verifyAccessToken(token);
    req.user.tid = req.user.tid || null;
    req.user.tenantRole = req.user.tenantRole || null;
    return next();
  } catch {
    return next({ status: 401, message: 'Invalid or expired access token.' });
  }
}

module.exports = { authRequired };
