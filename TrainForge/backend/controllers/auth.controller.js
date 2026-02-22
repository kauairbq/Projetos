const crypto = require('crypto');

const {
  sanitizeUser,
  findByEmail,
  findById,
  createUser
} = require('../models/user.model');
const {
  createSession,
  findSession,
  rotateSession,
  revokeSession,
  revokeAllSessions
} = require('../models/session.model');
const { isTenantBlocked, createAuditLog } = require('../models/tenant.model');
const {
  touchLastLogin,
  storeActivationToken,
  findActivationByEmailToken,
  markActivationTokenUsedByEmailToken,
  markEmailVerified
} = require('../models/tenantUser.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { sendMail } = require('../utils/mailer');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshConfig
} = require('../utils/jwt');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sessionExpiryDate() {
  const days = refreshConfig().expiresInDays;
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  return dt;
}

function activationExpiryDate() {
  const minutes = Number(process.env.ACTIVATION_TOKEN_EXPIRES_MINUTES || 20);
  const dt = new Date();
  dt.setMinutes(dt.getMinutes() + minutes);
  return dt;
}

function generateActivationToken() {
  return String(crypto.randomInt(100000, 999999));
}

function shouldExposeActivationToken() {
  const explicit = String(process.env.EXPOSE_ACTIVATION_TOKEN || '').toLowerCase();
  if (explicit === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

async function issueActivationToken(user, reason = 'activation') {
  const token = generateActivationToken();
  const tokenHash = hashToken(token);
  const expiresAt = activationExpiryDate();

  await storeActivationToken({
    tenant_user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt
  });

  await sendMail({
    to: user.email,
    subject: 'TrainForge - Codigo de ativacao',
    text: `Ola ${user.full_name}, o teu codigo de ativacao e ${token}. Expira em ${process.env.ACTIVATION_TOKEN_EXPIRES_MINUTES || 20} minutos.`,
    html: `<p>Ola <strong>${user.full_name}</strong>,</p><p>O teu codigo de ativacao e:</p><h2>${token}</h2><p>Expira em ${process.env.ACTIVATION_TOKEN_EXPIRES_MINUTES || 20} minutos.</p>`
  });

  await createAuditLog({
    tenantId: user.tenant_id,
    actorUserId: user.id,
    action: 'auth.activation_token_issued',
    targetType: 'tenant_user',
    targetId: String(user.id),
    meta: { reason }
  });

  return { token, expiresAt };
}

function activationPayload(user, tokenInfo) {
  const payload = {
    required: true,
    email: user.email,
    expires_at: tokenInfo.expiresAt
  };

  if (shouldExposeActivationToken()) {
    payload.debug_token = tokenInfo.token;
  }

  return payload;
}

async function register(req, res, next) {
  try {
    const {
      fullName,
      email,
      password,
      birthDate,
      address,
      paymentInfo,
      mode,
      tenantSlug
    } = req.body;

    if (!fullName || !email || !password) {
      return next({ status: 400, message: 'fullName, email and password are required.' });
    }

    const normalizedEmail = String(email).toLowerCase();
    const existing = await findByEmail(normalizedEmail);
    if (existing) {
      return next({ status: 409, message: 'Email already registered.' });
    }

    const password_hash = await hashPassword(password);
    const created = await createUser({
      tenant_slug: tenantSlug || 'trainforge-internal',
      full_name: fullName,
      email: normalizedEmail,
      password_hash,
      role: 'PERSONAL',
      birth_date: birthDate || null,
      address: address || null,
      payment_info: paymentInfo || null,
      mode: mode || 'online',
      email_verified_at: null
    });

    await createAuditLog({
      tenantId: created.tenant_id,
      actorUserId: created.id,
      action: 'auth.register',
      targetType: 'tenant_user',
      targetId: String(created.id),
      meta: { email: created.email }
    });

    const tokenInfo = await issueActivationToken(created, 'register');

    return res.status(201).json({
      ok: true,
      message: 'Conta criada. Valida o token enviado para o teu email para ativar o acesso.',
      data: sanitizeUser(created),
      activation: activationPayload(created, tokenInfo)
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next({ status: 400, message: 'Email and password are required.' });
    }

    const user = await findByEmail(String(email).toLowerCase());
    if (!user) {
      return next({ status: 401, message: 'Invalid credentials.' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return next({ status: 401, message: 'Invalid credentials.' });
    }

    if (Number(user.is_active) !== 1) {
      return next({ status: 403, message: 'User is disabled.' });
    }

    if (!user.email_verified_at) {
      return res.status(403).json({
        ok: false,
        error: 'Conta nao ativada. Valida o token enviado para o email antes de entrar.',
        activation_required: true,
        email: user.email
      });
    }

    const blocked = await isTenantBlocked(user.tenant_id);
    if (blocked) {
      return next({ status: 402, message: 'Access blocked due to pending payment.' });
    }

    const sessionToken = crypto.randomUUID();
    const refreshToken = signRefreshToken(user, sessionToken);
    const accessToken = signAccessToken(user, sessionToken);
    const refreshTokenHash = hashToken(refreshToken);

    await createSession({
      sessionToken,
      tenantUserId: user.id,
      refreshTokenHash,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip,
      expiresAt: sessionExpiryDate()
    });

    await touchLastLogin(user.id);
    await createAuditLog({
      tenantId: user.tenant_id,
      actorUserId: user.id,
      action: 'auth.login',
      targetType: 'session',
      targetId: sessionToken,
      meta: { ip: req.ip }
    });

    return res.json({
      ok: true,
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next({ status: 400, message: 'refreshToken is required.' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return next({ status: 401, message: 'Invalid refresh token.' });
    }

    const session = await findSession(payload.sid);
    if (!session || session.revoked_at) {
      return next({ status: 401, message: 'Session not available.' });
    }

    if (Number(session.tenant_user_id) !== Number(payload.sub)) {
      await revokeSession(payload.sid);
      return next({ status: 401, message: 'Session mismatch.' });
    }

    const incomingHash = hashToken(refreshToken);
    if (incomingHash !== session.refresh_token_hash) {
      await revokeSession(payload.sid);
      return next({ status: 401, message: 'Refresh token mismatch.' });
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await revokeSession(payload.sid);
      return next({ status: 401, message: 'Session expired.' });
    }

    const user = await findById(payload.sub);
    if (!user) {
      return next({ status: 401, message: 'User not found.' });
    }

    if (!user.email_verified_at) {
      await revokeSession(payload.sid);
      return res.status(403).json({
        ok: false,
        error: 'Conta nao ativada. Valida o token enviado para o email antes de entrar.',
        activation_required: true,
        email: user.email
      });
    }

    const blocked = await isTenantBlocked(user.tenant_id);
    if (blocked) {
      return next({ status: 402, message: 'Access blocked due to pending payment.' });
    }

    const nextRefreshToken = signRefreshToken(user, payload.sid);
    const nextAccessToken = signAccessToken(user, payload.sid);
    await rotateSession(payload.sid, hashToken(nextRefreshToken), sessionExpiryDate());

    return res.json({
      ok: true,
      user: sanitizeUser(user),
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken
    });
  } catch (err) {
    return next(err);
  }
}

async function requestActivationToken(req, res, next) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return next({ status: 400, message: 'email is required.' });
    }

    const user = await findByEmail(email);
    if (!user) {
      return res.json({ ok: true, message: 'Se o email existir, um novo token foi enviado.' });
    }

    if (Number(user.is_active) !== 1) {
      return next({ status: 403, message: 'User is disabled.' });
    }

    if (user.email_verified_at) {
      return res.json({ ok: true, message: 'Conta ja ativada.' });
    }

    const tokenInfo = await issueActivationToken(user, 'manual_request');

    return res.json({
      ok: true,
      message: 'Token de ativacao enviado.',
      activation: activationPayload(user, tokenInfo)
    });
  } catch (err) {
    return next(err);
  }
}

async function verifyActivationTokenController(req, res, next) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const token = String(req.body?.token || '').trim();

    if (!email || !token) {
      return next({ status: 400, message: 'email and token are required.' });
    }

    const row = await findActivationByEmailToken(email, hashToken(token));
    if (!row) {
      return next({ status: 400, message: 'Token invalido ou expirado.' });
    }

    await markActivationTokenUsedByEmailToken(email, hashToken(token));
    const verifiedUser = await markEmailVerified(row.id);

    await createAuditLog({
      tenantId: verifiedUser.tenant_id,
      actorUserId: verifiedUser.id,
      action: 'auth.activation_verified',
      targetType: 'tenant_user',
      targetId: String(verifiedUser.id)
    });

    return res.json({
      ok: true,
      message: 'Conta ativada com sucesso.',
      data: sanitizeUser(verifiedUser)
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await findById(req.user.sub);
    return res.json({ ok: true, data: sanitizeUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const sessionToken = req.user?.sid || req.body?.sessionToken;
    if (!sessionToken) {
      return next({ status: 400, message: 'sessionToken not provided.' });
    }

    await revokeSession(sessionToken);
    await createAuditLog({
      tenantId: req.user?.tid || null,
      actorUserId: req.user?.sub || null,
      action: 'auth.logout',
      targetType: 'session',
      targetId: sessionToken
    });

    return res.json({ ok: true, data: { revoked: true } });
  } catch (err) {
    return next(err);
  }
}

async function logoutAll(req, res, next) {
  try {
    await revokeAllSessions(req.user.sub);
    await createAuditLog({
      tenantId: req.user?.tid || null,
      actorUserId: req.user?.sub || null,
      action: 'auth.logout_all',
      targetType: 'session'
    });

    return res.json({ ok: true, data: { revoked_all: true } });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  requestActivationToken,
  verifyActivationTokenController,
  me,
  logout,
  logoutAll
};
