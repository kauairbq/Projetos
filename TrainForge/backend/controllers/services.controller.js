const {
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
} = require('../models/service.model');
const { sendMail } = require('../utils/mailer');

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

async function getSettings(req, res, next) {
  try {
    const data = await getServiceSettings(req.user.tid);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function patchSettings(req, res, next) {
  try {
    const { notificationEmail } = req.body;
    if (notificationEmail && !isValidEmail(notificationEmail)) {
      return next({ status: 400, message: 'notificationEmail is invalid.' });
    }

    const data = await updateServiceSettings(req.user.tid, {
      notification_email: notificationEmail || null
    });

    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getCatalog(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly !== 'false';
    const data = await listCatalog(req.user.tid, activeOnly);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function postCatalog(req, res, next) {
  try {
    const { name, description, isActive } = req.body;
    if (!name) {
      return next({ status: 400, message: 'name is required.' });
    }

    const data = await createCatalogItem({
      tenant_id: req.user.tid,
      name,
      description,
      is_active: isActive ?? 1,
      created_by_user_id: req.user.sub
    });

    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function patchCatalogToggle(req, res, next) {
  try {
    const data = await toggleCatalogItem(req.user.tid, Number(req.params.id), req.body.isActive);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function deleteCatalog(req, res, next) {
  try {
    const data = await deleteCatalogItem(req.user.tid, Number(req.params.id));
    if (!data) {
      return next({ status: 404, message: 'Service not found.' });
    }

    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function postRequest(req, res, next) {
  try {
    const { serviceId, notes } = req.body;
    if (!serviceId) {
      return next({ status: 400, message: 'serviceId is required.' });
    }

    const data = await createServiceRequest({
      tenant_id: req.user.tid,
      requested_by_user_id: req.user.sub,
      service_id: Number(serviceId),
      notes
    });

    const settings = await getServiceSettings(req.user.tid);

    await sendMail({
      subject: 'TrainForge - New service request',
      text: `${req.user.fullName} submitted a new request for ${data.service_name}.`
    });

    if (settings?.notification_email && isValidEmail(settings.notification_email)) {
      await sendMail({
        to: settings.notification_email,
        subject: 'TrainForge - Novo pedido de aluno',
        text: `Foi criado um novo pedido de servico (${data.service_name}).\nStatus: ${data.status}\nNotas: ${data.notes || '-'}`
      });
    }

    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getRequests(req, res, next) {
  try {
    const data = await listServiceRequests({
      id: req.user.sub,
      tenant_id: req.user.tid,
      role: req.user.role
    });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function patchRequestStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return next({ status: 400, message: 'status is required.' });
    }

    const data = await updateServiceRequestStatus(req.user.tid, Number(req.params.id), status);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function postQuote(req, res, next) {
  try {
    const { userId, serviceRequestId, budgetEstimate, notes, notificationEmail, extraServiceRequest } = req.body;
    if (!userId) {
      return next({ status: 400, message: 'userId is required.' });
    }
    if (notificationEmail && !isValidEmail(notificationEmail)) {
      return next({ status: 400, message: 'notificationEmail is invalid.' });
    }

    const data = await createQuote({
      tenant_id: req.user.tid,
      student_id: Number(userId),
      service_request_id: serviceRequestId ? Number(serviceRequestId) : null,
      budget_estimate: budgetEstimate ?? null,
      notes: notes || null,
      extra_service_request: extraServiceRequest || null
    });

    if (notificationEmail) {
      await updateServiceSettings(req.user.tid, { notification_email: notificationEmail });

      await sendMail({
        to: notificationEmail,
        subject: 'TrainForge - Orcamento emitido',
        text: `Foi emitido um novo orcamento.\nCliente ID: ${userId}\nValor: ${budgetEstimate ?? 'n/a'}\nNotas: ${notes || '-'}\nPedido extra: ${extraServiceRequest || '-'}`
      });
    }

    if (extraServiceRequest) {
      await sendMail({
        subject: 'TrainForge - Pedido de novos servicos',
        text: `Tenant: ${req.user.tid}\nSolicitante: ${req.user.fullName}\nPedido: ${extraServiceRequest}`
      });
    }

    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getQuotes(req, res, next) {
  try {
    const data = await listQuotes({
      id: req.user.sub,
      tenant_id: req.user.tid,
      role: req.user.role
    });
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getSettings,
  patchSettings,
  getCatalog,
  postCatalog,
  patchCatalogToggle,
  deleteCatalog,
  postRequest,
  getRequests,
  patchRequestStatus,
  postQuote,
  getQuotes
};
