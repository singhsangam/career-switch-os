import { PROBLEMS } from '../data/neetcode150'
import { buildSchedule } from '../engine/schedule'
import type {
  DayMode,
  ModuleMeta,
  ProblemProgress,
  RabbitHole,
  ScheduleSlot,
} from '../types'
import { JOURNEY_START } from '../types'

/** Bump only when persisted shape changes. App UI/feature deploys do NOT need this. */
export const DATA_SCHEMA_VERSION = 1

export const LOCAL_STORE_KEY = 'career-switch-os-v1'
export const SYNC_ID_KEY = 'career-switch-os-sync-id'

export type PersistedJourney = {
  schemaVersion: number
  dayMode: DayMode
  progress: Record<string, ProblemProgress>
  scheduleAnchor: string
  completedDays: string[]
  rabbitHoles: RabbitHole[]
  /** Only status overrides — titles/descriptions always come from app code */
  moduleStatuses: Record<string, ModuleMeta['status']>
  updatedAt: string
}

export function defaultProgress(): ProblemProgress {
  return {
    status: 'not_started',
    confidence: 1,
    notes: '',
    takeaway: '',
    minutesSpent: 0,
    revisionDates: [],
    revisionCount: 0,
  }
}

export function defaultModuleStatuses(): Record<string, ModuleMeta['status']> {
  return {
    dsa: 'active',
    'system-design': 'placeholder',
    distributed: 'placeholder',
    backend: 'locked',
    cloud: 'locked',
    ai: 'locked',
  }
}

export function catalogModules(
  statuses: Record<string, ModuleMeta['status']> = defaultModuleStatuses(),
): ModuleMeta[] {
  const defs: Omit<ModuleMeta, 'status'>[] = [
    {
      id: 'dsa',
      title: 'Module 1 — DSA Journey',
      description: 'NeetCode 150 · Phase 1 Foundation + Phase 2 Deepening',
    },
    {
      id: 'system-design',
      title: 'Module 2 — System Design',
      description: 'Locked for V1. Activate later without rebuilding the roadmap.',
    },
    {
      id: 'distributed',
      title: 'Module 3 — Distributed Systems',
      description: 'Your differentiator — PowerScale / storage parallels later.',
    },
    {
      id: 'backend',
      title: 'Module 4 — Backend Engineering',
      description: 'Production services, APIs, reliability.',
    },
    {
      id: 'cloud',
      title: 'Module 7 — Cloud / AWS',
      description: 'Infrastructure depth on demand.',
    },
    {
      id: 'ai',
      title: 'Module 8 — AI Infrastructure',
      description: 'Future arc — not on the critical path yet.',
    },
  ]
  return defs.map((d) => ({
    ...d,
    status: statuses[d.id] ?? defaultModuleStatuses()[d.id] ?? 'locked',
  }))
}

/** Keep solved progress forever; add defaults for newly shipped problems. */
export function mergeProgressWithCatalog(
  saved: Record<string, ProblemProgress> | undefined,
): Record<string, ProblemProgress> {
  const next: Record<string, ProblemProgress> = {}
  for (const p of PROBLEMS) {
    next[p.id] = { ...defaultProgress(), ...(saved?.[p.id] ?? {}) }
  }
  // Retain orphan progress (removed/renamed ids) so a bad deploy can't erase history
  if (saved) {
    for (const [id, value] of Object.entries(saved)) {
      if (!(id in next)) next[id] = value
    }
  }
  return next
}

export function migratePersisted(raw: unknown): PersistedJourney {
  const base: PersistedJourney = {
    schemaVersion: DATA_SCHEMA_VERSION,
    dayMode: 'normal',
    progress: mergeProgressWithCatalog(undefined),
    scheduleAnchor: JOURNEY_START,
    completedDays: [],
    rabbitHoles: [],
    moduleStatuses: defaultModuleStatuses(),
    updatedAt: new Date().toISOString(),
  }

  if (!raw || typeof raw !== 'object') return base
  const r = raw as Record<string, unknown>

  // Legacy zustand shape (pre-sync) — progress lived at top level or under state
  const legacyState = (r.state as Record<string, unknown>) ?? r
  const version =
    typeof r.schemaVersion === 'number'
      ? r.schemaVersion
      : typeof legacyState.schemaVersion === 'number'
        ? (legacyState.schemaVersion as number)
        : 0

  const progressIn =
    (legacyState.progress as Record<string, ProblemProgress>) ??
    (r.progress as Record<string, ProblemProgress>)

  const moduleStatuses = {
    ...defaultModuleStatuses(),
    ...((legacyState.moduleStatuses as Record<string, ModuleMeta['status']>) ??
      {}),
  }

  // Old builds stored full modules array — harvest statuses only
  const oldModules = legacyState.modules as ModuleMeta[] | undefined
  if (Array.isArray(oldModules)) {
    for (const m of oldModules) {
      if (m?.id && m.status) moduleStatuses[m.id] = m.status
    }
  }

  let migrated: PersistedJourney = {
    ...base,
    dayMode: (legacyState.dayMode as DayMode) ?? 'normal',
    progress: mergeProgressWithCatalog(progressIn),
    scheduleAnchor:
      (legacyState.scheduleAnchor as string) ?? JOURNEY_START,
    completedDays: Array.isArray(legacyState.completedDays)
      ? (legacyState.completedDays as string[])
      : [],
    rabbitHoles: Array.isArray(legacyState.rabbitHoles)
      ? (legacyState.rabbitHoles as RabbitHole[])
      : [],
    moduleStatuses,
    updatedAt:
      typeof legacyState.updatedAt === 'string'
        ? legacyState.updatedAt
        : new Date().toISOString(),
    schemaVersion: DATA_SCHEMA_VERSION,
  }

  // Future migrations: if (version < 2) { ... }
  void version
  return migrated
}

export function rebuildSchedule(persisted: PersistedJourney): ScheduleSlot[] {
  const done = new Set(
    Object.entries(persisted.progress)
      .filter(([, p]) =>
        [
          'solved_independent',
          'solved_with_hint',
          'understood_after_explanation',
          'mastered',
        ].includes(p.status),
      )
      .map(([id]) => id),
  )
  return buildSchedule(persisted.scheduleAnchor || JOURNEY_START, done)
}

export function toPersisted(input: {
  dayMode: DayMode
  progress: Record<string, ProblemProgress>
  scheduleAnchor: string
  completedDays: string[]
  rabbitHoles: RabbitHole[]
  moduleStatuses: Record<string, ModuleMeta['status']>
}): PersistedJourney {
  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    dayMode: input.dayMode,
    progress: mergeProgressWithCatalog(input.progress),
    scheduleAnchor: input.scheduleAnchor,
    completedDays: input.completedDays,
    rabbitHoles: input.rabbitHoles,
    moduleStatuses: input.moduleStatuses,
    updatedAt: new Date().toISOString(),
  }
}

export function generateSyncCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const chunk = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
      '',
    )
  return `RTD-${chunk(4)}-${chunk(4)}-${chunk(4)}`
}

export function normalizeSyncCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '')
}
