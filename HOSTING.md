# Hosting + account sync

**Live site:** https://singhsangam.github.io/career-switch-os/

## Important

Having the same Google account in Chrome on phone and laptop does **not** sync this app. You must **sign in inside the app** with the same email on both devices.

## One-time Supabase setup

### 1. Run SQL

SQL Editor → paste `supabase/schema.sql` → Run.

### 2. Auth URL settings

Authentication → URL Configuration:

- **Site URL:** `https://singhsangam.github.io/career-switch-os/`
- **Redirect URLs** (add both):
  - `https://singhsangam.github.io/career-switch-os/**`
  - `http://localhost:5173/**`

### 3. Email login

Authentication → Providers → **Email** → enabled (default).

### 4. Google login (optional but nice)

Authentication → Providers → **Google** → enable and paste Google Cloud OAuth client ID/secret.

### 5. GitHub secrets (already set if you did this before)

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## How to use

1. Open the site on laptop → sync pill → enter your email → **Email link**
2. Open the email on that laptop → click the link → signed in
3. Repeat on phone with the **same email**
4. Progress syncs automatically

Treat email login as the primary sync method. Sync codes remain under Advanced.
