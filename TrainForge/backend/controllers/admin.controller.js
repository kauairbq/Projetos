const {
  overview,
  masterOverview,
  masterInsights,
  tenantInsights,
  tenantsKpis,
  revenueSeries,
  revenueBreakdown,
  masterActivity
} = require('../models/admin.model');
const { leaderboard } = require('../models/workout.model');
const {
  runBillingCycle,
  confirmPayment,
  billingOverviewByTenant
} = require('../models/billing.model');
const { query } = require('../utils/db');
const { createAuditLog } = require('../models/tenant.model');

function ensureMaster(req) {
  return req.user?.tenantRole === 'MASTER_ADMIN';
}

const ALLOWED_TICKET_STATUS = new Set(['open', 'in_progress', 'resolved', 'closed']);

async function getOverview(req, res, next) {
  try {
    const scope = req.query.scope || 'tenant';
    if (scope === 'master' && ensureMaster(req)) {
      const data = await masterOverview();
      return res.json({ ok: true, data });
    }

    const data = await overview(req.user.tid);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getRankings(req, res, next) {
  try {
    const data = await leaderboard(req.user.tid, 20);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getTenantsKpis(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can access tenant KPIs.' });
    }

    const data = await tenantsKpis();
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getBillingOverview(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can access billing overview.' });
    }

    const data = await billingOverviewByTenant();
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getRevenueSeries(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can access revenue series.' });
    }

    const months = Number(req.query.months || 12);
    const data = await revenueSeries({ months });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getRevenueBreakdown(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can access revenue breakdown.' });
    }

    const months = Number(req.query.months || 12);
    const data = await revenueBreakdown({ months });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getActivity(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can access activity.' });
    }

    const limit = Number(req.query.limit || 10);
    const data = await masterActivity({ limit });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getInsights(req, res, next) {
  try {
    if (ensureMaster(req)) {
      const data = await masterInsights();
      return res.json({ ok: true, data });
    }

    const data = await tenantInsights({
      tenantId: req.user.tid,
      tenantRole: req.user.tenantRole || 'PERSONAL',
      userId: req.user.sub
    });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function postRunBillingCycle(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can run billing cycle.' });
    }

    const data = await runBillingCycle();
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function postConfirmPayment(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can confirm payments.' });
    }

    const invoiceId = Number(req.params.invoiceId);
    const data = await confirmPayment({
      invoice_id: invoiceId,
      provider: req.body.provider,
      method: req.body.method,
      provider_ref: req.body.providerRef,
      amount: req.body.amount
    });

    if (!data) {
      return next({ status: 404, message: 'Invoice not found.' });
    }

    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getSystemTickets(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can access system tickets.' });
    }

    const status = String(req.query.status || '').trim().toLowerCase();
    const limit = Math.max(10, Math.min(300, Number(req.query.limit || 120)));

    const where = [];
    const params = [];

    if (status && ALLOWED_TICKET_STATUS.has(status)) {
      where.push('st.status = ?');
      params.push(status);
    }

    const rows = await query(
      `SELECT
          st.id,
          st.tenant_id,
          st.subject,
          st.category,
          st.priority,
          st.status,
          st.created_at,
          st.updated_at,
          t.name AS tenant_name,
          t.slug AS tenant_slug,
          tu.full_name AS opened_by_name
       FROM support_tickets st
       JOIN tenants t ON t.id = st.tenant_id
       LEFT JOIN tenant_users tu ON tu.id = st.opened_by_user_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY st.updated_at DESC, st.created_at DESC
       LIMIT ${limit}`,
      params
    );

    return res.json({ ok: true, data: rows });
  } catch (err) {
    return next(err);
  }
}

async function getSystemTicketTimeline(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can access ticket timeline.' });
    }

    const ticketId = Number(req.params.id);
    if (!ticketId) {
      return next({ status: 400, message: 'Invalid ticket id.' });
    }

    const [ticket] = await query(
      `SELECT
          st.*,
          t.name AS tenant_name,
          t.slug AS tenant_slug,
          tu.full_name AS opened_by_name
       FROM support_tickets st
       JOIN tenants t ON t.id = st.tenant_id
       LEFT JOIN tenant_users tu ON tu.id = st.opened_by_user_id
       WHERE st.id = ?
       LIMIT 1`,
      [ticketId]
    );

    if (!ticket) {
      return next({ status: 404, message: 'Ticket not found.' });
    }

    const [messages, events] = await Promise.all([
      query(
        `SELECT
            stm.*,
            tu.full_name AS author_name
         FROM support_ticket_messages stm
         LEFT JOIN tenant_users tu ON tu.id = stm.author_user_id
         WHERE stm.ticket_id = ?
         ORDER BY stm.created_at ASC`,
        [ticketId]
      ),
      query(
        `SELECT *
         FROM support_ticket_events
         WHERE ticket_id = ?
         ORDER BY created_at ASC`,
        [ticketId]
      )
    ]);

    return res.json({ ok: true, data: { ticket, messages, events } });
  } catch (err) {
    return next(err);
  }
}

async function postSystemTicketReply(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can reply to tickets.' });
    }

    const ticketId = Number(req.params.id);
    const message = String(req.body?.message || '').trim();
    if (!ticketId || !message) {
      return next({ status: 400, message: 'ticket id and message are required.' });
    }

    const [ticket] = await query(
      `SELECT id, tenant_id, status
       FROM support_tickets
       WHERE id = ?
       LIMIT 1`,
      [ticketId]
    );

    if (!ticket) {
      return next({ status: 404, message: 'Ticket not found.' });
    }

    const result = await query(
      `INSERT INTO support_ticket_messages (ticket_id, author_type, author_user_id, message)
       VALUES (?, 'ADMIN', ?, ?)`,
      [ticketId, req.user.sub, message]
    );

    const [created] = await query(
      `SELECT *
       FROM support_ticket_messages
       WHERE id = ?
       LIMIT 1`,
      [result.insertId]
    );

    await query(
      `UPDATE support_tickets
       SET updated_at = NOW()
       WHERE id = ?`,
      [ticketId]
    );

    await createAuditLog({
      tenantId: ticket.tenant_id,
      actorUserId: req.user.sub,
      action: 'support.ticket.reply',
      targetType: 'support_ticket',
      targetId: String(ticketId)
    });

    return res.status(201).json({ ok: true, data: created });
  } catch (err) {
    return next(err);
  }
}

