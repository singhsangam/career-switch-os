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

export async function signInWithEmail(email: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) throw new Error('Cloud is not configured')
  const { error } = await sb.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: appRedirectUrl(),
      shouldCreateUser: true,
    },
  })
  if (error) throw error
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
