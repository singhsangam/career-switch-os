# Sync login (read this)

## Why you never got an OTP in Gmail

Supabase’s **free built-in email** is demo-only (very low limits, often blocked/spam). OTP/magic-link to Gmail frequently **never arrives**. That is a provider limit, not your phone/Chrome.

## What to use instead (works without any email)

### 1. Turn off email confirmation (required once)

Supabase → **Authentication → Providers → Email**

- Confirm email = **OFF**
- Save

### 2. On the website

1. **Create account**
2. Enter your Gmail address
3. Choose any password (6+ chars)
4. Tap **Create account & start sync**

No OTP. No inbox. You’re signed in immediately.

### 3. On your phone

1. Open the same site
2. **Sign in**
3. Same Gmail + same password

Now both devices sync to that account.

## Optional: real Gmail one-click later

Enable **Google** provider in Supabase Auth (needs Google Cloud OAuth client). Until then, password is the reliable path.

## Still blocked?

Run `supabase/schema.sql` in the SQL Editor if you haven’t (needed for synced journey storage).
