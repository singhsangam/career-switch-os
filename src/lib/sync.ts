import type { PersistedJourney } from './schema'
import { DATA_SCHEMA_VERSION, migratePersisted } from './schema'
import { getSupabase, isSyncConfigured } from './supabase'

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'error'
  | 'unconfigured'

export async function pullJourney(
  syncId: string,
): Promise<PersistedJourney | null> {
  const sb = getSupabase()
  if (!sb) return null

  const { data, error } = await sb.rpc('fetch_journey', { p_id: syncId })
  if (error) throw error
  if (!data) return null

  const row = Array.isArray(data) ? data[0] : data
  if (!row?.payload) return null
  return migratePersisted({
    ...(row.payload as object),
    schemaVersion: row.schema_version ?? DATA_SCHEMA_VERSION,
    updatedAt: row.updated_at,
  })
}

export async function pushJourney(
  syncId: string,
  journey: PersistedJourney,
): Promise<void> {
  const sb = getSupabase()
  if (!sb) return

  const { error } = await sb.rpc('upsert_journey', {
    p_id: syncId,
    p_schema: journey.schemaVersion,
    p_payload: journey,
    p_updated: journey.updatedAt,
  })
  if (error) throw error
}

/** Keep the newer journey; tie-break prefers local if equal. */
export function pickNewer(
  local: PersistedJourney,
  remote: PersistedJourney | null,
): PersistedJourney {
  if (!remote) return local
  const l = Date.parse(local.updatedAt)
  const r = Date.parse(remote.updatedAt)
  if (Number.isNaN(r)) return local
  if (Number.isNaN(l)) return remote
  return r > l ? remote : local
}

export { isSyncConfigured }
