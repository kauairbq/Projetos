const { query } = require('../utils/db');

async function findTenantBySlug(slug) {
  const rows = await query(
    `SELECT id, type, name, slug, email, phone, status, created_at, updated_at
     FROM tenants
     WHERE slug = ?
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

async function findTenantById(id) {
  const rows = await query(
    `SELECT id, type, name, slug, email, phone, status, created_at, updated_at
     FROM tenants
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function getActiveAccessBlock(tenantId) {
  const rows = await query(
    `SELECT id, tenant_id, reason, blocked_at, unblocked_at, note
     FROM access_blocks
     WHERE tenant_id = ? AND unblocked_at IS NULL
     ORDER BY blocked_at DESC
     LIMIT 1`,
    [tenantId]
  );
  return rows[0] || null;
}

async function isTenantBlocked(tenantId) {
  const block = await getActiveAccessBlock(tenantId);
  return Boolean(block);
}

async function listTenantsWithSubscription() {
  return query(
    `SELECT
        t.id,
        t.type,
        t.name,
        t.slug,
        t.status AS tenant_status,
        s.status AS subscription_status,
        s.current_period_end,
        s.grace_until,
        bp.code AS plan_code,
        bp.name AS plan_name
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id
     LEFT JOIN billing_plans bp ON bp.id = s.plan_id
     ORDER BY t.created_at DESC`
  );
}

async function createTenant(payload) {
  const result = await query(
    `INSERT INTO tenants (type, name, slug, email, phone, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.type,
      payload.name,
      payload.slug,
      payload.email || null,
      payload.phone || null,
      payload.status || 'TRIAL'
    ]
  );
  return findTenantById(result.insertId);
}

async function createAuditLog({ tenantId, actorUserId, action, targetType, targetId, meta }) {
  await query(
    `INSERT INTO audit_logs (tenant_id, actor_user_id, action, target_type, target_id, meta_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      tenantId || null,
      actorUserId || null,
      action,
      targetType || null,
      targetId || null,
      meta ? JSON.stringify(meta) : null
    ]
  );
}

module.exports = {
  findTenantBySlug,
  findTenantById,
  getActiveAccessBlock,
  isTenantBlocked,
  listTenantsWithSubscription,
  createTenant,
  createAuditLog
};
