# Hosting + cross-device sync

Progress is stored separately from app code. When the site is redeployed or you refresh after a feature update, your solved status / notes / confidence stay intact.

## 1. Create a free Supabase project

1. Go to https://supabase.com → New project
2. Open **SQL Editor** → paste and run `supabase/schema.sql`
3. Open **Project Settings → API** and copy:
   - Project URL
   - `anon` `public` key

## 2. Local env

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Restart `npm run dev`.

## 3. Link phone + laptop

1. Open the site on your laptop
2. Tap the sync pill → **Copy** your `RTD-****` code
3. Open the same hosted URL on phone Chrome
4. Paste the code → **Link**

Same code = same journey, any country / network.

Treat the sync code like a password.

## 4. Deploy (Vercel)

```bash
npx vercel
```

Add the same two env vars in the Vercel project settings, then redeploy.

After that, use the Vercel URL on your phone.
