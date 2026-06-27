# DAAMCHECK — Claude Context

## Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS → Vercel
- **Backend**: Express + TypeScript + MongoDB (Mongoose) → Render
- **AI Chatbot**: Gemini 2.0 Flash (primary) → Groq llama-3.3-70b (fallback) — DaamBot
- **Font**: Geist (self-hosted via `next/font/local`, `./fonts/GeistVF.woff`) — CSS var `--font-geist-sans`
- **No PostgreSQL** — everything MongoDB. No Supabase.

## Key env vars (frontend)
```
NEXT_PUBLIC_API_URL   → backend base (e.g. https://your-backend.onrender.com/api/v1)
GEMINI_API_KEY        → DaamBot chatbot (server-side only)
GROQ_API_KEY          → DaamBot fallback (server-side only)
```

## Key env vars (backend)
```
PORT=5001
MONGODB_URI           → MongoDB Atlas connection string
FRONTEND_URL          → CORS origin whitelist
GEMINI_API_KEY        → if AI features added to backend
GROQ_API_KEY          → fallback
```

## Directory structure
```
daamcheck/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              Root layout — Nav + BottomNav, Geist font via localFont
│   │   │   ├── page.tsx                Homepage (Marquee → Hero → TrustStrip → Stats → ToolCards → HowItWorks → CtaBand → Footer)
│   │   │   ├── globals.css             Tailwind directives + font-tabular utility + tracking-tight2/3
│   │   │   ├── gst-checker/page.tsx    GST + service charge checker (client component)
│   │   │   ├── irctc-prices/page.tsx   IRCTC price cap list with search + filter (client component)
│   │   │   └── scan-bill/page.tsx      Upload photo / manual entry bill checker (client component)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Nav.tsx             Sticky header, desktop nav links with active state, "Scan a bill" CTA
│   │   │   │   ├── BottomNav.tsx       Mobile-only (md:hidden), 4 items, SVG icons, border-top-2 active
│   │   │   │   ├── Marquee.tsx         Dark bg, infinite scroll, green dots between items
│   │   │   │   └── Footer.tsx          Dark bg, newsletter form, 4-col link grid, amber category headings
│   │   │   └── home/
│   │   │       ├── Hero.tsx            Phone mockup (CSS-drawn), green badge, headline
│   │   │       ├── TrustStrip.tsx      NCH real logo (PNG), eDaakhil/INGRAM styled initials badges
│   │   │       ├── Stats.tsx           3-col stat grid, green-pale bg
│   │   │       ├── ToolCards.tsx       3 tool cards linking to each page
│   │   │       ├── HowItWorks.tsx      3 steps, dashed connector, green-pale bg
│   │   │       └── CtaBand.tsx         Full-width green CTA band → /scan-bill
│   │   ├── lib/
│   │   │   └── api.ts                  All fetch helpers (BASE_URL from NEXT_PUBLIC_API_URL)
│   │   └── types/
│   │       └── css.d.ts                declare module "*.css" — fixes IDE CSS import warning
│   ├── public/
│   │   └── logos/
│   │       └── nch.png                 Real NCH emblem (29KB PNG from consumerhelpline.gov.in)
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── tsconfig.json
│
└── backend/
    └── src/
        ├── routes/
        │   ├── gst.ts                  POST /api/v1/gst/check
        │   └── irctc.ts                GET /api/v1/irctc/prices, POST /api/v1/irctc/check
        ├── config/
        │   └── database.ts             mongoose.connect(MONGODB_URI)
        └── index.ts                    Express app, helmet, cors, rate limiter (30/min), /health
```

## Tailwind custom tokens
```typescript
colors: {
  green: { DEFAULT: "#059669", dark: "#047857", pale: "#ECFDF5", mid: "#A7F3D0" },
  amber: { DEFAULT: "#D97706", pale: "#FEF3C7" },
  red:   { DEFAULT: "#DC2626", pale: "#FEE2E2" },
  ink:   { DEFAULT: "#111827", 2: "#374151", 3: "#6B7280", 4: "#9CA3AF" },
  line:  { DEFAULT: "#E5E7EB", 2: "#F3F4F6", 3: "#F9FAFB" },
  dark:  "#0F172A",
},
fontFamily: { sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"], mono: ["var(--font-geist-mono)", "monospace"] },
letterSpacing: { tight2: "-0.03em", tight3: "-0.04em" },
keyframes: { marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } } },
animation: { marquee: "marquee 30s linear infinite" },
```

## API routes (backend)
All prefixed `/api/v1/`.

### `POST /gst/check`
**Body**: `{ amount: number, gstPct: number, servicePct?: number, roomRate?: number }`

**Logic**:
- `correctGst = roomRate >= 7500 ? 18 : 5`
- Service charge is illegal at any %, per CCPA 2022
- Violations array: `GST_OVERCHARGE` and/or `SERVICE_CHARGE`

