const { query } = require('../utils/db');
const { canManage } = require('../utils/roles');
const { sendMail } = require('../utils/mailer');

function normalizeTargetScope(input) {
  const value = String(input || '').toUpperCase().trim();
  if (value === 'GYM') return 'GYM';
  if (value === 'BOTH') return 'BOTH';
  return 'PERSONAL';
}

function targetScopeExpr(alias = 'rte') {
  return `COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${alias}.meta_json, '$.target_scope')), 'PERSONAL')`;
}

async function listSupportRecipientEmails(tenantId, targetScope) {
  const scope = normalizeTargetScope(targetScope);
  let roleFilter = `('PERSONAL')`;

  if (scope === 'GYM') {
    roleFilter = `('GYM_STAFF', 'MASTER_ADMIN')`;
  } else if (scope === 'BOTH') {
    roleFilter = `('PERSONAL', 'GYM_STAFF', 'MASTER_ADMIN')`;
  }

  const rows = await query(
    `SELECT DISTINCT email
     FROM tenant_users
     WHERE tenant_id = ?
       AND is_active = 1
       AND email IS NOT NULL
       AND email <> ''
       AND role IN ${roleFilter}`,
    [tenantId]
  );

  return rows.map((row) => row.email).filter(Boolean);
}

async function createSupportTicket(payload) {
  const targetScope = normalizeTargetScope(payload.target_scope);

  const result = await query(
    `INSERT INTO support_tickets
      (tenant_id, opened_by_user_id, category, priority, subject, status)
     VALUES (?, ?, ?, ?, ?, 'open')`,
    [
      payload.tenant_id,
      payload.opened_by_user_id || null,
      payload.category || 'QUESTION',
      payload.priority || 'MEDIUM',
      payload.subject
    ]
  );

  const ticketId = result.insertId;

  await query(
    `INSERT INTO support_ticket_messages (ticket_id, author_type, author_user_id, message)
     VALUES (?, 'CLIENT', ?, ?)`,
    [ticketId, payload.opened_by_user_id || null, payload.message]
  );

  await query(
    `INSERT INTO support_ticket_events (ticket_id, event_type, meta_json)
     VALUES (?, 'STATUS_CHANGE', ?)`,
    [ticketId, JSON.stringify({ from: null, to: 'open' })]
  );

  // Encaminhamento do suporte para PERSONAL, GYM ou BOTH.
  await query(
    `INSERT INTO support_ticket_events (ticket_id, event_type, meta_json)
     VALUES (?, 'ASSIGNED', ?)`,
    [ticketId, JSON.stringify({ target_scope: targetScope })]
  );

  const recipients = await listSupportRecipientEmails(payload.tenant_id, targetScope);
  if (recipients.length > 0) {
    await sendMail({
      to: recipients[0],
      bcc: recipients.slice(1),
      subject: `TrainForge - Novo ticket (${targetScope})`,
      text: `Novo ticket de suporte.\nAssunto: ${payload.subject}\nDestino: ${targetScope}\nMensagem: ${payload.message}`
    });
  }

  const rows = await query(
    `SELECT
        st.*,
        ${targetScopeExpr('rte')} AS target_scope
     FROM support_tickets st
     LEFT JOIN support_ticket_events rte
       ON rte.id = (
         SELECT e2.id
         FROM support_ticket_events e2
         WHERE e2.ticket_id = st.id AND e2.event_type = 'ASSIGNED'
         ORDER BY e2.id DESC
         LIMIT 1
       )
     WHERE st.id = ?
     LIMIT 1`,
    [ticketId]
  );

  return rows[0] || null;
}

