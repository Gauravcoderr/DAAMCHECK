import { Router, Request, Response } from 'express';
import ChatLead from '../models/ChatLead';

const router = Router();

// POST /api/v1/chat/lead
router.post('/lead', async (req: Request, res: Response) => {
  const { name, email, query } = req.body as { name: string; email: string; query?: string };

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email required' });
  }

  try {
    await ChatLead.findOneAndUpdate(
      { email },
      { name, query },
      { upsert: true, new: true }
    );
    return res.json({ ok: true });
  } catch {
    return res.json({ ok: true }); // silently succeed — don't break UX on duplicate
  }
});

// GET /api/v1/chat/leads (admin use)
router.get('/leads', async (_req: Request, res: Response) => {
  const leads = await ChatLead.find().sort({ createdAt: -1 }).limit(200);
  return res.json({ leads, total: leads.length });
});

export default router;
