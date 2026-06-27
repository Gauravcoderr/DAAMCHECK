import { Router, Request, Response } from 'express';

const router = Router();

export const IRCTC_PRICES = [
  { name: 'Veg Thali', category: 'Meals', maxPrice: 110 },
  { name: 'Non-Veg Thali', category: 'Meals', maxPrice: 135 },
  { name: 'Dal Makhani + Roti (4 pcs)', category: 'Meals', maxPrice: 80 },
  { name: 'Rajma Chawal', category: 'Meals', maxPrice: 80 },
  { name: 'Veg Fried Rice', category: 'Meals', maxPrice: 75 },
  { name: 'Chole Bhature', category: 'Meals', maxPrice: 70 },
  { name: 'Idli (4 pcs)', category: 'Breakfast', maxPrice: 30 },
  { name: 'Vada (2 pcs)', category: 'Breakfast', maxPrice: 30 },
  { name: 'Upma 250g', category: 'Breakfast', maxPrice: 30 },
  { name: 'Poha 250g', category: 'Breakfast', maxPrice: 25 },
  { name: 'Masala Dosa', category: 'Breakfast', maxPrice: 50 },
  { name: 'Bread Toast (4 slices)', category: 'Breakfast', maxPrice: 25 },
  { name: 'Tea 150ml', category: 'Beverages', maxPrice: 10 },
  { name: 'Coffee 150ml', category: 'Beverages', maxPrice: 15 },
  { name: 'Milk 200ml', category: 'Beverages', maxPrice: 18 },
  { name: 'Mineral Water 1L', category: 'Beverages', maxPrice: 15 },
  { name: 'Packaged Juice 200ml', category: 'Beverages', maxPrice: 35 },
  { name: 'Omelette (2 eggs)', category: 'Snacks', maxPrice: 35 },
  { name: 'Samosa (2 pcs)', category: 'Snacks', maxPrice: 20 },
  { name: 'Bread Pakoda (2 pcs)', category: 'Snacks', maxPrice: 20 },
  { name: 'Veg Puff', category: 'Snacks', maxPrice: 18 },
  { name: 'Cookies 100g', category: 'Snacks', maxPrice: 25 },
];

// GET /api/v1/irctc/prices
router.get('/prices', (_req: Request, res: Response) => {
  const grouped = IRCTC_PRICES.reduce<Record<string, typeof IRCTC_PRICES>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );
  res.json({ prices: IRCTC_PRICES, grouped, updatedAt: new Date().toISOString() });
});

// POST /api/v1/irctc/check
// body: { items: [{ name: string, chargedPrice: number }] }
router.post('/check', (req: Request, res: Response) => {
  const { items } = req.body as { items: { name: string; chargedPrice: number }[] };

  if (!items?.length) return res.status(400).json({ error: 'items array required' });

  const results = items.map((item) => {
    const match = IRCTC_PRICES.find(
      (p) => p.name.toLowerCase() === item.name.toLowerCase()
    );
    if (!match) return { ...item, status: 'unknown', maxPrice: null, overcharge: 0 };
    const overcharge = Math.max(0, item.chargedPrice - match.maxPrice);
    return {
      ...item,
      maxPrice: match.maxPrice,
      status: overcharge > 0 ? 'overcharged' : 'ok',
      overcharge,
    };
  });

  const totalOvercharge = results.reduce((s, r) => s + r.overcharge, 0);

  return res.json({
    results,
    totalOvercharge,
    legal: totalOvercharge === 0,
    complaintNumber: '1800-110-139',
  });
});

export default router;