async function patchSystemTicketStatus(req, res, next) {
  try {
    if (!ensureMaster(req)) {
      return next({ status: 403, message: 'Only master admin can update ticket status.' });
    }

    const ticketId = Number(req.params.id);
    const status = String(req.body?.status || '').trim().toLowerCase();
    if (!ticketId || !ALLOWED_TICKET_STATUS.has(status)) {
      return next({ status: 400, message: 'Valid ticket id and status are required.' });
    }

    const [current] = await query(
      `SELECT id, tenant_id, status
       FROM support_tickets
       WHERE id = ?
       LIMIT 1`,
      [ticketId]
    );

    if (!current) {
      return next({ status: 404, message: 'Ticket not found.' });
    }

    await query(
      `UPDATE support_tickets
       SET status = ?, updated_at = NOW(),
           resolved_at = CASE WHEN ? IN ('resolved', 'closed') THEN NOW() ELSE NULL END
       WHERE id = ?`,
      [status, status, ticketId]
    );

    await query(
      `INSERT INTO support_ticket_events (ticket_id, event_type, meta_json)
       VALUES (?, 'STATUS_CHANGE', ?)`,
      [
        ticketId,
        JSON.stringify({
          from: current.status,
          to: status,
          source: 'MASTER_ADMIN'
        })
      ]
    );

    await createAuditLog({
      tenantId: current.tenant_id,
      actorUserId: req.user.sub,
      action: 'support.ticket.status',
      targetType: 'support_ticket',
      targetId: String(ticketId),
      meta: { from: current.status, to: status }
    });

    const [updated] = await query(
      `SELECT *
       FROM support_tickets
       WHERE id = ?
       LIMIT 1`,
      [ticketId]
    );

    return res.json({ ok: true, data: updated });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getOverview,
  getRankings,
  getTenantsKpis,
  getBillingOverview,
  getRevenueSeries,
  getRevenueBreakdown,
  getActivity,
  getInsights,
  postRunBillingCycle,
  postConfirmPayment,
  getSystemTickets,
  getSystemTicketTimeline,
  postSystemTicketReply,
  patchSystemTicketStatus
};
