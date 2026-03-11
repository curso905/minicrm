import { getTransporter, isMailConfigured } from '../config/mail.js';

/**
 * Envía un correo vía Resend (SMTP).
 * MAIL_FROM debe ser un remitente verificado en Resend (ej: "MiniCRM <onboarding@tudominio.com>").
 */
export async function sendMail({ to, subject, text, html }) {
  if (!isMailConfigured()) {
    throw new Error('Correo no configurado: RESEND_API_KEY y MAIL_FROM en .env');
  }
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM;
  return transporter.sendMail({
    from,
    to,
    subject,
    text: text ?? undefined,
    html: html ?? undefined,
  });
}
