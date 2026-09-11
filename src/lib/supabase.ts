import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

function env(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string | undefined {
  try {
    const value = import.meta.env?.[name]
    return typeof value === 'string' && value.length > 0 ? value : undefined
  } catch {
    return undefined
  }
}

export function isSyncConfigured(): boolean {
  const url = env('VITE_SUPABASE_URL')
  const anon = env('VITE_SUPABASE_ANON_KEY')
  return Boolean(url && anon && url.startsWith('http'))
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSyncConfigured()) return null
  if (!client) {
    client = createClient(env('VITE_SUPABASE_URL')!, env('VITE_SUPABASE_ANON_KEY')!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  }
  return client
}

export function appRedirectUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${window.location.origin}${normalized}`
}

export async function getSession(): Promise<Session | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return data.session
}

/** Reliable cross-device auth — same email+password on phone and laptop. */
export async function signUpWithPassword(email: string, password: string): Promise<User> {
  const sb = getSupabase()
  if (!sb) throw new Error('Cloud is not configured')
  if (password.length < 6) throw new Error('Password must be at least 6 characters')
  const { data, error } = await sb.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: appRedirectUrl(),
    },
  })
  if (error) throw error
  if (!data.user) throw new Error('Sign up failed — try again')
  // If email confirmation is required, session may be null until confirmed
  if (!data.session) {
    throw new Error(
      'Account was created but not signed in. In Supabase → Authentication → Providers → Email, turn Confirm email OFF, then use Sign in with the same password (no email code needed).',
    )
  }
  return data.user
}

export async function signInWithPassword(email: string, password: string): Promise<User> {
  const sb = getSupabase()
  if (!sb) throw new Error('Cloud is not configured')
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  if (!data.user) throw new Error('Sign in failed')
  return data.user
}

/** 6-digit code stays in the same browser (better than magic links on phone). */
export async function sendEmailOtp(email: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) throw new Error('Cloud is not configured')
  const { error } = await sb.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
      // No emailRedirectTo — we want the numeric OTP, not a link-only flow
    },
  })
  if (error) throw error
}

export async function verifyEmailOtp(email: string, token: string): Promise<User> {
  const sb = getSupabase()
  if (!sb) throw new Error('Cloud is not configured')
  const cleaned = token.replace(/\s+/g, '')
  const { data, error } = await sb.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: cleaned,
    type: 'email',
  })
  if (error) throw error
  if (!data.user) throw new Error('Invalid or expired code')
  return data.user
}

export async function signInWithGoogle(): Promise<void> {
  const sb = getSupabase()
  if (!sb) throw new Error('Cloud is not configured')
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: appRedirectUrl(),
    },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const { error } = await sb.auth.signOut()
  if (error) throw error
}

export function onAuthChange(
  cb: (session: Session | null, user: User | null) => void,
): () => void {
  const sb = getSupabase()
  if (!sb) return () => undefined
  const { data } = sb.auth.onAuthStateChange((_event, session) => {
    cb(session, session?.user ?? null)
  })
  return () => data.subscription.unsubscribe()
}
