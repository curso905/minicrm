import { sendMail } from '../services/email.js';

export async function test(req, res) {
  try {
    console.log('[test-email] Request received');
    const to = req.body?.to ?? 'raguirre@changeandcode.com';
    console.log('[test-email] Sending to', to);
    const info = await sendMail({
      to,
      subject: 'Prueba desde Render',
      text: req.body?.text ?? 'Prueba de envío de correos desde mi backend en Render.',
    });
    console.log('[test-email] Sent', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (e) {
    console.error('[test-email] Error', e.message);
    res.status(500).json({ error: e.message });
  }
}

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
