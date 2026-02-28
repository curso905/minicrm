import 'dotenv/config';
import { sendMail } from '../src/services/email.js';

sendMail({
  to: 'raguirre@changeandcode.com',
  subject: 'Prueba miniCRM',
  text: 'Correo de prueba enviado desde el backend.',
})
  .then((info) => console.log('Enviado. messageId:', info.messageId))
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });
