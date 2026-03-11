import nodemailer from 'nodemailer';

/**
 * Transporter SMTP de Resend (Nodemailer).
 * Docs: https://resend.com/docs/send-with-nodemailer-smtp
 */
export function getTransporter() {
  const pass = process.env.RESEND_API_KEY;
  if (!pass) return null;
  return nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: { user: 'resend', pass },
  });
}

export function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}
