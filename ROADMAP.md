# DaamCheck — Roadmap & Build Log

Indian consumer rights tool for food bills. Free, always.

---

## What This Is

DaamCheck helps Indians verify if their restaurant, hotel, or IRCTC train food bill is legal. Three tools:
1. **GST Checker** — verify GST % and catch illegal service charges
2. **IRCTC Price Caps** — official maximum prices for all 22 train food items
3. **Scan Bill** — upload photo or enter items manually, get overcharge report

---

## Build Log — Session 2 Findings (2026-06-28)

### Real IRCTC bill formats discovered (4 actual bills photographed)

Four distinct column formats found in the wild:

| Format | Example | Unit price rule |
|--------|---------|----------------|
| SnapBizz `Item \| Qty \| SP \| Amt` | Food \| 23 \| 130.00 \| 2990.00 | SP column = unit. Amt = total. Never use Amt. |
| IRCTC total `Item \| Qty \| Price` | Veg Meal \| 8 \| 640.00 | Price = TOTAL → divide by Qty: 640÷8=₹80 |
| MRP-labelled | "Veg Pulav/Fried Rice\nMRP: 80.00 \| Qty 1 \| Price 80.00" | MRP line = unit price |
| Restaurant plain | Item + price in single column | Price = unit price |

**Key bill facts discovered:**
- SnapBizz powers IRCTC catering vendor POS across India — most IRCTC bills use this system
- IRCTC reverse charge bills: `"Tax not payable on reverse charge basis"` → GST = 0 for passenger, no GST check needed
- Some IRCTC bills say `"Prices are Inclusive of Taxes"` — GST embedded, no separate line
- Rajdhani/Tejas Express bills: different caterer, "Dinner" @ ₹235 — different cap vs regular trains
- Egg Meal (common IRCTC item) was missing from price list — added
- "Veg. Pulav/Fried Rice" → maps to "Veg Fried Rice" cap ₹75 — fuzzy match needed

### OCR pipeline — two-pass architecture built

**Why single-pass fails:** Vision models struggle when asked to both read AND reason (column detection, math, format classification) simultaneously. Splitting into two passes improves accuracy.

```
Pass 1 (vision model)  → raw text transcription, column structure preserved
Pass 2 (text model)    → parse transcription → structured JSON
Validation layer       → math check: sum(price×qty) vs totalAmount → auto-fix unit/total confusion
```

**Model choices:**
- Pass 1 vision: Gemini 2.0 Flash (primary — handles up to 20MB phone photos)
- Pass 1 vision: `nvidia/nemoretriever-ocr-v1` (fallback — purpose-built OCR, better than phi-3.5-vision)
- Pass 2 text: Gemini 2.0 Flash text-only (JSON parse)
- Pass 2 text: `meta/llama-3.3-70b-instruct` via NVIDIA (fallback)

**NVIDIA model lessons:**
- `microsoft/phi-3.5-vision-instruct` 404s — actual name is `microsoft/Phi-3.5-vision-instruct` (capital P), but also has 180KB base64 image size limit — phone photos (2-5MB) always fail
- `nvidia/nemoretriever-ocr-v1` is purpose-built for OCR, better accuracy, higher size tolerance
- Always put Gemini FIRST for vision — it handles large images; NVIDIA vision is only fallback

**Image compression (client-side, canvas):**
- Canvas resizes image to max 1400px wide/tall, JPEG quality 0.85 before base64 encoding
- 3-5MB phone photo → ~150-200KB sent to API
- 1400px is sufficient for bill text legibility

**API key gotcha:**
- Gemini API keys from Google AI Studio start with `AIza...` — this is the format to use
- Keys starting with `AQ.` are a different format (OAuth token?) — rejected by Gemini API with `INVALID_ARGUMENT`
- snkrs-cart's Gemini key was project-restricted — won't work cross-project

### IRCTC backend — fuzzy matching + expanded price list

**Before:** Exact string match only — "Veg. Pulav/ Fried Rice" would not match "Veg Fried Rice"

**After:** Token-overlap fuzzy matching with threshold 0.4:
- Tokenizes both strings (lowercase, strip punctuation)
- Scores overlap fraction: `matches / max(inputLen, candidateLen)`
- Falls back to Unknown only if best score < 0.4

