const { query } = require('../utils/db');
const { toAppRole } = require('../utils/roles');

function hydrate(row) {
  if (!row) return null;

  let paymentInfo = row.payment_info;
  if (typeof paymentInfo === 'string') {
    try {
      paymentInfo = JSON.parse(paymentInfo);
    } catch {
      // keep original
    }
  }

  const tenantRole = row.role || row.tenant_role;

  return {
    id: row.id,
    tenant_id: row.tenant_id,
    tenant_slug: row.tenant_slug,
    tenant_name: row.tenant_name,
    full_name: row.full_name,
    email: row.email,
    password_hash: row.password_hash,
    tenant_role: tenantRole,
    role: toAppRole(tenantRole),
    birth_date: row.birth_date || null,
    address: row.address || null,
    payment_info: paymentInfo || null,
    mode: row.mode || 'online',
    is_active: Number(row.is_active) === 1,
    email_verified_at: row.email_verified_at || null,
    last_login_at: row.last_login_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function findByEmail(email) {
  const rows = await query(
    `SELECT
        tu.*,
        t.slug AS tenant_slug,
        t.name AS tenant_name
     FROM tenant_users tu
     JOIN tenants t ON t.id = tu.tenant_id
     WHERE tu.email = ?
     LIMIT 1`,
    [email]
  );
  return hydrate(rows[0]);
}

async function findById(id) {
  const rows = await query(
    `SELECT
        tu.*,
        t.slug AS tenant_slug,
        t.name AS tenant_name
     FROM tenant_users tu
     JOIN tenants t ON t.id = tu.tenant_id
     WHERE tu.id = ?
     LIMIT 1`,
    [id]
  );
  return hydrate(rows[0]);
}

async function listTenantUsers(tenantId, tenantRole) {
  const sql = tenantRole
    ? `SELECT id, tenant_id, full_name, email, role, mode, is_active, email_verified_at, created_at
       FROM tenant_users
       WHERE tenant_id = ? AND role = ?
       ORDER BY created_at DESC`
    : `SELECT id, tenant_id, full_name, email, role, mode, is_active, email_verified_at, created_at
       FROM tenant_users
       WHERE tenant_id = ?
       ORDER BY created_at DESC`;

  const rows = tenantRole ? await query(sql, [tenantId, tenantRole]) : await query(sql, [tenantId]);
  return rows.map((row) => ({
    ...row,
    role: toAppRole(row.role),
    tenant_role: row.role
  }));
}

async function touchLastLogin(userId) {
  await query('UPDATE tenant_users SET last_login_at = NOW() WHERE id = ?', [userId]);
}

async function createTenantUser(payload) {
  const result = await query(
    `INSERT INTO tenant_users
      (tenant_id, role, full_name, email, password_hash, birth_date, address, payment_info, mode, is_active, email_verified_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.tenant_id,
      payload.role,
      payload.full_name,
      payload.email,
      payload.password_hash,
      payload.birth_date || null,
      payload.address || null,
      payload.payment_info ? JSON.stringify(payload.payment_info) : null,
      payload.mode || 'online',
      payload.is_active ?? 1,
      payload.email_verified_at || null
    ]
  );

  return findById(result.insertId);
}

async function updateProfile(userId, payload) {
  const current = await findById(userId);
  if (!current) return null;

  const paymentInfo =
    payload.payment_info === undefined
      ? current.payment_info
      : payload.payment_info;

  await query(
    `UPDATE tenant_users
     SET full_name = ?, birth_date = ?, address = ?, payment_info = ?, mode = ?
     WHERE id = ?`,
    [
      payload.full_name ?? current.full_name,
      payload.birth_date ?? current.birth_date,
      payload.address ?? current.address,
      paymentInfo ? JSON.stringify(paymentInfo) : null,
      payload.mode ?? current.mode,
      userId
    ]
  );

  return findById(userId);
}

async function storeActivationToken({ tenant_user_id, token_hash, expires_at }) {
  await query(
    `UPDATE email_activation_tokens
     SET used_at = NOW()
     WHERE tenant_user_id = ? AND used_at IS NULL`,
    [tenant_user_id]
  );

  const result = await query(
    `INSERT INTO email_activation_tokens (tenant_user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [tenant_user_id, token_hash, expires_at]
  );

  return result.insertId;
}

async function findActivationByEmailToken(email, tokenHash) {
  const rows = await query(
    `SELECT
        eat.id AS token_id,
        tu.*,
        t.slug AS tenant_slug,
        t.name AS tenant_name
     FROM email_activation_tokens eat
     JOIN tenant_users tu ON tu.id = eat.tenant_user_id
     JOIN tenants t ON t.id = tu.tenant_id
     WHERE tu.email = ?
       AND eat.token_hash = ?
       AND eat.used_at IS NULL
       AND eat.expires_at >= NOW()
     ORDER BY eat.id DESC
     LIMIT 1`,
    [email, tokenHash]
  );

  return hydrate(rows[0]);
}

async function markActivationTokenUsedByEmailToken(email, tokenHash) {
  await query(
    `UPDATE email_activation_tokens eat
     JOIN tenant_users tu ON tu.id = eat.tenant_user_id
     SET eat.used_at = NOW()
     WHERE tu.email = ?
       AND eat.token_hash = ?
       AND eat.used_at IS NULL`,
    [email, tokenHash]
  );
}

async function markEmailVerified(userId) {
  await query(
    `UPDATE tenant_users
     SET email_verified_at = NOW()
     WHERE id = ?`,
    [userId]
  );

  return findById(userId);
}

module.exports = {
  hydrate,
  findByEmail,
  findById,
  listTenantUsers,
  touchLastLogin,
  createTenantUser,
  updateProfile,
  storeActivationToken,
  findActivationByEmailToken,
  markActivationTokenUsedByEmailToken,
  markEmailVerified
};
