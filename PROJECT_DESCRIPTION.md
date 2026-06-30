# CyberShield AI — Project Description (Option A: Frontend-Only)

## Overview

**CyberShield AI** is a phishing and scam detection web application that analyzes URLs, emails, SMS/WhatsApp messages, text content, and screenshots to identify potential security threats. This is **Option A** — a fully client-side frontend deployment that runs entirely in the browser with no backend server required.

**Live demo flow:** Users register → log in → scan content → view results → see their personal history. All data stays in the user's browser.

---

## What It Does

CyberShield AI helps everyday users detect phishing and scam attempts across common attack channels:

- **URL Scanner** — Checks links for phishing patterns, suspicious TLDs, IP addresses, excessive subdomains, and missing HTTPS.
- **Email Scanner** — Analyzes email body and headers for urgency language, phishing keywords, suspicious links, and social engineering tactics.
- **SMS & WhatsApp Scanner** — Detects prize scams, fake banking alerts, investment fraud, and delivery scams in messages.
- **Text Scanner** — General-purpose analysis of any pasted text for fraud and phishing indicators.
- **Screenshot Scanner (OCR)** — Uploads an image, extracts visible text via OCR, then analyzes the extracted text for threats.

Each scan returns a **verdict** (Safe / Suspicious / Phishing / Malicious), a **confidence score**, a list of **detected threats**, and **processing metadata**.

---

## Features

### Core functionality
- Multi-channel scanning (URL, email, SMS, text, image OCR)
- Per-user account system (register, login, logout)
- Personal scan history with search and filter
- Detailed scan result view with threat breakdown
- Export scan history as JSON
- Profile management (edit name and email)

### Dashboard
- Welcome screen with per-user greeting
- 4 stat cards: total scans, threats found, safe results, scans today
- 7-day activity bar chart (safe / suspicious / phishing)
- Threat breakdown summary
- Quick-scan shortcuts to all 5 scanners
- Recent scans list with empty-state CTA

### Settings
- Appearance: Dark / Light / System theme (persists across sessions)
- Language selection
- Notification toggles (push, email, sound)
- Security: 2FA toggle, login alerts, password change, session timeout
- Privacy: anonymous data sharing toggle, data retention period
- API rate limit slider