**New items added to price list:**
- Paneer Curry (alias: paneer masala, paneer butter masala) — ₹80
- Chicken Curry (alias: chicken masala) — ₹100
- Egg Meal (alias for Non-Veg Thali) — ₹135
- Veg Pulav / Pulao / Pulav (alias for Veg Fried Rice) — ₹75
- Rajdhani Veg Meal (alias: veg lunch, veg dinner) — ₹155
- Rajdhani Non-Veg Meal (alias: nonveg dinner, egg meal on Rajdhani) — ₹185
- Breakfast (generic) — ₹90
- Dinner (generic, Rajdhani) — ₹185
- Aliases for Tea, Coffee, Samosa, Dosa (Hindi/variant spellings)

**Backend check response** now returns `matchedName` field so UI can show "matched as Veg Fried Rice" when input was "Veg Pulav".

### Nav redesign — dmchamp.com style

Changes from previous nav:
- `border-b border-line` removed → `shadow-[0_1px_4px_rgba(0,0,0,0.07)]` (floating, no hard line)
- Height 64px → 68px (more breathing room)
- `max-w-6xl` → `max-w-7xl`
- Active link: `rounded-full border border-green bg-[#ECFDF5]` pill (matches dmchamp "Use Cases" active state)
- "Ask DaamBot" CTA: plain text link with `hover:text-green` (like dmchamp "Log in")
- "Scan a bill" CTA: `rounded-full font-semibold px-5 py-[9px]` (like dmchamp "Start free →")
- Inactive links: `text-[#374151]` (gray-700, matches dmchamp body text color)

### Error handling — never expose raw API errors to UI

**Pattern enforced:**
- `console.error("[OCR Pass1 Gemini]", msg)` — server logs get full error
- Client gets only: `"Could not read the bill photo. Try a clearer, well-lit image or use manual entry."`
- Previous code returned the full Gemini JSON error (with API key info!) to the client — fixed

---

## Build Log — Session 1 Findings (preserved from compacted context)

### Design iterations

Four design versions were tried before settling on V4.4:
- V1–V3: Rejected by user as "looks AI" / "fake" — too cold, generic fonts, wrong color application
- Reference: user provided Torrins.com as the clean-design benchmark
- V4.4 final: dark marquee strip + 72px hero headline + CSS phone mockup + green-pale trust strip + dashed connector how-it-works section

**What made V4.4 work:**
- Geist font self-hosted via `next/font/local` (template ships `./fonts/GeistVF.woff`) — no CDN
- Nav links: 15px / font-weight 600 / `#374151` (earlier versions used 14px/500/grey — "too cold")
- Trust strip: `bg-green-pale` bg, white pills with `border-green-mid` — not dark pills (too heavy)
- Hero headline: `not-italic text-green` em tag inside headline for color emphasis
- HowItWorks connector: dashed line has `z-index:0`, step icon divs have `z-index:10` — was rendering line over icons before fix

### Icon scraping findings

Attempted to scrape official logos from complaint portals. Results:

| Portal | Attempt | Result | Current solution |
|--------|---------|--------|-----------------|
| NCH (consumerhelpline.gov.in) | `curl` PNG emblem | ✅ Success — 29KB PNG, 220×320px | `/public/logos/nch.png` — real image |
| eDaakhil (edaakhil.nic.in) | `curl` + `sips` | `ENOTFOUND edaakhil.nic.in` — domain unreachable | Styled initials badge |
| IRCTC (irctc.co.in) | `curl` favicon | Returns HTML page, not image | Styled initials badge |
| INGRAM (ingram.dpiit.gov.in) | `curl` | Blocks programmatic access | Styled initials badge |
| Consumer Forum | — | No central domain | Styled initials badge |

**Finding:** Only NCH has a scrapable logo. All others block `curl`. Styled initials badges (colored circle with 2-letter abbreviation) are the correct fallback — do NOT replace with generic single-shoe stock photos.

### TypeScript issues found and fixed

| Error | Fix |
|-------|-----|
| `@types/cors` missing — TS7016 on backend | `npm install -D @types/cors` in backend |
| `import "./globals.css"` — IDE TypeScript server error | Added `src/types/css.d.ts` with `declare module "*.css"` — CLI tsc always passed, this was VS Code built-in TS vs workspace TS |
| `focusRingColor` in `style={}` — invalid `React.CSSProperties` | Removed — not a valid CSS property, should be Tailwind class |

### Architecture decisions made during build

