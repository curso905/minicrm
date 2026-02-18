import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import contactsRouter from './routes/contacts.js';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());
app.use('/api/contacts', contactsRouter);
app.use('/api/chat', chatRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error DB:', err.message);
    process.exit(1);
  });
