const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user, pass }
  });

  return transporter;
}

async function sendMail({ to, cc, bcc, subject, text, html }) {
  // Backward compatibility with legacy .env keys.
  const notifyTo = to || process.env.MAIL_NOTIFY_TO || process.env.MAIL_TO;
  const from = process.env.SMTP_FROM || process.env.MAIL_FROM || 'TrainForge <no-reply@trainforge.local>';
  const tx = getTransporter();

  if (!tx || !notifyTo) {
    return { skipped: true };
  }

  await tx.sendMail({ from, to: notifyTo, cc, bcc, subject, text, html });
  return { sent: true };
}

module.exports = { sendMail };
