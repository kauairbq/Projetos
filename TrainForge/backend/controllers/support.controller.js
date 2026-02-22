const { query } = require('../utils/db');
const {
  createSupportTicket,
  listSupportTickets,
  getTicketById,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus
} = require('../models/support.model');

async function getTickets(req, res, next) {
  try {
    const data = await listSupportTickets({
      id: req.user.sub,
      tenant_id: req.user.tid,
      role: req.user.role
    });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function postTicket(req, res, next) {
  try {
    const { subject, message, category, priority, targetScope } = req.body;
    if (!subject || !message) {
      return next({ status: 400, message: 'subject and message are required.' });
    }

    const data = await createSupportTicket({
      tenant_id: req.user.tid,
      opened_by_user_id: req.user.sub,
      subject,
      message,
      category: category || 'QUESTION',
      priority: priority || 'MEDIUM',
      target_scope: targetScope || 'PERSONAL'
    });

    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getTicketTimeline(req, res, next) {
  try {
    const ticketId = Number(req.params.id);
    const ticket = await getTicketById(req.user.tid, ticketId);
    if (!ticket) {
      return next({ status: 404, message: 'Ticket not found.' });
    }

    const [messages, events] = await Promise.all([
      getTicketMessages(req.user.tid, ticketId),
      query(
        `SELECT *
         FROM support_ticket_events
         WHERE ticket_id = ?
         ORDER BY created_at ASC`,
        [ticketId]
      )
    ]);

    return res.json({
      ok: true,
      data: {
        ticket,
        messages,
        events
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function postTicketMessage(req, res, next) {
  try {
    const ticketId = Number(req.params.id);
    const { message } = req.body;
    if (!message) {
      return next({ status: 400, message: 'message is required.' });
    }

    const data = await addTicketMessage({
      tenant_id: req.user.tid,
      ticket_id: ticketId,
      author_type: req.user.role === 'admin' ? 'ADMIN' : 'CLIENT',
      author_user_id: req.user.sub,
      message
    });

    if (!data) {
      return next({ status: 404, message: 'Ticket not found.' });
    }

    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function patchTicketStatus(req, res, next) {
  try {
    const ticketId = Number(req.params.id);
    const { status } = req.body;
    if (!status) {
      return next({ status: 400, message: 'status is required.' });
    }

    const data = await updateTicketStatus({
      tenant_id: req.user.tid,
      ticket_id: ticketId,
      status
    });

    if (!data) {
      return next({ status: 404, message: 'Ticket not found.' });
    }

    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getTickets,
  postTicket,
  getTicketTimeline,
  postTicketMessage,
  patchTicketStatus
};