| Decision | What was chosen | Why |
|----------|----------------|-----|
| IRCTC prices storage | Hardcoded array in `backend/src/routes/irctc.ts` | Prices change once a year via Railway Board circular. DB overkill. |
| Auth for DaamBot leads | None — anonymous email capture | OTP flow adds friction. Name+email after 5 messages is enough. |
| GST rate lookup | Pure computation in route handler | No external API needed — rules are static law |
| Service charge | Always 0% legal — hard-coded check | CCPA 2022 bans it universally, no exceptions |
| Rate limiting | In-memory `Map<string, {count, reset}>` | Single Render instance for now. Needs Redis when scaling to multiple instances. |
| Image optimization | Next.js `<Image>` for NCH logo only | Other logos are CSS/SVG — no Next.js image needed |
| Frontend pages | All `"use client"` | All 3 pages need search/filter/form state — server components would need client sub-components anyway |
| CSS variable | `--font-geist-sans` via `localFont` in layout.tsx | Font already in Next.js 14 template as `.woff` file — no Google Fonts CDN |
| MongoDB db name | `daamcheck` (in MONGODB_URI) | Separate from any other project |

### DaamBot — key decisions

- Primary: Gemini 2.0 Flash — fastest latency, generous free quota
- Fallback: Groq `llama-3.3-70b-versatile` — free tier, good quality
- Rate limit: 5 req/IP/min (stricter than backend's 30/min — protects LLM quota)
- Tool suggestion tag: `[TOOL:gst-checker]` / `[TOOL:irctc-prices]` / `[TOOL:scan-bill]` — parsed from LLM response, stripped before display, rendered as clickable card
- Lead capture: triggers after 5 user messages (greeting not counted), one capture per session, backend deduplicates by email
- Nudge bubble: 90 seconds on page with chat closed → "Need help with your bill? 💬" — dismissed permanently once clicked
- Starter chips: 3 pre-built questions shown below greeting, disappear after first real send
- System prompt includes all 22 IRCTC prices, GST slabs, CCPA 2022 service charge ban, all complaint portals

---

## Current Status — Shipped ✅ (updated 2026-06-28)

### Frontend (Next.js 14, Vercel)
- [x] Homepage — Marquee → Hero → TrustStrip → Stats → ToolCards → HowItWorks → CtaBand → Footer
- [x] `/gst-checker` — form (amount, GST%, service charge%, room rate) → violation verdict, rules sidebar
- [x] `/irctc-prices` — search + category filter (All / Meals / Breakfast / Beverages / Snacks), 22-item card grid with SVG food icons
- [x] `/scan-bill` — two tabs: upload zone (demo mode) + manual IRCTC item checker
- [x] `DaamBot` — floating chat widget, Gemini → Groq, tool cards, lead capture, starter chips, nudge bubble
- [x] Nav (desktop sticky) + BottomNav (mobile, 4 items)
- [x] TypeScript strict — zero errors on `tsc --noEmit` across all files
- [x] Custom Tailwind tokens — green/amber/red/ink/line/dark color scales, marquee animation

### Backend (Express + TypeScript, Render)
- [x] `POST /api/v1/gst/check` — GST + service charge violation calculation
- [x] `GET /api/v1/irctc/prices` — 22 items, grouped by category
- [x] `POST /api/v1/irctc/check` — check items against max prices
- [x] `POST /api/v1/chat/lead` — save DaamBot lead to MongoDB, deduplicate by email
- [x] `GET /api/v1/chat/leads` — list all leads (admin use)
- [x] `GET /health` — keep-alive (UptimeRobot pings every 5 min, Render free tier)
- [x] Rate limiting — 30 req/min per IP via `express-rate-limit`
- [x] `trust proxy 1` — correct IP extraction behind Render/Vercel proxy
- [x] TypeScript strict — zero errors on backend `tsc --noEmit`

---

## Phase 1 — Core Hardening

### Real OCR Bill Scanner — 🔄 In Progress
- [x] Two-pass pipeline built: vision transcription → text parse → math validation
- [x] Gemini 2.0 Flash vision (primary) + NVIDIA nemoretriever-ocr-v1 (fallback)
- [x] Client-side image compression (canvas 1400px, JPEG 0.85) before upload
- [x] IRCTC fuzzy matching — token overlap score, aliases for 30+ item names
- [x] Math auto-correction — detects unit vs total price column ambiguity
- [x] Rajdhani/Shatabdi price caps added (₹155 veg / ₹185 non-veg meals)
- [ ] **BLOCKER: Valid Gemini API key needed** — get unrestricted `AIza...` key from aistudio.google.com/apikey
- [ ] Confidence score display per item in results UI
- [ ] Handle handwritten bills / camera blur recovery
- [ ] GST check after OCR for restaurant bills (currently only IRCTC check runs post-OCR)

### GST Checker — More Restaurant Types
- [ ] "Type of restaurant" selector: standalone / hotel (enter room rate) / food court / cloud kitchen / online delivery
- [ ] Delivery platform GST: Swiggy/Zomato add GST on delivery fee separately (this is legal) — distinguish from food GST
- [ ] PDF complaint report: pre-filled NCH complaint letter with all violation details + applicable law citations

### DaamBot — Conversational Improvements
- [ ] Streaming (SSE) — show response word by word instead of waiting for full response
- [ ] Hindi language detection — if user types in Hindi/Devanagari script, respond in Hindi
- [ ] "File complaint now" button in chat — opens eDaakhil or NCH with query pre-filled
- [ ] Conversation history in `localStorage` — persist last session across page reload
- [ ] "What were you overcharged?" quick-calc: user types amounts, bot calculates refund owed

### Trust Strip — Real Logos
- [ ] Navigate browser manually to eDaakhil, IRCTC, INGRAM, save logos to `public/logos/`
- [ ] Replace styled initials badges with real logos
- [ ] Note: `curl` scraping blocked on all these sites — must save manually from browser

---

## Phase 2 — Expand Coverage

### New Bill Checkers
- [ ] **Delivery Bill Checker** — Zomato/Swiggy: check platform fee %, GST on delivery, convenience fee legality
- [ ] **Hotel Bill Checker** — room service GST by room rate slab, hotel food GST, service charge ban applies here too
- [ ] **Cinema Snacks Checker** — PVR/INOX/Cinepolis overpricing; packaged food cannot be sold above MRP (Legal Metrology Act)
- [ ] **Petrol Pump Checker** — correct GST on fuel, mandatory receipt rules
- [ ] **Airline Food Checker** — DGCA guidelines on in-flight food pricing

### IRCTC Improvements
- [ ] Real-time sync with menurates.irctc.co.in via scraper/cron (currently hardcoded — safe until Railway Board revises)
- [ ] Filter by train type: Rajdhani / Shatabdi / Mail Express have different menu availability
- [ ] Station-specific availability: not all items are available at all stations
- [ ] Price change history: log when Railway Board updates caps

### Complaint Automation
- [ ] Generate pre-filled NCH complaint text — consumer name, vendor name, violation type, amount, law citation
- [ ] eDaakhil URL pre-fill via query params (check if their form supports this)
- [ ] WhatsApp share: "I was overcharged ₹X at [restaurant] — here's the proof" with shareable link
- [ ] Screenshot/PDF of violation result for WhatsApp sharing

---

## Phase 3 — Community & Scale

### User Accounts
- [ ] Optional email login — OTP-based (same pattern: in-memory OTP Map, 5 min TTL, no password)
- [ ] Dashboard: saved bill checks, violation history
- [ ] Public share URL for a checked bill result

### Crowdsourced Violation Map
- [ ] Users submit restaurant overcharging reports with photo evidence + geolocation
- [ ] Moderation queue — admin reviews before publishing
- [ ] Public map: city-wise heatmap of reported violations
- [ ] Restaurant search: "Does [restaurant name] have violation reports?"
- [ ] Verified badge for restaurants with 0 confirmed violations

### Admin Panel
- [ ] Chat leads list, export CSV
- [ ] Crowdsourced reports moderation queue
- [ ] IRCTC price update form (when Railway Board issues new circular)
- [ ] Blog/news section: consumer rights updates, new law changes
- [ ] Analytics dashboard: most checked violations, cities, tools used

---

## Phase 4 — Sustainability

### Ethical Monetization (core always free)
- [ ] **Pro Bill Scanner** — bulk CSV upload, team seats for auditors / CA firms / NGOs
- [ ] **Embed widget** — white-label DaamBot for consumer websites
- [ ] **API access** — JSON API for billing software integrations
- [ ] **Sponsored content** — consumer law firms / NGOs (clearly labelled, editorial independent)

### Partnerships
- [ ] CCPA / Ministry of Consumer Affairs — position as unofficial companion tool
- [ ] Consumer NGOs: VOICE India, CUTS International, CERC
- [ ] CA firms and tax consultants — referral for cases needing professional escalation
- [ ] IRCTC itself — irony not lost, but price cap awareness benefits them too

---

## Tech Debt & Infrastructure

| Item | Priority | Notes |
|------|----------|-------|
| Redis rate limiting | High | In-memory Map breaks on multi-instance Render deploy |
| IRCTC prices → DB + cron | Medium | Currently hardcoded — safe until next Railway Board revision |
| Sentry error monitoring | Medium | Currently blind to production errors |
| Plausible analytics | Medium | Privacy-first, no cookie consent needed |
| Cloudinary / Vercel Blob for bill images | High (Phase 1 OCR) | Needed for upload pipeline |
| E2E tests (Playwright) | Medium | GST check flow, IRCTC filter, DaamBot lead capture |
| UptimeRobot `/health` ping | Done | Set up externally — Render free tier keep-alive |

---

## Laws — Current & Planned Coverage

| Law | Scope | Status |
|-----|-------|--------|
| CCPA Guidelines 2022 | Service charge ban (restaurants) | ✅ Live |
| CGST Act / Notification 11/2017-CT(Rate) | Restaurant GST slabs (5% / 18%) | ✅ Live |
| IRCTC Menu Rate Card | Train food maximum prices | ✅ Live |
| Consumer Protection Act 2019 | General unfair trade practices | Phase 2 |
| FSSAI Act | Packaged food price display, MRP | Phase 2 |
| Legal Metrology Act | Cinema/retail MRP violations | Phase 2 |
| Motor Vehicle Act | Toll canteen pricing | Phase 3 |
| DGCA guidelines | Airline food pricing | Phase 3 |
| Airport Authority guidelines | Airport food price caps | Phase 3 |

---

## Complaint Portals — Integration Status

| Portal | URL | In UI | Notes |
|--------|-----|-------|-------|
| NCH | consumerhelpline.gov.in | ✅ Link + real logo | Toll-free: 1800-11-4000 |
| eDaakhil | edaakhil.nic.in | ✅ Link | Online consumer court filing |
| INGRAM | ingram.dpiit.gov.in | ✅ Link | Dept. for Promotion of Industry & Internal Trade |
| IRCTC Helpline | irctc.co.in | ✅ In DaamBot + scan result | 1800-110-139, 24/7 toll-free |
| Rail Madad | railmadad.indianrailways.gov.in | Phase 2 | Better for train-specific complaints |
| FSSAI Helpline | fssai.gov.in | Phase 2 | Food safety complaints |
| Local Consumer Forum | district-wise | Phase 3 | Physical filing, no central URL |

---

## Key Constraints to Remember (updated 2026-06-28)

- **Render free tier**: sleeps after 15 min inactivity → UptimeRobot on `/health` every 5 min
- **IRCTC prices**: hardcoded — check menurates.irctc.co.in when Railway Board issues revision (usually once per year)
- **Service charge**: always 0% legal — no exceptions, no opt-in. If bill shows any service charge, it is a violation.
- **GST 18%**: only legal when hotel room rate is ≥ ₹7,500/night AND the food is from that hotel's restaurant
- **Logo scraping**: NCH logo works via curl. All others block programmatic access — save manually from browser
- **CSS module error in IDE**: `src/types/css.d.ts` with `declare module "*.css"` fixes VS Code false positive — do NOT delete this file
- **HowItWorks z-index**: connector line is `z-index:0`, step icon circles are `z-index:10` — reverting this breaks the layout
- **Gemini API key format**: must start with `AIza...` (from aistudio.google.com/apikey). Keys starting with `AQ.` are rejected with INVALID_ARGUMENT. snkrs-cart key is project-restricted — get a new one.
- **NVIDIA vision image size**: phi-3.5-vision-instruct rejects base64 images >180KB. Phone bill photos are 2-5MB. Always use Gemini vision first. Client-side canvas compression (max 1400px, JPEG 0.85) reduces to ~150-200KB.
- **NVIDIA model names are case-sensitive**: `microsoft/Phi-3.5-vision-instruct` (capital P) not `phi-3.5-vision-instruct` (404 otherwise)
- **IRCTC reverse charge**: passengers don't pay GST on train food — `"Tax not payable on reverse charge basis"` is correct. Don't flag as GST violation.
- **Error messages**: never return raw API error JSON to the client UI — log to `console.error` server-side, return clean user message only
- **OCR pipeline order**: Gemini vision → NVIDIA OCR → fail. Gemini text parse → NVIDIA llama text → fail. Two-pass always beats single-pass for receipt accuracy.
