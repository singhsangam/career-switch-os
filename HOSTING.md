# Hosting + cross-device sync

**Live site:** https://singhsangam.github.io/career-switch-os/

Progress is stored separately from app code. Redeploys and refreshes after feature updates keep your solved status, notes, and confidence.

## How updates stay safe

| Layer | What it is | On refresh / redeploy |
|---|---|---|
| App / UI / modules / problem catalog | Code in git | Updates |
| Your journey status | Browser cache + cloud payload | Preserved |
| Schema version | `DATA_SCHEMA_VERSION` | Migrates; never wipes progress |

## Enable phone ↔ laptop sync (one-time, ~5–10 min)

### 1. Free Supabase project

1. Open https://supabase.com → **New project**
2. **SQL Editor** → New query → paste all of `supabase/schema.sql` → **Run**
3. **Project Settings → API** → copy:
   - Project URL
   - `anon` `public` key

### 2. Add secrets to GitHub (so the hosted site can sync)

In PowerShell from this folder:

```powershell
gh secret set VITE_SUPABASE_URL
gh secret set VITE_SUPABASE_ANON_KEY
```

Paste each value when prompted, then:

```powershell
gh workflow run Deploy
```

### 3. Local `.env` (optional, for `npm run dev`)

```powershell
copy .env.example .env
```

Fill the same two values, restart the dev server.

### 4. Link devices

1. Open the live site on your laptop
2. Tap the sync pill (top right) → **Copy** `RTD-****`
3. Open the same URL on phone Chrome
4. Paste → **Link**

Same code = same journey, any country / network. Treat the code like a password.

## Repo

https://github.com/singhsangam/career-switch-os
