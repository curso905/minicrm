import { sendMail } from '../services/mail.js';

/** POST /api/mail/send — body: { to, subject, text } (opcional html) */
export async function send(req, res) {
  const { to, subject, text, html } = req.body ?? {};
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      error: 'Faltan campos: to, subject y text (o html)',
    });
  }
  try {
    const info = await sendMail({ to, subject, text, html });
    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error('Mail error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