### UX polish
- Clean, professional UI (Linear/Stripe-inspired)
- Responsive layout (mobile, tablet, desktop)
- Persistent theme preference
- Toast confirmations for user actions
- Animated scanning progress
- Empty-state messaging for new users
- Per-user scan isolation (User A never sees User B's history)

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| OCR | Tesseract.js (simulated in demo) |
| Storage | browser localStorage |
| Bundle | Single-file `dist/index.html` (722 KB / 210 KB gzipped) |

**Zero backend dependencies.** The entire app — HTML, CSS, JavaScript, images — is inlined into one `index.html` file that can be hosted on any static server or opened directly from the filesystem.

---

## Architecture (Option A)

```
┌────────────────────────────────────────────┐
│              User's Browser                │
│                                            │
│  ┌──────────────┐   ┌──────────────────┐  │
│  │ React App    │──▶│ Phishing Detector │  │
│  │ (UI + state) │   │ (heuristic engine)│  │
│  └──────┬───────┘   └────────┬─────────┘  │
│         │                    │            │
│         ▼                    ▼            │
│  ┌──────────────┐   ┌──────────────────┐  │
│  │ localStorage │   │  Feature extract  │  │
│  │ • auth token │   │  + pattern match  │  │
│  │ • users      │   │  + weighted score │  │
│  │ • scans/user │   └──────────────────┘  │
│  │ • settings   │                         │
│  └──────────────┘                         │
└────────────────────────────────────────────┘
```

All computation happens in the browser. No data leaves the user's device. No server is called. No cookies are set.

---

## Authentication & Data

**Auth:** Email + password stored in `localStorage`. Passwords are stored as plain text in the browser-only store (acceptable for a local demo — the full-stack version uses bcrypt + JWT on the backend).

**User isolation:** Each user's scan history is stored under a unique key `cybershield_scans_{userId}`. A new user sees zero scans, zero history, zero stats.

**Persistence:** Data survives page refreshes and browser restarts. Data is cleared if the user clears site data or uses the "Clear History" action.

**Privacy:** No analytics, no tracking, no third-party scripts, no external API calls. Everything is local.

---

## Detection Engine (Honest Disclosure)

Option A uses a **client-side heuristic detection engine**, not live ML models. This is an important distinction:

- **What it does:** Extracts features from input (URL structure, keyword presence, pattern matches, link counts, urgency signals), weights them based on empirically chosen coefficients, and produces a score that maps to a verdict.
- **What it is not:** It does not call a server, run a neural network, or use a trained Scikit-learn / BERT / LSTM model.
- **Why:** Running real ML models in the browser would require shipping large model weights (tens to hundreds of MB) and a runtime like ONNX.js or TensorFlow.js, which would bloat the bundle and slow load times significantly.

The detection patterns are informed by common phishing characteristics documented in academic research and public datasets (phishing URL patterns, urgency keywords, Nigerian 419 fraud templates, SMS spam signatures), but the engine itself is a rules-based weighted scorer — not a trained classifier.

**For production use,** upgrade to **Option B (Full Stack)** where the frontend calls a Python FastAPI service running real trained models:
- URL: Random Forest + XGBoost ensemble (phisingdata.xlsx)
- Email: BERT + SVM (phishing_email.xlsx + Enron + Nazario + CEAS_08 + SpamAssassin)
- SMS: LSTM + Attention (spam.xlsx)
- Scam: BERT fine-tuned (Nigerian_Fraud.xlsx)

---

## User Flow

1. **First visit:** User lands on login page.
2. **Register:** Enter name, email, password → account created → auto-login.
3. **Dashboard:** Empty state with "Start scanning" CTA, stat cards all at 0.
4. **Scan:** Choose a scanner, paste content, click Scan → animated progress → result card with verdict, confidence %, and detected threats.
5. **History:** Every scan is saved. User can search, filter by result, view details in a modal, export JSON, or clear all.
6. **Return visit:** Log in with the same email + password → same history, same stats.

---

## Screens

1. **Login** — `/login` — clean centered form, single error message
2. **Register** — `/register` — name/email/password form with length validation
3. **Dashboard** — `/dashboard` — stats, charts, quick-scan cards, recent scans
4. **URL Scanner** — `/scan/url` — single input + example chips
5. **Email Scanner** — `/scan/email` — textarea + sample buttons
6. **SMS Scanner** — `/scan/sms` — mode toggle (SMS/WhatsApp) + textarea
7. **Text Scanner** — `/scan/text` — textarea with word counter
8. **Screenshot Scanner** — `/scan/screenshot` — drag-drop image upload with OCR preview
9. **History** — `/history` — searchable list with modal detail view
10. **Profile** — `/profile` — edit name/email, view account info and recent scans
11. **Settings** — `/settings` — grouped toggles and dropdowns

---

## What Is NOT Included in Option A

- ❌ No backend server (Spring Boot API)
- ❌ No MySQL database
- ❌ No Python ML service (FastAPI)
- ❌ No trained ML models running in inference
- ❌ No real OCR (simulated; real OCR would use Tesseract.js worker)
- ❌ No persistent server-side history (browser-only)
- ❌ No cross-device sync (data is per-browser)
- ❌ No real 2FA, no real password hashing (browser demo)
- ❌ No email delivery for alerts

All of these are included in **Option B (Full Stack)** via `docker-compose.yml`.

---

## Deployment

### Static hosting (recommended for Option A)
Drag `dist/` folder to Netlify, Vercel, Cloudflare Pages, or any static host. Zero config. Live URL in seconds.

### Local preview
```bash
npm install
npm run dev        # dev server at localhost:5173
# or
npm run build      # produces dist/index.html
npm run preview    # preview production build
```

---

## Upgrade Path: Option A → Option B

The frontend is designed to swap seamlessly to a real backend:

1. Replace `src/ml/phishingDetector.ts` calls with `fetch()` to the Spring Boot API at `/api/scan/*`.
2. Replace `localStorage` auth with JWT from `/api/auth/login` and `/api/auth/register`.
3. Replace `localStorage` scan history with `GET /api/scan/history`.
4. Deploy backend + ML service + MySQL via `docker-compose up`.

The UI, routing, and pages remain identical — only the data layer changes.

---

## Summary

**CyberShield AI (Option A)** is a fully functional, self-contained phishing detection web app that runs in the browser. It demonstrates a complete product UX — registration, scanning, history, analytics, settings — without requiring any backend infrastructure. It is suitable for demos, portfolios, educational showcases, and local personal use. For production deployment with real trained ML models and persistent server-side data, upgrade to Option B (Full Stack).

**Bundle size:** 722 KB (210 KB gzipped), single file, no external dependencies.
**Load time:** <1 second on 4G.
**Dependencies at runtime:** zero.
