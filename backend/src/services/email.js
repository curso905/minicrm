import nodemailer from 'nodemailer';

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;

const transporter = user && pass
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
  : null;

export async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    throw new Error('Email no configurado: define GMAIL_USER y GMAIL_APP_PASSWORD en .env');
  }
  return transporter.sendMail({
    from: user,
    to,
    subject,
    text: text ?? undefined,
    html: html ?? undefined,
  });
}
