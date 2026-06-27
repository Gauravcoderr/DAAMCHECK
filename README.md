# DaamCheck

Indian food bill validator. Check if your restaurant, IRCTC train food, or hotel bill follows the law.

**Service charge is banned. GST is capped at 5%. IRCTC vendors have official price caps. Most Indians don't know this.**

---

## What it does

| Tool | What it checks |
|------|----------------|
| GST Checker | GST % charged vs correct slab (5% or 18%), service charge ban (CCPA 2022) |
| IRCTC Price Caps | Official max prices for all 22 train food items per Railway Board circular |
| Scan Bill | Upload photo or enter items manually, get instant overcharge report |

---

## Tech Stack

**Frontend** — Next.js 14 (App Router) · TypeScript · Tailwind CSS → Vercel

**Backend** — Express · TypeScript · MongoDB (Mongoose) → Render

**AI** — Gemini 2.0 Flash (primary) · Groq llama-3.3-70b (fallback)

---

## Legal Basis

- **GST**: CGST Act Third Schedule / Notification 11/2017-CT(Rate) — standalone restaurants capped at 5%; hotel restaurants capped at 18% only if room rate ≥ ₹7,500/night
- **Service Charge**: CCPA Guidelines on Unfair Trade Practices, July 2022 — completely banned, cannot be added under any name or percentage
- **IRCTC**: Railway Board / IRCTC Menu Rate Card — official maximum prices, vendor cannot charge above these amounts

---

## Project Structure

```
daamcheck/
├── frontend/                  # Next.js 14 app
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Homepage
│       │   ├── gst-checker/       # GST + service charge checker
│       │   ├── irctc-prices/      # IRCTC max price list with search
│       │   └── scan-bill/         # Upload or manual bill check
│       ├── components/
│       │   ├── layout/            # Nav, BottomNav, Footer, Marquee
│       │   └── home/              # Hero, ToolCards, HowItWorks, etc.
│       └── lib/api.ts             # Fetch helpers (BASE_URL from env)
│
└── backend/                   # Express API
    └── src/
        ├── routes/
        │   ├── gst.ts             # POST /api/v1/gst/check
        │   └── irctc.ts           # GET /api/v1/irctc/prices, POST /api/v1/irctc/check
        ├── config/database.ts     # MongoDB connect
        └── index.ts               # Express app entry, rate limiting
```

---

## API Endpoints

All routes prefixed `/api/v1/`.

### `POST /gst/check`
```json
// Request
{ "amount": 1000, "gstPct": 18, "servicePct": 10, "roomRate": 0 }

// Response
{
  "legal": false,
  "correctGstPct": 5,
  "totalOvercharge": 230,
  "violations": [
    { "type": "GST_OVERCHARGE", "message": "GST charged at 18%, should be 5%", "law": "CGST Act", "amount": 130 },
    { "type": "SERVICE_CHARGE", "message": "Service charge of 10% is banned", "law": "CCPA 2022", "amount": 100 }
  ],
  "complaintUrl": "https://consumerhelpline.gov.in"
}
```

### `GET /irctc/prices`
Returns all 22 items with official max prices, grouped by category.

### `POST /irctc/check`
```json
// Request
{ "items": [{ "name": "Veg Thali", "chargedPrice": 150 }] }

// Response
{ "results": [{ "name": "Veg Thali", "maxPrice": 110, "status": "overcharged", "overcharge": 40 }], "totalOvercharge": 40, "legal": false, "complaintNumber": "1800-110-139" }
```

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally

### Backend
```bash
cd backend
npm install
cp .env.example .env   # set MONGODB_URI, PORT=5001
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Complaint Portals

If you find a violation, file a complaint at:

- **NCH Portal** — [consumerhelpline.gov.in](https://consumerhelpline.gov.in) (National Consumer Helpline)
- **eDaakhil** — [edaakhil.nic.in](https://edaakhil.nic.in) (online consumer forum)
- **INGRAM** — [ingram.dpiit.gov.in](https://ingram.dpiit.gov.in)
- **IRCTC Helpline** — 1800-110-139 (toll-free)

---

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
GEMINI_API_KEY=
GROQ_API_KEY=
```

### Backend (`.env`)
```
PORT=5001
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://your-frontend.vercel.app
GEMINI_API_KEY=
GROQ_API_KEY=
```

---

## License

MIT — free for all Indians.
