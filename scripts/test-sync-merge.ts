import { mergeJourneys, pickBetterProblem, journeySubstance } from '../src/lib/sync'
import type { PersistedJourney } from '../src/lib/schema'
import { defaultProgress } from '../src/lib/schema'
import type { ProblemProgress } from '../src/types'

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg)
}

function p(partial: Partial<ProblemProgress>): ProblemProgress {
  return { ...defaultProgress(), ...partial }
}

function journey(
  partial: Partial<PersistedJourney> & { progress?: PersistedJourney['progress'] },
): PersistedJourney {
  return {
    schemaVersion: 1,
    dayMode: 'normal',
    progress: {},
    scheduleAnchor: '2026-09-11',
    completedDays: [],
    rabbitHoles: [],
    moduleStatuses: {},
    updatedAt: '2026-09-11T10:00:00.000Z',
    ...partial,
  }
}

// 1) Empty newer phone must not wipe laptop progress (no lastTouchedAt on empty)
{
  const emptyPhone = journey({ updatedAt: '2026-09-11T15:00:00.000Z' })
  const laptop = journey({
    updatedAt: '2026-09-11T12:00:00.000Z',
    progress: {
      'nc-1': p({
        status: 'solved_independent',
        confidence: 4,
        takeaway: 'hash set',
        minutesSpent: 25,
        lastTouchedAt: '2026-09-11T12:00:00.000Z',
      }),
    },
    completedDays: ['2026-09-11'],
  })
  const merged = mergeJourneys(emptyPhone, laptop)
  assert(
    merged.progress['nc-1']?.status === 'solved_independent',
    'empty newer phone must not wipe laptop progress',
  )
  assert(journeySubstance(merged) > 0, 'merged should have substance')
}

// 2) Intentional downgrade must win over older solved in cloud
{
  const cloud = p({
    status: 'solved_independent',
    confidence: 5,
    lastTouchedAt: '2026-09-11T12:00:00.000Z',
  })
  const localReset = p({
    status: 'not_started',
    confidence: 1,
    lastTouchedAt: '2026-09-11T18:30:00.000Z',
  })
  const picked = pickBetterProblem(localReset, cloud)
  assert(picked.status === 'not_started', 'newer not_started must beat older solved')
}

// 3) Newer remote solved must beat older local not_started
{
  const local = p({
    status: 'not_started',
    lastTouchedAt: '2026-09-11T10:00:00.000Z',
  })
  const remote = p({
    status: 'solved_independent',
    lastTouchedAt: '2026-09-11T19:00:00.000Z',
  })
  assert(
    pickBetterProblem(local, remote).status === 'solved_independent',
    'newer remote solved should win',
  )
}

// 4) Merge across devices keeps distinct problems
{
  const phone = journey({
    updatedAt: '2026-09-11T16:00:00.000Z',
    progress: {
      'nc-1': p({
        status: 'solved_with_hint',
        confidence: 3,
        minutesSpent: 10,
        lastTouchedAt: '2026-09-11T15:00:00.000Z',
      }),
      'nc-2': p({
        status: 'attempting',
        confidence: 2,
        lastTouchedAt: '2026-09-11T16:00:00.000Z',
      }),
    },
  })
  const laptop = journey({
    updatedAt: '2026-09-11T12:00:00.000Z',
    progress: {
      'nc-1': p({
        status: 'solved_independent',
        confidence: 4,
        minutesSpent: 25,
        lastTouchedAt: '2026-09-11T17:00:00.000Z', // laptop edited later
      }),
    },
  })
  const both = mergeJourneys(phone, laptop)
  assert(both.progress['nc-1']?.status === 'solved_independent', 'later laptop edit wins')
  assert(both.progress['nc-2']?.status === 'attempting', 'keep phone-only progress')
  assert((both.progress['nc-1']?.minutesSpent ?? 0) >= 25, 'keep max minutes')
}

// 5) Simulate user toggle solved -> not_started then sync with stale cloud
{
  const staleCloud = journey({
    updatedAt: '2026-09-11T18:00:00.000Z',
    progress: {
      'nc-1': p({
        status: 'solved_independent',
        confidence: 4,
        lastTouchedAt: '2026-09-11T18:00:00.000Z',
      }),
    },
  })
  const afterReset = journey({
    updatedAt: '2026-09-11T18:00:05.000Z',
    progress: {
      'nc-1': p({
        status: 'not_started',
        confidence: 4,
        lastTouchedAt: '2026-09-11T18:00:05.000Z',
      }),
    },
  })
  const afterSync = mergeJourneys(afterReset, staleCloud)
  assert(
    afterSync.progress['nc-1']?.status === 'not_started',
    'status reset must survive sync with stale solved cloud',
  )
}

// 6) solved -> attempting intermediate also sticks
{
  const cloud = p({
    status: 'solved_independent',
    lastTouchedAt: '2026-09-11T12:00:00.000Z',
  })
  const local = p({
    status: 'attempting',
    lastTouchedAt: '2026-09-11T20:00:00.000Z',
  })
  assert(
    pickBetterProblem(local, cloud).status === 'attempting',
    'newer attempting must beat older solved',
  )
}

console.log('sync-merge tests passed (6/6)')
