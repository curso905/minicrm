import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { connectDB } from './config/db.js';
import contactsRouter from './routes/contacts.js';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

function requireAuthApi(req, res, next) {
  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
  }
  next();
}

app.use(cors());
app.use(clerkMiddleware());
app.use(express.json());
app.use('/api/contacts', requireAuthApi, contactsRouter);
app.use('/api/chat', requireAuthApi, chatRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error DB:', err.message);
    process.exit(1);
  });
