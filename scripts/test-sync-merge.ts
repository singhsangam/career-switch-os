import { mergeJourneys, journeySubstance } from '../src/lib/sync'
import type { PersistedJourney } from '../src/lib/schema'
import { defaultProgress } from '../src/lib/schema'

function journey(
  partial: Partial<PersistedJourney> & {
    progress?: PersistedJourney['progress']
  },
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

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg)
}

const emptyPhone = journey({
  updatedAt: '2026-09-11T15:00:00.000Z', // newer stamp, empty progress
})

const laptop = journey({
  updatedAt: '2026-09-11T12:00:00.000Z',
  progress: {
    'nc-1': {
      ...defaultProgress(),
      status: 'solved_independent',
      confidence: 4,
      takeaway: 'hash set',
      minutesSpent: 25,
    },
  },
  completedDays: ['2026-09-11'],
})

const merged = mergeJourneys(emptyPhone, laptop)
assert(
  merged.progress['nc-1']?.status === 'solved_independent',
  'empty newer phone must not wipe laptop progress',
)
assert(journeySubstance(merged) > 0, 'merged should have substance')

const phoneSolved = journey({
  updatedAt: '2026-09-11T16:00:00.000Z',
  progress: {
    'nc-1': {
      ...defaultProgress(),
      status: 'solved_with_hint',
      confidence: 3,
      minutesSpent: 10,
    },
    'nc-2': {
      ...defaultProgress(),
      status: 'attempting',
      confidence: 2,
    },
  },
})

const both = mergeJourneys(phoneSolved, laptop)
assert(both.progress['nc-1']?.status === 'solved_independent', 'keep better status')
assert(both.progress['nc-2']?.status === 'attempting', 'keep phone-only progress')
assert(
  (both.progress['nc-1']?.minutesSpent ?? 0) >= 25,
  'keep max minutes',
)

console.log('sync-merge tests passed')