async function listSupportTickets(user) {
  const isManager = canManage(user.role);
  const scopeExpr = targetScopeExpr('rte');

  const managerBaseSql = `SELECT
          st.*,
          tu.full_name,
          tu.email,
          ${scopeExpr} AS target_scope
         FROM support_tickets st
         LEFT JOIN tenant_users tu ON tu.id = st.opened_by_user_id
         LEFT JOIN support_ticket_events rte
           ON rte.id = (
             SELECT e2.id
             FROM support_ticket_events e2
             WHERE e2.ticket_id = st.id AND e2.event_type = 'ASSIGNED'
             ORDER BY e2.id DESC
             LIMIT 1
           )
         WHERE st.tenant_id = ?`;

  let managerSql = managerBaseSql;
  const params = [user.tenant_id];
  const tenantRole = String(user.tenantRole || '').toUpperCase();

  if (tenantRole === 'PERSONAL') {
    managerSql += ` AND ${scopeExpr} IN ('PERSONAL', 'BOTH')`;
  } else if (tenantRole === 'GYM_STAFF') {
    managerSql += ` AND ${scopeExpr} IN ('GYM', 'BOTH')`;
  }

  managerSql += ' ORDER BY st.created_at DESC';

  return query(
    isManager
      ? managerSql
      : `SELECT
            st.*,
            ${scopeExpr} AS target_scope
         FROM support_tickets st
         LEFT JOIN support_ticket_events rte
           ON rte.id = (
             SELECT e2.id
             FROM support_ticket_events e2
             WHERE e2.ticket_id = st.id AND e2.event_type = 'ASSIGNED'
             ORDER BY e2.id DESC
             LIMIT 1
           )
         WHERE st.tenant_id = ? AND opened_by_user_id = ?
         ORDER BY st.created_at DESC`,
    isManager ? params : [user.tenant_id, user.id]
  );
}

async function getTicketById(tenantId, ticketId) {
  const rows = await query(
    `SELECT
        st.*,
        ${targetScopeExpr('rte')} AS target_scope
     FROM support_tickets st
     LEFT JOIN support_ticket_events rte
       ON rte.id = (
         SELECT e2.id
         FROM support_ticket_events e2
         WHERE e2.ticket_id = st.id AND e2.event_type = 'ASSIGNED'
         ORDER BY e2.id DESC
         LIMIT 1
       )
     WHERE st.tenant_id = ? AND st.id = ?
     LIMIT 1`,
    [tenantId, ticketId]
  );

  return rows[0] || null;
}

async function getTicketMessages(tenantId, ticketId) {
  return query(
    `SELECT stm.*
     FROM support_ticket_messages stm
     JOIN support_tickets st ON st.id = stm.ticket_id
     WHERE st.tenant_id = ? AND stm.ticket_id = ?
     ORDER BY stm.created_at ASC`,
    [tenantId, ticketId]
  );
}

async function addTicketMessage({ tenant_id, ticket_id, author_type, author_user_id, message }) {
  const ticket = await getTicketById(tenant_id, ticket_id);
  if (!ticket) return null;

  const result = await query(
    `INSERT INTO support_ticket_messages (ticket_id, author_type, author_user_id, message)
     VALUES (?, ?, ?, ?)`,
    [ticket_id, author_type, author_user_id || null, message]
  );

  const rows = await query('SELECT * FROM support_ticket_messages WHERE id = ? LIMIT 1', [result.insertId]);
  return rows[0] || null;
}

async function updateTicketStatus({ tenant_id, ticket_id, status }) {
  const ticket = await getTicketById(tenant_id, ticket_id);
  if (!ticket) return null;

  await query(
    `UPDATE support_tickets
     SET status = ?, updated_at = NOW(), resolved_at = CASE WHEN ? IN ('resolved', 'closed') THEN NOW() ELSE NULL END
     WHERE tenant_id = ? AND id = ?`,
    [status, status, tenant_id, ticket_id]
  );

  await query(
    `INSERT INTO support_ticket_events (ticket_id, event_type, meta_json)
     VALUES (?, 'STATUS_CHANGE', ?)`,
    [ticket_id, JSON.stringify({ from: ticket.status, to: status })]
  );

  return getTicketById(tenant_id, ticket_id);
}

module.exports = {
  createSupportTicket,
  listSupportTickets,
  getTicketById,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus
};
