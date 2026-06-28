import { Router, Request, Response } from 'express';

const router = Router();

// ─── Price List ───────────────────────────────────────────────────────────────

export const IRCTC_PRICES = [
  // Regular trains — meals
  { name: 'Veg Thali',                 aliases: ['veg meal', 'veg plate', 'thali veg', 'food veg'],             category: 'Meals',     maxPrice: 110 },
  { name: 'Non-Veg Thali',             aliases: ['non veg meal', 'nonveg thali', 'egg thali', 'food nonveg', 'egg meal', 'egg thali', 'nonveg meal'], category: 'Meals', maxPrice: 135 },
  { name: 'Dal Makhani + Roti (4 pcs)',aliases: ['dal makhani roti', 'dal roti', 'dal makhani'],                category: 'Meals',     maxPrice: 80  },
  { name: 'Rajma Chawal',              aliases: ['rajma rice', 'rajma'],                                         category: 'Meals',     maxPrice: 80  },
  { name: 'Veg Fried Rice',            aliases: ['fried rice', 'veg rice', 'pulav', 'veg pulav', 'pulao', 'veg pulao', 'fried rice veg'], category: 'Meals', maxPrice: 75 },
  { name: 'Chole Bhature',             aliases: ['chole bhatura', 'chhole bhature'],                             category: 'Meals',     maxPrice: 70  },
  { name: 'Paneer Curry',              aliases: ['paneer masala', 'paneer butter masala', 'paneer gravy'],       category: 'Meals',     maxPrice: 80  },
  { name: 'Chicken Curry',             aliases: ['chicken masala', 'chicken gravy'],                             category: 'Meals',     maxPrice: 100 },

  // Rajdhani / Shatabdi / Premium trains (Railway Board 2023 caps)
  { name: 'Rajdhani Veg Meal',         aliases: ['veg lunch', 'veg dinner', 'lunch veg', 'dinner veg'],         category: 'Rajdhani',  maxPrice: 155 },
  { name: 'Rajdhani Non-Veg Meal',     aliases: ['nonveg lunch', 'nonveg dinner', 'lunch nonveg', 'dinner nonveg'], category: 'Rajdhani', maxPrice: 185 },
  { name: 'Dinner',                    aliases: ['dinner meal', 'eve meal', 'night meal'],                       category: 'Rajdhani',  maxPrice: 185 },
  { name: 'Lunch',                     aliases: ['lunch meal', 'afternoon meal'],                                category: 'Rajdhani',  maxPrice: 155 },
  { name: 'Rajdhani Veg Breakfast',    aliases: ['veg breakfast', 'breakfast veg'],                              category: 'Rajdhani',  maxPrice: 90  },
  { name: 'Rajdhani Non-Veg Breakfast',aliases: ['nonveg breakfast', 'breakfast nonveg'],                       category: 'Rajdhani',  maxPrice: 100 },

  // Breakfast
  { name: 'Idli (4 pcs)',              aliases: ['idli', 'idly'],                                                category: 'Breakfast', maxPrice: 30  },
  { name: 'Vada (2 pcs)',              aliases: ['vada', 'wada', 'medu vada'],                                   category: 'Breakfast', maxPrice: 30  },
  { name: 'Upma 250g',                 aliases: ['upma'],                                                        category: 'Breakfast', maxPrice: 30  },
  { name: 'Poha 250g',                 aliases: ['poha', 'pohe'],                                                category: 'Breakfast', maxPrice: 25  },
  { name: 'Masala Dosa',               aliases: ['dosa', 'masala dose'],                                         category: 'Breakfast', maxPrice: 50  },
  { name: 'Bread Toast (4 slices)',    aliases: ['bread toast', 'toast'],                                        category: 'Breakfast', maxPrice: 25  },
  { name: 'Breakfast',                 aliases: ['morning meal', 'breakfast combo'],                             category: 'Breakfast', maxPrice: 90  },

  // Beverages
  { name: 'Tea 150ml',                 aliases: ['tea', 'chai', 'masala tea', 'masala chai'],                   category: 'Beverages', maxPrice: 10  },
  { name: 'Coffee 150ml',              aliases: ['coffee', 'hot coffee'],                                        category: 'Beverages', maxPrice: 15  },
  { name: 'Milk 200ml',                aliases: ['milk', 'hot milk'],                                           category: 'Beverages', maxPrice: 18  },
  { name: 'Mineral Water 1L',          aliases: ['water', 'mineral water', 'bisleri'],                          category: 'Beverages', maxPrice: 15  },
  { name: 'Packaged Juice 200ml',      aliases: ['juice', 'fruit juice', 'tetra juice'],                        category: 'Beverages', maxPrice: 35  },

  // Snacks
  { name: 'Omelette (2 eggs)',         aliases: ['omelette', 'egg omelette', 'plain omelette'],                  category: 'Snacks',    maxPrice: 35  },
  { name: 'Samosa (2 pcs)',            aliases: ['samosa'],                                                      category: 'Snacks',    maxPrice: 20  },
  { name: 'Bread Pakoda (2 pcs)',      aliases: ['bread pakoda', 'bread pakora'],                                category: 'Snacks',    maxPrice: 20  },
  { name: 'Veg Puff',                  aliases: ['puff', 'veg patty'],                                          category: 'Snacks',    maxPrice: 18  },
  { name: 'Cookies 100g',              aliases: ['cookies', 'biscuits'],                                         category: 'Snacks',    maxPrice: 25  },
];

// ─── Fuzzy Matching ───────────────────────────────────────────────────────────

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function overlap(a: string[], b: string[]): number {
  const matches = a.filter(t => b.some(u => u.includes(t) || t.includes(u)));
  return matches.length / Math.max(a.length, b.length, 1);
}

interface PriceEntry {
  name: string;
  aliases: string[];
  category: string;
  maxPrice: number;
}

function findBestMatch(input: string): PriceEntry | null {
  const inputTokens = tokenize(input);
  let best: PriceEntry | null = null;
  let bestScore = 0.4; // minimum threshold

  for (const entry of IRCTC_PRICES) {
    // Check canonical name
    const nameScore = overlap(inputTokens, tokenize(entry.name));
    if (nameScore > bestScore) { bestScore = nameScore; best = entry; }

    // Check aliases
    for (const alias of entry.aliases) {
      const aliasScore = overlap(inputTokens, tokenize(alias));
      if (aliasScore > bestScore) { bestScore = aliasScore; best = entry; }
    }
  }

  return best;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/prices', (_req: Request, res: Response) => {
  const grouped = IRCTC_PRICES.reduce<Record<string, PriceEntry[]>>(
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
// body: { items: [{ name: string, chargedPrice: number, qty?: number }] }
router.post('/check', (req: Request, res: Response) => {
  const { items } = req.body as { items: { name: string; chargedPrice: number; qty?: number }[] };
  if (!items?.length) return res.status(400).json({ error: 'items array required' });

  const results = items.map((item) => {
    const qty = Math.max(1, item.qty ?? 1);
    const match = findBestMatch(item.name);
    if (!match) return { ...item, qty, status: 'unknown', maxPrice: null, overcharge: 0, totalCharged: item.chargedPrice * qty, matchedName: null };
    const overchargePerUnit = Math.max(0, item.chargedPrice - match.maxPrice);
    const overcharge = overchargePerUnit * qty;
    return {
      ...item,
      qty,
      maxPrice: match.maxPrice,
      matchedName: match.name,
      totalCharged: item.chargedPrice * qty,
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
