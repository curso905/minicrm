/**
 * Prueba de envío: Resend + Nodemailer
 * Uso: node scripts/test-mail.mjs tu@correo.com
 */
import 'dotenv/config';
import { sendMail } from '../src/services/mail.js';

const to = process.argv[2];
if (!to) {
  console.error('Uso: node scripts/test-mail.mjs <destinatario@correo.com>');
  process.exit(1);
}

try {
  const info = await sendMail({
    to,
    subject: 'Prueba MiniCRM — Resend + Nodemailer',
    text: 'Si recibes esto, el dominio y SMTP están bien configurados.',
  });
  console.log('Enviado OK — messageId:', info.messageId);
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
