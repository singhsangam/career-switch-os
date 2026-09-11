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
const id = 'RTD-E2E1-E2E2-E2E3'

const laptop = {
  schemaVersion: 1 as const,
  dayMode: 'normal' as const,
  progress: {
    'nc-1': {
      ...defaultProgress(),
      status: 'solved_independent' as const,
      confidence: 4 as const,
      takeaway: 'hash',
      minutesSpent: 20,
    },
  },
  scheduleAnchor: '2026-09-11',
  completedDays: ['2026-09-11'],
  rabbitHoles: [],
  moduleStatuses: { dsa: 'active' as const },
  updatedAt: '2026-09-11T12:00:00.000Z',
}

const phone = {
  schemaVersion: 1 as const,
  dayMode: 'normal' as const,
  progress: {
    'nc-2': {
      ...defaultProgress(),
      status: 'attempting' as const,
      confidence: 2 as const,
      minutesSpent: 5,
    },
  },
  scheduleAnchor: '2026-09-11',
  completedDays: [],
  rabbitHoles: [],
  moduleStatuses: { dsa: 'active' as const },
  updatedAt: '2026-09-11T18:00:00.000Z',
}

const up = await sb.rpc('upsert_journey', {
  p_id: id,
  p_schema: 1,
  p_payload: laptop,
  p_updated: laptop.updatedAt,
})
if (up.error) throw up.error

const pulled = await sb.rpc('fetch_journey', { p_id: id })
if (pulled.error) throw pulled.error
const row = Array.isArray(pulled.data) ? pulled.data[0] : pulled.data
const merged = mergeJourneys(phone, row.payload)
const stamped = { ...merged, updatedAt: new Date().toISOString() }

const up2 = await sb.rpc('upsert_journey', {
  p_id: id,
  p_schema: 1,
  p_payload: stamped,
  p_updated: stamped.updatedAt,
})
if (up2.error) throw up2.error

const again = await sb.rpc('fetch_journey', { p_id: id })
const finalRow = Array.isArray(again.data) ? again.data[0] : again.data
const final = finalRow.payload

const pass =
  final.progress['nc-1']?.status === 'solved_independent' &&
  final.progress['nc-2']?.status === 'attempting'

console.log('nc1', final.progress['nc-1']?.status)
console.log('nc2', final.progress['nc-2']?.status)
console.log('e2e', pass ? 'PASS' : 'FAIL')
if (!pass) process.exit(1)
