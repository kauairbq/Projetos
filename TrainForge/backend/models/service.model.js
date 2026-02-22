const { query } = require('../utils/db');
const { canManage } = require('../utils/roles');

async function getServiceSettings(tenantId) {
  const rows = await query(
    `SELECT id, name, type, email
     FROM tenants
     WHERE id = ?
     LIMIT 1`,
    [tenantId]
  );

  if (!rows[0]) return null;
  return {
    tenant_id: rows[0].id,
    tenant_name: rows[0].name,
    tenant_type: rows[0].type,
    notification_email: rows[0].email || ''
  };
}

async function updateServiceSettings(tenantId, payload) {
  await query(
    `UPDATE tenants
     SET email = ?, updated_at = NOW()
     WHERE id = ?`,
    [payload.notification_email || null, tenantId]
  );

  return getServiceSettings(tenantId);
}

async function listCatalog(tenantId, activeOnly = false) {
  if (activeOnly) {
    return query(
      `SELECT sc.*, tu.full_name AS created_by_name
       FROM service_catalog sc
       LEFT JOIN tenant_users tu ON tu.id = sc.created_by_user_id
       WHERE sc.tenant_id = ? AND sc.is_active = 1
       ORDER BY sc.created_at DESC`,
      [tenantId]
    );
  }

  return query(
    `SELECT sc.*, tu.full_name AS created_by_name
     FROM service_catalog sc
     LEFT JOIN tenant_users tu ON tu.id = sc.created_by_user_id
     WHERE sc.tenant_id = ?
     ORDER BY sc.created_at DESC`,
    [tenantId]
  );
}

async function createCatalogItem(payload) {
  const result = await query(
    `INSERT INTO service_catalog (tenant_id, name, description, is_active, created_by_user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [
      payload.tenant_id,
      payload.name,
      payload.description || null,
      payload.is_active ?? 1,
      payload.created_by_user_id
    ]
  );

  const rows = await query('SELECT * FROM service_catalog WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0] || null;
}

async function toggleCatalogItem(tenantId, id, isActive) {
  await query(
    'UPDATE service_catalog SET is_active = ? WHERE tenant_id = ? AND id = ?',
    [isActive ? 1 : 0, tenantId, id]
  );
  const rows = await query('SELECT * FROM service_catalog WHERE tenant_id = ? AND id = ? LIMIT 1', [tenantId, id]);
  return rows[0] || null;
}

async function deleteCatalogItem(tenantId, id) {
  const existing = await query(
    'SELECT id, name, is_active FROM service_catalog WHERE tenant_id = ? AND id = ? LIMIT 1',
    [tenantId, id]
  );
  if (!existing[0]) {
    return null;
  }

  await query('DELETE FROM service_catalog WHERE tenant_id = ? AND id = ?', [tenantId, id]);
  return existing[0];
}

async function createServiceRequest(payload) {
  const result = await query(
    `INSERT INTO service_requests (tenant_id, service_id, requested_by_user_id, notes, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [payload.tenant_id, payload.service_id, payload.requested_by_user_id || null, payload.notes || null]
  );

  const rows = await query(
    `SELECT sr.*, sc.name AS service_name
     FROM service_requests sr
     JOIN service_catalog sc ON sc.id = sr.service_id
     WHERE sr.id = ?
     LIMIT 1`,
    [result.insertId]
  );

  return rows[0] || null;
}

async function listServiceRequests(user) {
  const isManager = canManage(user.role);
  const rows = await query(
    isManager
      ? `SELECT sr.*, sc.name AS service_name, tu.full_name AS requested_by_name
         FROM service_requests sr
         JOIN service_catalog sc ON sc.id = sr.service_id
         LEFT JOIN tenant_users tu ON tu.id = sr.requested_by_user_id
         WHERE sr.tenant_id = ?
         ORDER BY sr.created_at DESC`
      : `SELECT sr.*, sc.name AS service_name
         FROM service_requests sr
         JOIN service_catalog sc ON sc.id = sr.service_id
         WHERE sr.tenant_id = ? AND sr.requested_by_user_id = ?
         ORDER BY sr.created_at DESC`,
    isManager ? [user.tenant_id] : [user.tenant_id, user.id]
  );

  return rows;
}

async function updateServiceRequestStatus(tenantId, id, status) {
  await query(
    'UPDATE service_requests SET status = ? WHERE tenant_id = ? AND id = ?',
    [status, tenantId, id]
  );
  const rows = await query(
    'SELECT * FROM service_requests WHERE tenant_id = ? AND id = ? LIMIT 1',
    [tenantId, id]
  );
  return rows[0] || null;
}

async function createQuote(payload) {
  const notesParts = [];
  if (payload.notes) notesParts.push(payload.notes);
  if (payload.extra_service_request) {
    notesParts.push(`Pedido adicional: ${payload.extra_service_request}`);
  }
  const notes = notesParts.join('\n\n') || null;

  const result = await query(
    `INSERT INTO quote_requests (tenant_id, service_request_id, student_id, budget_estimate, notes, status)
     VALUES (?, ?, ?, ?, ?, 'sent')`,
    [
      payload.tenant_id,
      payload.service_request_id || null,
      payload.student_id || null,
      payload.budget_estimate || null,
      notes
    ]
  );

  const rows = await query(
    `SELECT q.*, s.full_name AS student_name
     FROM quote_requests q
     LEFT JOIN students s ON s.id = q.student_id
     WHERE q.id = ?
     LIMIT 1`,
    [result.insertId]
  );
  return rows[0] || null;
}

async function listQuotes(user) {
  const isManager = canManage(user.role);
  return query(
    isManager
      ? `SELECT q.*, s.full_name AS student_name
         FROM quote_requests q
         LEFT JOIN students s ON s.id = q.student_id
         WHERE q.tenant_id = ?
         ORDER BY q.created_at DESC`
      : `SELECT q.*, s.full_name AS student_name
         FROM quote_requests q
         LEFT JOIN students s ON s.id = q.student_id
         WHERE q.tenant_id = ?
         ORDER BY q.created_at DESC`,
    [user.tenant_id]
  );
}

module.exports = {
  getServiceSettings,
  updateServiceSettings,
  listCatalog,
  createCatalogItem,
  toggleCatalogItem,
  deleteCatalogItem,
  createServiceRequest,
  listServiceRequests,
  updateServiceRequestStatus,
  createQuote,
  listQuotes
};
