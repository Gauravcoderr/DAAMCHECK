# DaamCheck — Roadmap & Build Log

Indian consumer rights tool for food bills. Free, always.

---

## What This Is

DaamCheck helps Indians verify if their restaurant, hotel, or IRCTC train food bill is legal. Three tools:
1. **GST Checker** — verify GST % and catch illegal service charges
2. **IRCTC Price Caps** — official maximum prices for all 22 train food items
3. **Scan Bill** — upload photo or enter items manually, get overcharge report

---

## Build Log — Session Findings (preserved from compacted context)

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

## Current Status — Shipped ✅

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

### Real OCR Bill Scanner
- [ ] Google Cloud Vision OCR or Tesseract.js — parse actual bill photo
- [ ] Extract: item names, quantities, individual prices, GST %, service charge line
- [ ] Auto-map extracted item names to IRCTC cap list (fuzzy match)
- [ ] Confidence score per extracted item — flag low-confidence extractions
- [ ] Side-by-side view: what was on bill vs what is legal

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

## Key Constraints to Remember

- **Render free tier**: sleeps after 15 min inactivity → UptimeRobot on `/health` every 5 min
- **IRCTC prices**: hardcoded — check menurates.irctc.co.in when Railway Board issues revision (usually once per year)
- **Service charge**: always 0% legal — no exceptions, no opt-in. If bill shows any service charge, it is a violation.
- **GST 18%**: only legal when hotel room rate is ≥ ₹7,500/night AND the food is from that hotel's restaurant
- **Logo scraping**: NCH logo works via curl. All others block programmatic access — save manually from browser
- **CSS module error in IDE**: `src/types/css.d.ts` with `declare module "*.css"` fixes VS Code false positive — do NOT delete this file
- **HowItWorks z-index**: connector line is `z-index:0`, step icon circles are `z-index:10` — reverting this breaks the layout
