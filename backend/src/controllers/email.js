import { sendMail } from '../services/email.js';

export async function send(req, res) {
  try {
    const { to, subject, text, html } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'Faltan campos: to y subject son obligatorios' });
    }
    const info = await sendMail({ to, subject, text, html });
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
