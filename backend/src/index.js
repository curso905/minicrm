import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import contactsRouter from './routes/contacts.js';
import chatRouter from './routes/chat.js';
import mailRouter from './routes/mail.js';
import stripeRouter from './routes/stripe.js';
import * as stripeCtrl from './controllers/stripe.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
// Webhook Stripe necesita body raw (antes de express.json)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeCtrl.webhook);
app.use(express.json());
app.use('/api/contacts', contactsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/mail', mailRouter);
app.use('/api/stripe', stripeRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error DB:', err.message);
    process.exit(1);
  });
