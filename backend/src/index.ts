import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import gstRouter from './routes/gst';
import irctcRouter from './routes/irctc';
import chatRouter from './routes/chatLeads';

const app = express();
const PORT = process.env.PORT || 5001;

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'daamcheck-api' }));

app.use('/api/v1/gst', gstRouter);
app.use('/api/v1/irctc', irctcRouter);
app.use('/api/v1/chat', chatRouter);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`DaamCheck API → http://localhost:${PORT}`));
});
