const { query } = require('../utils/db');
const {
  createTenant,
  listTenantsWithSubscription,
  createAuditLog
} = require('../models/tenant.model');

function sanitizeSlug(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getTenants(req, res, next) {
  try {
    if (req.user.tenantRole !== 'MASTER_ADMIN') {
      return next({ status: 403, message: 'Only master admin can list tenants.' });
    }

    const data = await listTenantsWithSubscription();
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function postTenant(req, res, next) {
  try {
    if (req.user.tenantRole !== 'MASTER_ADMIN') {
      return next({ status: 403, message: 'Only master admin can create tenants.' });
    }

    const type = req.body.type;
    const name = req.body.name;
    const slug = sanitizeSlug(req.body.slug || req.body.name);

    if (!type || !name || !slug) {
      return next({ status: 400, message: 'type, name and slug are required.' });
    }

    const tenant = await createTenant({
      type,
      name,
      slug,
      email: req.body.email,
      phone: req.body.phone,
      status: req.body.status || 'TRIAL'
    });

    if (req.body.planCode) {
      const [plan] = await query(
        `SELECT id
         FROM billing_plans
         WHERE code = ?
         LIMIT 1`,
        [req.body.planCode]
      );

      if (plan) {
        await query(
          `INSERT INTO subscriptions (
              tenant_id, plan_id, status, started_at, trial_ends_at,
              current_period_start, current_period_end, grace_until
           ) VALUES (?, ?, 'TRIAL', NOW(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL)`,
          [tenant.id, plan.id]
        );
      }
    }

    await createAuditLog({
      tenantId: tenant.id,
      actorUserId: req.user.sub,
      action: 'tenant.created',
      targetType: 'tenant',
      targetId: String(tenant.id),
      meta: { slug: tenant.slug, type: tenant.type }
    });

    return res.status(201).json({ ok: true, data: tenant });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getTenants,
  postTenant
};
