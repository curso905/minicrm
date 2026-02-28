import { sendMail } from '../services/email.js';

export async function test(req, res) {
  try {
    const secret = req.body?.secret ?? req.headers['x-email-test-secret'];
    if (secret !== process.env.EMAIL_TEST_SECRET) {
      return res.status(401).json({ error: 'Secret inválido' });
    }
    const to = req.body?.to ?? 'raguirre@changeandcode.com';
    const info = await sendMail({
      to,
      subject: 'Prueba desde Render',
      text: req.body?.text ?? 'Prueba de envío de correos desde mi backend en Render.',
    });
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (e) {
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