**Response**:
```json
{
  "legal": false,
  "correctGstPct": 5,
  "gstCharged": 180,
  "gstCorrect": 50,
  "scAmount": 100,
  "totalOvercharge": 230,
  "violations": [
    { "type": "GST_OVERCHARGE", "message": "...", "law": "CGST Act Third Schedule / Notification 11/2017-CT(Rate)", "amount": 130 },
    { "type": "SERVICE_CHARGE", "message": "...", "law": "CCPA Guidelines on Unfair Trade Practices, July 2022", "amount": 100 }
  ],
  "complaintUrl": "https://consumerhelpline.gov.in"
}
```

### `GET /irctc/prices`
Returns `{ prices: IRCTCItem[], grouped: Record<string, IRCTCItem[]>, updatedAt: string }`

### `POST /irctc/check`
**Body**: `{ items: [{ name: string, chargedPrice: number }] }`

**Response**: `{ results, totalOvercharge, legal, complaintNumber: "1800-110-139" }`

### `GET /health`
Keep-alive endpoint. Ping via UptimeRobot every 5 min (Render free tier sleeps after 15 min).

## IRCTC price caps (22 items — hardcoded in backend/src/routes/irctc.ts)
| Category | Items |
|----------|-------|
| Meals | Veg Thali ₹110, Non-Veg Thali ₹135, Dal Makhani+Roti ₹80, Rajma Chawal ₹80, Veg Fried Rice ₹75, Chole Bhature ₹70 |
| Breakfast | Idli ₹30, Vada ₹30, Upma ₹30, Poha ₹25, Masala Dosa ₹50, Bread Toast ₹25 |
| Beverages | Tea ₹10, Coffee ₹15, Milk ₹18, Mineral Water ₹15, Juice ₹35 |
| Snacks | Omelette ₹35, Samosa ₹20, Bread Pakoda ₹20, Veg Puff ₹18, Cookies ₹25 |

Source: [menurates.irctc.co.in](https://menurates.irctc.co.in)

## Legal rules (important for AI context)
| Rule | Detail |
|------|--------|
| GST — restaurants | 5% (no ITC), applies to standalone restaurants and hotel food when room rate < ₹7,500/night |
| GST — luxury hotels | 18% (with ITC), applies when hotel room rate ≥ ₹7,500/night |
| Service charge | **Completely banned** since July 2022 under CCPA. Cannot be charged under any name. |
| IRCTC caps | Mandatory maximum prices per Railway Board circular. Not suggestions. |

## Frontend api.ts helpers
```typescript
checkGST({ amount, gstPct, servicePct?, roomRate? })    // POST /gst/check
getIRCTCPrices()                                          // GET /irctc/prices (next: { revalidate: 3600 })
checkIRCTCItems(items: { name, chargedPrice }[])         // POST /irctc/check
```

## Homepage section order
Marquee → Hero → TrustStrip → Stats → ToolCards → HowItWorks → CtaBand → Footer

## Nav links (desktop + mobile bottom nav)
Home (`/`) · GST Checker (`/gst-checker`) · IRCTC Prices (`/irctc-prices`) · Scan Bill (`/scan-bill`)

## Complaint portals referenced in UI
| Name | URL | Icon in TrustStrip |
|------|-----|--------------------|
| NCH Portal | consumerhelpline.gov.in | Real PNG logo (`/logos/nch.png`) |
| eDaakhil | edaakhil.nic.in | Styled initials badge (site blocks curl) |
| INGRAM | ingram.dpiit.gov.in | Styled initials badge (site blocks curl) |
| IRCTC Helpline | irctc.co.in | Styled initials badge |
| Consumer Forum | — | Styled initials badge |

## Important decisions / gotchas
- Geist font self-hosted — Next.js 14 template ships with `./fonts/GeistVF.woff`. No CDN needed.
- `src/types/css.d.ts` — `declare module "*.css"` — fixes VS Code TS error on `import "./globals.css"` when IDE uses built-in TS instead of workspace version
- HowItWorks connector line: z-index:0 on the dashed line, z-index:10 on step divs — keeps icons above connector
- TrustStrip portals: only NCH emblem successfully scraped (29KB PNG). eDaakhil/INGRAM/IRCTC block curl — use styled initials badges
- `trust proxy 1` set on Express — correct IP extraction for rate limiter behind Render/Vercel proxy
- IRCTC prices hardcoded in backend route (not DB) — they change rarely, hardcoding avoids a DB call on every page load
- Rate limit: 30 req/min per IP on all `/api/` routes
- `getIRCTCPrices()` has `next: { revalidate: 3600 }` — only works in Next.js Server Components; in client components it behaves as normal fetch
- Backend dbName: `daamcheck` (via MONGODB_URI)
- All 3 tool pages are `"use client"` components for search/filter/form interactivity

## DaamBot (planned / not yet built)
- Route: `frontend/src/app/api/chat/route.ts`
- Same pattern as reference project: Gemini 2.0 Flash → Groq llama-3.3-70b fallback
- System prompt: DaamCheck expert, knows all GST rules, IRCTC caps, CCPA 2022, complaint portals
- Rate limit: 5 req/IP/min
- Lead capture after 5 messages (save to MongoDB via backend route)
