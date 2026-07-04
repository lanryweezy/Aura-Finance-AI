# Aura Finance AI

> AI-powered accounting software for Nigerian SMEs. Built with React, Supabase, and Google's foundation models.

## Quick Start

### Demo Mode (No Setup Required)
1. Open [aura-finance-ai.vercel.app](https://aura-finance-ai.vercel.app)
2. Click **"Try Demo — No Signup"**
3. Explore the full product with realistic Nigerian business data

### Production Setup
```bash
# Clone
git clone https://github.com/lanryweezy/Aura-Finance-AI.git
cd Aura-Finance-AI

# Install
npm install

# Configure
cp .env.local.example .env.local
# Edit .env.local with your keys:
# - VITE_SUPABASE_URL (from supabase.com)
# - VITE_SUPABASE_ANON_KEY
# - VITE_GEMINI_API_KEY (from aistudio.google.com)

# Run
npm run dev
```

## What's Included

### Core Features (100+ services)
- **Invoicing** — Create, send, track with AI extraction
- **Bills/Payables** — Vendor management, auto-matching
- **Payroll** — PAYE, Pension, NHF, overtime, leave
- **Expenses** — Tracking, mileage, per diem, approval
- **Inventory** — Stock tracking, valuation, transfers
- **Projects** — Budget tracking, profitability
- **Reports** — P&L, Balance Sheet, Cash Flow
- **Tax Filing** — VAT, WHT, CIT, PAYE

### AI Features (TabFM + TimesFM)
- **4 AI Agents** — CFO, Tax, Payroll, Ops
- **Auto-categorization** — AI-powered transaction sorting
- **Anomaly detection** — Fraud and rule-based
- **Cash flow forecasting** — 90-day predictions
- **NL search** — "Show me Q1 revenue"
- **Autonomous engine** — Auto-categorize, auto-flag, auto-pay

### Enterprise Features
- **SSO** — Google/Microsoft/Azure
- **MFA** — TOTP + SMS
- **Custom roles** — Beyond 4 default roles
- **Session management** — View/revoke active sessions
- **API keys** — Generate/revoke for integrations
- **Audit export** — CSV with filters
- **Data encryption** — AES-256-GCM

### NRS E-Invoicing
- Full MBS API integration (IRN, QR, sign, transmit)
- Nigerian tax compliance (VAT, WHT, PAYE, CIT, NHF)
- Digital stamps and QR codes

### Mobile
- Android + iOS via Capacitor
- Build: `npm run build && npx cap sync`

## Tech Stack
- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **AI**: Gemini 2.0 Flash, TabFM, TimesFM
- **Mobile**: Capacitor (Android/iOS)
- **Testing**: Playwright (30 specs) + Vitest (3 unit tests)

## Demo Data
Click "Try Demo — No Signup" on the landing page to load:
- 6 months of realistic Nigerian transactions
- 5 invoices (paid, unpaid, overdue)
- 5 bills from real Nigerian vendors
- 5 employees with Nigerian payroll
- AI CFO with 4 agents
- All accounting features

## Deploy
```bash
# Vercel (auto-deploy)
git push origin main

# Android APK
npm run build && npx cap sync
cd android && ./gradlew assembleDebug

# iOS (requires Mac)
npx cap open ios
```

## License
Proprietary — Aura Finance AI
