import nodemailer from 'nodemailer';
import dns from 'node:dns';

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;

let transporterPromise = null;
async function getTransporter() {
  if (!user || !pass) return null;
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    const { resolve4 } = dns.promises;
    const [ipv4] = await resolve4('smtp.gmail.com');
    return nodemailer.createTransport({
      host: ipv4,
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      tls: { servername: 'smtp.gmail.com' },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
    });
  })();
  return transporterPromise;
}

export async function sendMail({ to, subject, text, html }) {
  const transporter = await getTransporter();
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
