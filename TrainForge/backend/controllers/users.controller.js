const {
  sanitizeUser,
  listUsers,
  updateOwnProfile,
  getUserHistory,
  findById
} = require('../models/user.model');
const { createSupportTicket, listSupportTickets } = require('../models/support.model');

async function getMe(req, res, next) {
  try {
    const user = await findById(req.user.sub);
    return res.json({ ok: true, data: sanitizeUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const updated = await updateOwnProfile(req.user.sub, {
      full_name: req.body.fullName,
      birth_date: req.body.birthDate,
      address: req.body.address,
      payment_info: req.body.paymentInfo,
      mode: req.body.mode
    });

    return res.json({ ok: true, data: sanitizeUser(updated) });
  } catch (err) {
    return next(err);
  }
}

async function getMyHistory(req, res, next) {
  try {
    const history = await getUserHistory(req.user.sub);
    return res.json({ ok: true, data: history });
  } catch (err) {
    return next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const roleFilter = String(req.query.role || '').toLowerCase();
    const tenantRole = req.user.tenantRole || req.user.tenant_role || null;
    if (tenantRole === 'MASTER_ADMIN' && roleFilter === 'client') {
      return next({ status: 403, message: 'Master admin nao pode listar alunos diretamente.' });
    }

    const users = await listUsers({
      tenantId: req.user.tid,
      role: req.query.role || null
    });
    return res.json({ ok: true, data: users });
  } catch (err) {
    return next(err);
  }
}

async function createTicket(req, res, next) {
  try {
    const { subject, message, category, priority, targetScope } = req.body;
    if (!subject || !message) {
      return next({ status: 400, message: 'subject and message are required.' });
    }

    const ticket = await createSupportTicket({
      tenant_id: req.user.tid,
      opened_by_user_id: req.user.sub,
      subject,
      message,
      category: category || 'QUESTION',
      priority: priority || 'MEDIUM',
      target_scope: targetScope || 'PERSONAL'
    });

    return res.status(201).json({ ok: true, data: ticket });
  } catch (err) {
    return next(err);
  }
}

async function getTickets(req, res, next) {
  try {
    const tickets = await listSupportTickets({
      id: req.user.sub,
      tenant_id: req.user.tid,
      role: req.user.role
    });
    return res.json({ ok: true, data: tickets });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMe,
  updateMe,
  getMyHistory,
  getUsers,
  createTicket,
  getTickets
};
