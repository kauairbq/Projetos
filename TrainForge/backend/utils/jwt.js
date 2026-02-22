const jwt = require('jsonwebtoken');

function accessConfig() {
  const legacyTtl = Number(process.env.JWT_TTL || 0);
  const legacyExpires = legacyTtl > 0 ? `${legacyTtl}s` : null;
  return {
    secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'trainforge_access_dev_secret',
    expiresIn: process.env.JWT_ACCESS_EXPIRES || legacyExpires || '15m'
  };
}

function refreshConfig() {
  const legacyRefreshTtl = Number(process.env.REFRESH_TTL || 0);
  const legacyRefreshDays = legacyRefreshTtl > 0 ? Math.max(1, Math.ceil(legacyRefreshTtl / 86400)) : null;
  return {
    secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'trainforge_refresh_dev_secret',
    expiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS || legacyRefreshDays || 14)
  };
}

function signAccessToken(user, sessionToken) {
  const cfg = accessConfig();
  return jwt.sign(
    {
      sub: user.id,
      sid: sessionToken,
      tid: user.tenant_id || null,
      tslug: user.tenant_slug || null,
      tenantRole: user.tenant_role || user.role || null,
      role: user.app_role || user.role || 'trainer',
      email: user.email,
      fullName: user.full_name
    },
    cfg.secret,
    { expiresIn: cfg.expiresIn }
  );
}

function signRefreshToken(user, sessionToken) {
  const cfg = refreshConfig();
  return jwt.sign(
    {
      sub: user.id,
      sid: sessionToken,
      tid: user.tenant_id || null,
      type: 'refresh'
    },
    cfg.secret,
    { expiresIn: `${cfg.expiresInDays}d` }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessConfig().secret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshConfig().secret);
}

module.exports = {
  accessConfig,
  refreshConfig,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
