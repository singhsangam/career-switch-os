import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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
    client = createClient(env('VITE_SUPABASE_URL')!, env('VITE_SUPABASE_ANON_KEY')!)
  }
  return client
}
