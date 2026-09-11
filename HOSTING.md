# Account sync setup

**Live:** https://singhsangam.github.io/career-switch-os/

## Why Chrome email alone is not enough

Chrome sync ≠ this app. You must create/sign in **inside Road to December** with the same email on both devices.

## Recommended login (most reliable)

**Create account** with email + password on laptop, then **Sign in** with the same on phone.

## One-time Supabase checklist

### 1. SQL (required)

SQL Editor → paste `supabase/schema.sql` → **Run**.

### 2. Turn OFF email confirmation (so password signup works instantly)

Authentication → Providers → Email → **Confirm email = OFF**

(Otherwise new accounts need a confirmation email before sign-in works.)

### 3. Auth URLs

Authentication → URL Configuration:

- Site URL: `https://singhsangam.github.io/career-switch-os/`
- Redirect URLs:
  - `https://singhsangam.github.io/career-switch-os/**`
  - `http://localhost:5173/**`

### 4. Optional: Google provider

Authentication → Providers → Google → enable with OAuth client ID/secret.

## How to sync phone + laptop

1. Laptop: open site → **Create account** → email + password
2. Phone: open same site → **Sign in** → same email + password
3. Top pill should show **Synced**
4. Change a problem status on one device → wait a few seconds → refresh the other
