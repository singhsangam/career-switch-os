import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { mergeJourneys } from '../src/lib/sync'
import { defaultProgress } from '../src/lib/schema'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
const id = 'RTD-E2E2-DOWN-GRADE'

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg)
}

// Step A: cloud has solved
const solved = {
  schemaVersion: 1 as const,
  dayMode: 'normal' as const,
  progress: {
    'nc-1': {
      ...defaultProgress(),
      status: 'solved_independent' as const,
      confidence: 4 as const,
      minutesSpent: 20,
      lastTouchedAt: '2026-09-11T12:00:00.000Z',
    },
  },
  scheduleAnchor: '2026-09-11',
  completedDays: ['2026-09-11'],
  rabbitHoles: [],
  moduleStatuses: { dsa: 'active' as const },
  updatedAt: '2026-09-11T12:00:00.000Z',
}

let res = await sb.rpc('upsert_journey', {
  p_id: id,
  p_schema: 1,
  p_payload: solved,
  p_updated: solved.updatedAt,
})
if (res.error) throw res.error

// Step B: user resets to not_started (newer touch)
const resetLocal = {
  ...solved,
  updatedAt: '2026-09-11T18:00:05.000Z',
  progress: {
    'nc-1': {
      ...defaultProgress(),
      status: 'not_started' as const,
      confidence: 1 as const,
      lastTouchedAt: '2026-09-11T18:00:05.000Z',
    },
  },
}

const pulled = await sb.rpc('fetch_journey', { p_id: id })
if (pulled.error) throw pulled.error
const row = Array.isArray(pulled.data) ? pulled.data[0] : pulled.data
const merged = mergeJourneys(resetLocal, row.payload)
assert(merged.progress['nc-1'].status === 'not_started', 'merge must keep reset')

const stamped = { ...merged, updatedAt: new Date().toISOString() }
res = await sb.rpc('upsert_journey', {
  p_id: id,
  p_schema: 1,
  p_payload: stamped,
  p_updated: stamped.updatedAt,
})
if (res.error) throw res.error

const again = await sb.rpc('fetch_journey', { p_id: id })
const finalRow = Array.isArray(again.data) ? again.data[0] : again.data
assert(
  finalRow.payload.progress['nc-1'].status === 'not_started',
  'cloud must store not_started after reset',
)

// Step C: second device with older solved must not resurrect it
const stalePhone = {
  ...solved,
  updatedAt: '2026-09-11T18:01:00.000Z',
  progress: {
    'nc-1': {
      ...defaultProgress(),
      status: 'solved_independent' as const,
      confidence: 4 as const,
      lastTouchedAt: '2026-09-11T12:00:00.000Z', // older than reset
    },
  },
}
const merged2 = mergeJourneys(stalePhone, finalRow.payload)
assert(
  merged2.progress['nc-1'].status === 'not_started',
  'stale phone solved must not overwrite newer reset',
)

console.log('e2e downgrade PASS')
