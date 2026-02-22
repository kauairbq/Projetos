const {
  getTenantSubscriptionSummary,
  listActivePlans,
  requestPlanUpgrade
} = require('../models/billing.model');
const { createAuditLog } = require('../models/tenant.model');

async function getMyBilling(req, res, next) {
  try {
    const tenantId = req.user?.tid;
    if (!tenantId) return next({ status: 400, message: 'Missing tenant context.' });

    const data = await getTenantSubscriptionSummary(tenantId);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getPlans(_req, res, next) {
  try {
    const plans = await listActivePlans();
    return res.json({ ok: true, data: plans });
  } catch (err) {
    return next(err);
  }
}

async function postUpgrade(req, res, next) {
  try {
    const tenantId = req.user?.tid;
    if (!tenantId) return next({ status: 400, message: 'Missing tenant context.' });

    const planCode = String(req.body?.planCode || '').trim();
    if (!planCode) return next({ status: 400, message: 'planCode is required.' });

    const changed = await requestPlanUpgrade(tenantId, planCode);
    if (!changed) return next({ status: 404, message: 'Plan not found or inactive.' });

    await createAuditLog({
      tenantId,
      actorUserId: req.user?.sub || null,
      action: 'billing.upgrade_requested',
      targetType: 'subscription',
      targetId: String(changed.subscription_id || ''),
      meta: { plan_code: planCode }
    });

    const data = await getTenantSubscriptionSummary(tenantId);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMyBilling,
  getPlans,
  postUpgrade
};

