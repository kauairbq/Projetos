const {
  getBrandingBySlug,
  getLandingBySlug,
  upsertBranding
} = require('../models/branding.model');
const { createAuditLog } = require('../models/tenant.model');

async function getBranding(req, res, next) {
  try {
    const data = await getBrandingBySlug(req.params.slug);
    if (!data) {
      return next({ status: 404, message: 'Branding not found for slug.' });
    }
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getLanding(req, res, next) {
  try {
    const data = await getLandingBySlug(req.params.slug);
    if (!data) {
      return next({ status: 404, message: 'Landing not found for slug.' });
    }
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function saveBranding(req, res, next) {
  try {
    const tenantId =
      req.user.tenantRole === 'MASTER_ADMIN' && req.body.tenantId
        ? Number(req.body.tenantId)
        : req.user.tid;

    const data = await upsertBranding(tenantId, req.body);

    await createAuditLog({
      tenantId,
      actorUserId: req.user.sub,
      action: 'branding.updated',
      targetType: 'tenant_branding',
      targetId: String(tenantId)
    });

    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getBranding,
  getLanding,
  saveBranding
};
