# DaamCheck Roadmap

Indian consumer rights — food bill violations. Free, always.

---

## Current Status: MVP ✅

### Shipped
- [x] Homepage — hero, marquee, trust strip, stats, tool cards, how-it-works, CTA, footer
- [x] GST Checker — form (amount, GST%, service charge%, room rate) → violation verdict
- [x] IRCTC Price Caps — search + filter (Meals / Breakfast / Beverages / Snacks), card grid
- [x] Scan Bill — upload zone (demo) + manual IRCTC item checker
- [x] DaamBot AI chatbot — Gemini 2.0 Flash → Groq llama-3.3-70b fallback, tool suggestions
- [x] Lead capture — name/email after 5 chat messages, saved to MongoDB
- [x] Backend API — GST check, IRCTC prices, IRCTC item check, chat leads
- [x] Mobile-first layout — bottom nav, responsive grid, Geist font

---

## Phase 1 — Core Hardening

### Bill Scanner (Real OCR)
- [ ] Integrate Google Cloud Vision OCR or Tesseract.js for actual image parsing
- [ ] Extract: item names, prices, GST %, service charge line
- [ ] Auto-map extracted items to IRCTC cap list
- [ ] Show side-by-side: charged vs legal max

### GST Checker Improvements
- [ ] Add "type of restaurant" selector (standalone / hotel / food court / online delivery)
- [ ] Handle delivery platform GST (Swiggy/Zomato add GST on delivery fee separately)
- [ ] PDF report download: pre-filled NCH complaint letter

### DaamBot Improvements
- [ ] Streaming responses (SSE) instead of full JSON wait
- [ ] Hindi language support — detect script, reply in same language
- [ ] "File complaint" quick action in chat — opens eDaakhil in new tab with pre-filled context
- [ ] Conversation history persistence (localStorage)

---

## Phase 2 — Expand Coverage

### New Tools
- [ ] **Delivery Bill Checker** — Zomato/Swiggy bills: check platform fees, GST on delivery, surge
- [ ] **Hotel Bill Checker** — room service GST, hotel food GST by room rate slab, luxury tax
- [ ] **Movie Snacks Checker** — PVR/INOX price caps, GST on packaged food in cinema

### IRCTC Improvements
- [ ] Real-time sync with menurates.irctc.co.in (currently hardcoded)
- [ ] Train number / station lookup — show which items available on your route
- [ ] Price history — track when IRCTC updates caps

### Complaint Automation
- [ ] Generate pre-filled NCH complaint text (consumer + vendor info + violation details)
- [ ] Direct eDaakhil form pre-fill via URL params (where API available)
- [ ] WhatsApp share: send violation summary to a number

---

## Phase 3 — Community & Scale

### User Accounts
- [ ] Optional email login (OTP-based, same pattern as project reference)
- [ ] Save checked bills — personal violation history
- [ ] Share a bill check result via public URL

### Crowdsourced Data
- [ ] Users report restaurant overcharging with photo evidence
- [ ] Public map of restaurants with reported violations (city-wise)
- [ ] Verified vs unverified reports

### Admin Panel
- [ ] View chat leads, export CSV
- [ ] Moderate crowdsourced violation reports
- [ ] Update IRCTC prices when Railway Board issues new circular
- [ ] Blog / news section for consumer rights updates

---

## Phase 4 — Monetization (keeping core free)

### Revenue (ethical, non-paywalled core)
- [ ] **Pro Bill Scanner** — bulk upload, team plan for auditors and CA firms
- [ ] **API access** — white-label for consumer apps, billing software
- [ ] **Consulting** — consumer rights clinics, corporate training
- [ ] **Sponsored placements** — law firms / consumer NGOs (clearly labelled)

### Partnerships
- [ ] CGPDTM / CCPA — link as official resource
- [ ] Consumer NGOs (VOICE, CUTS International)
- [ ] CA firms for referrals when violations need legal escalation

---

## Tech Debt / Infrastructure

- [ ] Move IRCTC prices to DB (auto-sync cron) instead of hardcoded array
- [ ] Redis for rate limiting (replace in-memory Map — works across Render instances)
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Plausible — privacy-first)
- [ ] UptimeRobot pings `/health` every 5 min (Render free tier keep-alive)
- [ ] CDN for bill images (Cloudinary or Vercel Blob)
- [ ] E2E tests (Playwright) for bill check flows

---

## Laws to Add Coverage For

| Law | Scope | Status |
|-----|-------|--------|
| CCPA 2022 | Service charge ban | ✅ live |
| CGST Act | Restaurant GST slabs | ✅ live |
| IRCTC Menu Rate Card | Train food price caps | ✅ live |
| Consumer Protection Act 2019 | General unfair trade practices | 🔜 Phase 2 |
| Food Safety & Standards Act (FSSAI) | Display of prices, packaged food MRP | 🔜 Phase 2 |
| Legal Metrology Act | Weights, MRP, pre-packaged goods | 🔜 Phase 3 |
| Motor Vehicle Act | Toll food/canteen price display | 🔜 Phase 3 |
| Airport Authority guidelines | Airport food price caps | 🔜 Phase 3 |

---

## Complaint Portal Coverage

| Portal | Integrated | Notes |
|--------|-----------|-------|
| NCH (consumerhelpline.gov.in) | ✅ Link in UI | Toll-free: 1800-11-4000 |
| eDaakhil (edaakhil.nic.in) | ✅ Link in UI | Online consumer court |
| INGRAM (ingram.dpiit.gov.in) | ✅ Link in UI | Dept. for Promotion of Industry |
| IRCTC Helpline | ✅ In chatbot | 1800-110-139, 24/7 |
| Rail Madad | 🔜 Phase 2 | railmadad.indianrailways.gov.in |
| FSSAI Helpline | 🔜 Phase 2 | Food safety complaints |
