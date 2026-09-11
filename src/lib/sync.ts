import type { PersistedJourney } from './schema'
import { DATA_SCHEMA_VERSION, migratePersisted } from './schema'
import { getSupabase, isSyncConfigured } from './supabase'
import type { ProblemProgress, ProblemStatus } from '../types'

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'error'
  | 'unconfigured'

const STATUS_RANK: Record<ProblemStatus, number> = {
  not_started: 0,
  attempting: 1,
  understood_after_explanation: 2,
  needs_revision: 3,
  solved_with_hint: 4,
  solved_independent: 5,
  mastered: 6,
}

function progressRank(p?: ProblemProgress): number {
  if (!p) return -1
  return (
    STATUS_RANK[p.status] * 100 +
    (p.confidence ?? 0) * 10 +
    Math.min(p.minutesSpent ?? 0, 50) +
    (p.takeaway?.trim() ? 2 : 0) +
    (p.notes?.trim() ? 1 : 0)
  )
}

function touchedMs(p?: ProblemProgress): number {
  if (!p?.lastTouchedAt) return 0
  const n = Date.parse(p.lastTouchedAt)
  return Number.isNaN(n) ? 0 : n
}

/** Prefer the most recently edited copy so intentional downgrades stick. */
export function pickBetterProblem(
  a?: ProblemProgress,
  b?: ProblemProgress,
): ProblemProgress {
  if (!a) return b as ProblemProgress
  if (!b) return a

  const ta = touchedMs(a)
  const tb = touchedMs(b)

  let winner: ProblemProgress
  let loser: ProblemProgress
  if (tb > ta) {
    winner = b
    loser = a
  } else if (ta > tb) {
    winner = a
    loser = b
  } else {
    // Same/missing touch time — fall back to richer progress (cross-device first sync)
    if (progressRank(b) > progressRank(a)) {
      winner = b
      loser = a
    } else {
      winner = a
      loser = b
    }
  }

  return {
    ...winner,
    minutesSpent: Math.max(a.minutesSpent ?? 0, b.minutesSpent ?? 0),
    notes:
      (winner.notes?.length ?? 0) >= (loser.notes?.length ?? 0)
        ? winner.notes
        : loser.notes,
    takeaway:
      (winner.takeaway?.length ?? 0) >= (loser.takeaway?.length ?? 0)
        ? winner.takeaway
        : loser.takeaway,
    revisionDates: Array.from(
      new Set([...(a.revisionDates ?? []), ...(b.revisionDates ?? [])]),
    ),
    firstSolvedAt:
      winner.status === 'not_started'
        ? undefined
        : winner.firstSolvedAt ?? loser.firstSolvedAt,
    nextRevisionAt:
      winner.status === 'not_started'
        ? undefined
        : winner.nextRevisionAt ?? loser.nextRevisionAt,
    lastTouchedAt:
      ta >= tb ? a.lastTouchedAt ?? b.lastTouchedAt : b.lastTouchedAt ?? a.lastTouchedAt,
  }
}

export function journeySubstance(j: PersistedJourney): number {
  let score = 0
  for (const p of Object.values(j.progress ?? {})) {
    score += Math.max(0, progressRank(p))
  }
  score += (j.completedDays?.length ?? 0) * 5
  score += (j.rabbitHoles?.length ?? 0) * 2
  return score
}

/**
 * Merge local + remote. Per-problem lastTouchedAt wins so resets/edits are respected.
 */
export function mergeJourneys(
  local: PersistedJourney,
  remote: PersistedJourney | null,
): PersistedJourney {
  if (!remote) return local

  const ids = new Set([
    ...Object.keys(local.progress ?? {}),
    ...Object.keys(remote.progress ?? {}),
  ])
  const progress: Record<string, ProblemProgress> = {}
  for (const id of ids) {
    progress[id] = pickBetterProblem(local.progress?.[id], remote.progress?.[id])
  }

  const rabbitMap = new Map<string, (typeof local.rabbitHoles)[number]>()
  for (const r of [...(remote.rabbitHoles ?? []), ...(local.rabbitHoles ?? [])]) {
    rabbitMap.set(r.id, r)
  }

  const localTs = Date.parse(local.updatedAt)
  const remoteTs = Date.parse(remote.updatedAt)
  const newerMeta =
    !Number.isNaN(remoteTs) && (Number.isNaN(localTs) || remoteTs > localTs)
      ? remote
      : local

  const merged: PersistedJourney = {
    schemaVersion: DATA_SCHEMA_VERSION,
    dayMode: newerMeta.dayMode ?? local.dayMode,
    progress,
    scheduleAnchor: newerMeta.scheduleAnchor || local.scheduleAnchor,
    completedDays: Array.from(
      new Set([...(local.completedDays ?? []), ...(remote.completedDays ?? [])]),
    ).sort(),
    rabbitHoles: Array.from(rabbitMap.values()),
    moduleStatuses: {
      ...remote.moduleStatuses,
      ...local.moduleStatuses,
    },
    updatedAt:
      !Number.isNaN(remoteTs) && remoteTs > (Number.isNaN(localTs) ? 0 : localTs)
        ? remote.updatedAt
        : local.updatedAt,
  }

  return migratePersisted(merged)
}

/** @deprecated kept for tests — prefer mergeJourneys */
export function pickNewer(
  local: PersistedJourney,
  remote: PersistedJourney | null,
): PersistedJourney {
  return mergeJourneys(local, remote)
}

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

export { isSyncConfigured }
