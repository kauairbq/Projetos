const { query } = require('../utils/db');
const { toAppRole } = require('../utils/roles');
const {
  findByEmail: findTenantUserByEmail,
  findById: findTenantUserById,
  createTenantUser,
  updateProfile
} = require('./tenantUser.model');
const { findTenantBySlug } = require('./tenant.model');

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    tenant_id: user.tenant_id,
    tenant_slug: user.tenant_slug || null,
    full_name: user.full_name,
    email: user.email,
    role: user.role || toAppRole(user.tenant_role),
    tenant_role: user.tenant_role || null,
    birth_date: user.birth_date || null,
    address: user.address || null,
    payment_info: user.payment_info || null,
    mode: user.mode || 'online',
    is_active: Number(user.is_active) === 1,
    email_verified_at: user.email_verified_at || null,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

async function findByEmail(email) {
  return findTenantUserByEmail(email);
}

async function findById(id) {
  return findTenantUserById(id);
}

async function resolveTenantId(tenantId, tenantSlug) {
  if (tenantId) return tenantId;

  const resolved = await findTenantBySlug(tenantSlug || 'trainforge-internal');
  if (!resolved) {
    throw new Error('Unable to resolve tenant for new user.');
  }

  return resolved.id;
}

async function createUser(payload) {
  const tenant_id = await resolveTenantId(payload.tenant_id, payload.tenant_slug);

  return createTenantUser({
    tenant_id,
    role: payload.role || 'PERSONAL',
    full_name: payload.full_name,
    email: payload.email,
    password_hash: payload.password_hash,
    birth_date: payload.birth_date || null,
    address: payload.address || null,
    payment_info: payload.payment_info || null,
    mode: payload.mode || 'online',
    is_active: payload.is_active ?? 1,
    email_verified_at: payload.email_verified_at || null
  });
}

async function listUsers({ tenantId, role }) {
  if (!tenantId) return [];

  if (role === 'client') {
    return query(
      `SELECT
          s.id,
          s.full_name,
          s.email,
          'client' AS role,
          s.birth_date,
          s.address,
          s.mode,
          s.status AS student_status,
          COALESCE(sm.billing_status, 'PENDING') AS billing_status,
          CASE
            WHEN s.status IN ('INACTIVE', 'BLOCKED') THEN 'DESATIVADO'
            WHEN COALESCE(sm.billing_status, 'PENDING') IN ('BLOCKED') THEN 'DESATIVADO'
            WHEN COALESCE(sm.billing_status, 'PENDING') IN ('PENDING', 'PAST_DUE') THEN 'PENDENTE'
            ELSE 'PAGO'
          END AS payment_status,
          1 AS is_active,
          s.created_at
       FROM students s
       LEFT JOIN student_memberships sm
         ON sm.id = (
           SELECT sm2.id
           FROM student_memberships sm2
           WHERE sm2.student_id = s.id
             AND sm2.tenant_id = s.tenant_id
           ORDER BY sm2.updated_at DESC, sm2.id DESC
           LIMIT 1
         )
       WHERE s.tenant_id = ?
       ORDER BY s.created_at DESC`,
      [tenantId]
    );
  }

  let rows;
  if (role === 'admin') {
    rows = await query(
      `SELECT id, full_name, email, role, birth_date, address, mode, is_active, email_verified_at, created_at
       FROM tenant_users
       WHERE tenant_id = ? AND role = 'MASTER_ADMIN'
       ORDER BY created_at DESC`,
      [tenantId]
    );
  } else if (role === 'trainer') {
    rows = await query(
      `SELECT id, full_name, email, role, birth_date, address, mode, is_active, email_verified_at, created_at
       FROM tenant_users
       WHERE tenant_id = ? AND role IN ('GYM_STAFF', 'PERSONAL')
       ORDER BY created_at DESC`,
      [tenantId]
    );
  } else {
    rows = await query(
      `SELECT id, full_name, email, role, birth_date, address, mode, is_active, email_verified_at, created_at
       FROM tenant_users
       WHERE tenant_id = ?
       ORDER BY created_at DESC`,
      [tenantId]
    );
  }

  return rows.map((row) => ({
    ...row,
    role: toAppRole(row.role),
    tenant_role: row.role
  }));
}

async function updateOwnProfile(userId, payload) {
  return updateProfile(userId, payload);
}

async function getUserHistory(userId) {
  const user = await findById(userId);
  if (!user) {
    return { workouts: [], requests: [], tickets: [], feedback: [] };
  }

  const [workouts, requests, tickets, feedback] = await Promise.all([
    query(
      `SELECT
          w.id,
          w.title,
          w.modality,
          w.duration_minutes,
          w.points,
          w.completed_at,
          wc.title AS challenge_title
       FROM workouts w
       LEFT JOIN weekly_challenges wc ON wc.id = w.challenge_id
       WHERE w.tenant_id = ? AND w.actor_user_id = ?
       ORDER BY w.completed_at DESC
       LIMIT 30`,
      [user.tenant_id, userId]
    ),
    query(
      `SELECT
          sr.id,
          sr.status,
          sr.notes,
          sr.created_at,
          sc.name AS service_name
       FROM service_requests sr
       JOIN service_catalog sc ON sc.id = sr.service_id
       WHERE sr.tenant_id = ? AND sr.requested_by_user_id = ?
       ORDER BY sr.created_at DESC
       LIMIT 30`,
      [user.tenant_id, userId]
    ),
    query(
      `SELECT
          st.id,
          st.subject,
          st.status,
          st.created_at,
          COALESCE(JSON_UNQUOTE(JSON_EXTRACT(rte.meta_json, '$.target_scope')), 'PERSONAL') AS target_scope
       FROM support_tickets st
       LEFT JOIN support_ticket_events rte
         ON rte.id = (
           SELECT e2.id
           FROM support_ticket_events e2
           WHERE e2.ticket_id = st.id AND e2.event_type = 'ASSIGNED'
           ORDER BY e2.id DESC
           LIMIT 1
         )
       WHERE st.tenant_id = ? AND st.opened_by_user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [user.tenant_id, userId]
    ),
    query(
      `SELECT id, subject, rating, created_at
       FROM feedback
       WHERE tenant_id = ? AND author_user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [user.tenant_id, userId]
    )
  ]);

  return { workouts, requests, tickets, feedback };
}

module.exports = {
  sanitizeUser,
  findByEmail,
  findById,
  createUser,
  listUsers,
  updateOwnProfile,
  getUserHistory
};
