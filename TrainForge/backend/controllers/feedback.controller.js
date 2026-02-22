const { createFeedback, listFeedback } = require('../models/feedback.model');
const { sendMail } = require('../utils/mailer');

async function postFeedback(req, res, next) {
  try {
    const { subject, message, rating } = req.body;
    if (!subject || !message) {
      return next({ status: 400, message: 'subject and message are required.' });
    }

    const data = await createFeedback({
      tenant_id: req.user.tid,
      author_user_id: req.user.sub,
      subject,
      message,
      rating: Number(rating || 5)
    });

    await sendMail({
      subject: `TrainForge feedback: ${subject}`,
      text: message
    });

    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getFeedback(req, res, next) {
  try {
    const data = await listFeedback(req.user.tid, Number(req.query.limit || 100));
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = { postFeedback, getFeedback };
