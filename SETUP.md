# Aura Finance AI — Setup Guide

## Prerequisites
- Node.js 18+
- npm or pnpm
- A Supabase account (supabase.com)
- (Optional) Gemini API key for AI features
- (Optional) Mono API key for bank sync
- (Optional) NRS API key for e-invoicing

## Step 1: Install Dependencies

```bash
cd Aura-Finance-AI
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose a name (e.g., `aura-finance`) and set a database password
4. Select a region close to your users (e.g., AWS West Europe)
5. Wait for the project to be created

## Step 3: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/migrations/001_initial_schema.sql`
3. Copy the entire contents
4. Paste into the SQL Editor and click **Run**
5. Wait for all tables to be created (you should see "Success" messages)

## Step 4: Get API Credentials

1. In Supabase dashboard, go to **Settings → API**
2. Copy your **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy your **anon/public key** (long string starting with `eyJ...`)

## Step 5: Configure Environment

Create a `.env.local` file in the project root:

```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini AI (OPTIONAL — enables AI features)
VITE_GEMINI_API_KEY=your-gemini-api-key

# Payments (OPTIONAL)
VITE_PAYSTACK_KEY=pk_test_your_key
VITE_FLW_KEY=FLWPUBK_TEST_your_key

# Mono Bank Sync (OPTIONAL)
VITE_MONO_SECRET=your-mono-secret

# NRS E-Invoicing (OPTIONAL)
VITE_NRS_API_URL=https://api.doftwerks.com
VITE_NRS_API_KEY=your-nrs-api-key
VITE_NRS_SERVICE_ID=your-8-char-service-id
```

## Step 6: Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 7: Create Your Account

1. Click **Get Started** on the landing page
2. Enter your email and password
3. You'll be auto-created as the **Owner** of a new organization
4. The default chart of accounts is seeded automatically

## Step 8: Mobile App (Optional)

```bash
# Build the web app first
npm run build

# Add Android platform
npx cap add android

# Sync web assets to native
npx cap sync

# Open in Android Studio
npx cap open android
```

## Troubleshooting

### "Supabase not configured"
- Check that `.env.local` exists and has the correct values
- Make sure the URL doesn't have a trailing slash
- Restart the dev server after changing env vars

### "AI features will be limited"
- Set `VITE_GEMINI_API_KEY` in `.env.local`
- Get a key from [aistudio.google.com](https://aistudio.google.com)

### Tables not found
- Run the SQL migration again in the Supabase SQL Editor
- Check that you're connected to the correct project

### Build errors
- Run `npm install` to install all dependencies
- Check that Node.js version is 18+
