import { Router, Request, Response } from 'express';
import ChatLead from '../models/ChatLead';
import { adminAuth, createAdminToken } from '../middleware/adminAuth';

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'daamcheck123';

// POST /api/v1/admin/login — no auth required
router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.json({ token: createAdminToken(username) });
});

// GET /api/v1/admin/chat-leads — ra-data-simple-rest compatible
router.get('/chat-leads', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const start = parseInt((req.query['_start'] as string) ?? '0', 10);
    const end = parseInt((req.query['_end'] as string) ?? '10', 10);
    const sortField = (req.query['_sort'] as string) ?? 'createdAt';
    const sortOrder = (req.query['_order'] as string)?.toUpperCase() === 'ASC' ? 1 : -1;
    const searchQuery = req.query['_q'] as string | undefined;

    const filter: Record<string, unknown> = {};
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      filter['$or'] = [{ email: regex }, { name: regex }];
    }

    const [total, docs] = await Promise.all([
      ChatLead.countDocuments(filter),
      ChatLead.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(start)
        .limit(end - start)
        .lean(),
    ]);

    const records = docs.map((doc) => ({
      ...doc,
      id: (doc._id as { toString(): string }).toString(),
      _id: undefined,
    }));

    res.set('Content-Range', `chat-leads ${start}-${end}/${total}`);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat leads' });
  }
});

// DELETE /api/v1/admin/chat-leads/:id
router.delete('/chat-leads/:id', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await ChatLead.findByIdAndDelete(req.params['id']).lean();

    if (!doc) {
      res.status(404).json({ error: 'Chat lead not found' });
      return;
    }

    const record = {
      ...doc,
      id: (doc._id as { toString(): string }).toString(),
      _id: undefined,
    };

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chat lead' });
  }
});

export default router;
