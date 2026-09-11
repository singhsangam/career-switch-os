import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, startOfDay } from 'date-fns'
import { buildSchedule, nextRevisionDate, weightedProgress, isEffectivelyDone } from '../engine/schedule'
import {
  catalogModules,
  defaultModuleStatuses,
  defaultProgress,
  generateSyncCode,
  mergeProgressWithCatalog,
  migratePersisted,
  normalizeSyncCode,
  rebuildSchedule,
  SYNC_ID_KEY,
  toPersisted,
  type PersistedJourney,
} from '../lib/schema'
import {
  isSyncConfigured,
  pickNewer,
  pullJourney,
  pushJourney,
  type SyncStatus,
} from '../lib/sync'
import type {
  DayMode,
  JourneyState,
  ModuleMeta,
  ProblemProgress,
  ProblemStatus,
  RabbitHole,
} from '../types'
import { JOURNEY_START } from '../types'
interface Store extends JourneyState {
  schemaVersion: number
  updatedAt: string
  moduleStatuses: Record<string, ModuleMeta['status']>
  syncId: string | null
  syncStatus: SyncStatus
  syncError: string | null
  lastSyncedAt: string | null
  setDayMode: (mode: DayMode) => void
  updateProblem: (
    id: string,
    patch: Partial<ProblemProgress> & { status?: ProblemStatus },
  ) => void
  logMinutes: (id: string, minutes: number) => void
  markTouchedToday: () => void
  recalculateRoute: (from?: string) => void
  addRabbitHole: (title: string, notes?: string) => void
  removeRabbitHole: (id: string) => void
  resetJourney: () => void
  getWeightedPercent: () => number
  ensureSyncId: () => string
  linkSyncCode: (code: string) => Promise<void>
  syncNow: () => Promise<void>
  applyPersisted: (p: PersistedJourney) => void
  getPersistedSnapshot: () => PersistedJourney
  touchUpdatedAt: () => void
}

function todayKey() {
  return format(startOfDay(new Date()), 'yyyy-MM-dd')
}

function readStoredSyncId(): string | null {
  try {
    return localStorage.getItem(SYNC_ID_KEY)
  } catch {
    return null
  }
}

function writeStoredSyncId(id: string) {
  localStorage.setItem(SYNC_ID_KEY, id)
}

let pushTimer: ReturnType<typeof setTimeout> | null = null

function scheduleCloudPush(get: () => Store) {
  if (!isSyncConfigured()) return
  const id = get().syncId
  if (!id) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void get().syncNow()
  }, 800)
}

export const useJourneyStore = create<Store>()(
  persist(
    (set, get) => ({
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      dayMode: 'normal',
      progress: mergeProgressWithCatalog(undefined),
      schedule: buildSchedule(JOURNEY_START),
      scheduleAnchor: JOURNEY_START,
      completedDays: [],
      rabbitHoles: [],
      moduleStatuses: defaultModuleStatuses(),
      modules: catalogModules(),
      syncId: readStoredSyncId(),
      syncStatus: isSyncConfigured() ? 'idle' : 'unconfigured',
      syncError: null,
      lastSyncedAt: null,

      touchUpdatedAt: () => set({ updatedAt: new Date().toISOString() }),

      getPersistedSnapshot: () => {
        const s = get()
        return toPersisted({
          dayMode: s.dayMode,
          progress: s.progress,
          scheduleAnchor: s.scheduleAnchor,
          completedDays: s.completedDays,
          rabbitHoles: s.rabbitHoles,
          moduleStatuses: s.moduleStatuses,
        })
      },

      applyPersisted: (p) => {
        const migrated = migratePersisted(p)
        set({
          schemaVersion: migrated.schemaVersion,
          updatedAt: migrated.updatedAt,
          dayMode: migrated.dayMode,
          progress: migrated.progress,
          scheduleAnchor: migrated.scheduleAnchor,
          completedDays: migrated.completedDays,
          rabbitHoles: migrated.rabbitHoles,
          moduleStatuses: migrated.moduleStatuses,
          modules: catalogModules(migrated.moduleStatuses),
          schedule: rebuildSchedule(migrated),
        })
      },

      setDayMode: (mode) => {
        set({ dayMode: mode, updatedAt: new Date().toISOString() })
        scheduleCloudPush(get)
      },

      updateProblem: (id, patch) => {
        const prev = get().progress[id] ?? defaultProgress()
        const next: ProblemProgress = { ...prev, ...patch }
        const becameDone =
          patch.status &&
          isEffectivelyDone(patch.status) &&
          !isEffectivelyDone(prev.status)

        if (becameDone) {
          next.firstSolvedAt = next.firstSolvedAt ?? todayKey()
          next.lastTouchedAt = todayKey()
          next.nextRevisionAt = nextRevisionDate(
            next.confidence,
            next.revisionCount,
          )
        }

        if (
          patch.status === 'needs_revision' ||
          patch.confidence === 1 ||
          patch.confidence === 2
        ) {
          if (isEffectivelyDone(next.status) && next.status !== 'mastered') {
            next.status = 'needs_revision'
            next.nextRevisionAt = todayKey()
          }
        }

        set((s) => ({
          progress: { ...s.progress, [id]: next },
          updatedAt: new Date().toISOString(),
        }))

        if (becameDone) {
          get().recalculateRoute(todayKey())
          get().markTouchedToday()
        }
        scheduleCloudPush(get)
      },

      logMinutes: (id, minutes) => {
        const prev = get().progress[id] ?? defaultProgress()
        set((s) => ({
          progress: {
            ...s.progress,
            [id]: {
              ...prev,
              minutesSpent: prev.minutesSpent + minutes,
              lastTouchedAt: todayKey(),
            },
          },
          updatedAt: new Date().toISOString(),
        }))
        scheduleCloudPush(get)
      },

      markTouchedToday: () => {
        const t = todayKey()
        set((s) => ({
          completedDays: s.completedDays.includes(t)
            ? s.completedDays
            : [...s.completedDays, t],
          updatedAt: new Date().toISOString(),
        }))
        scheduleCloudPush(get)
      },

      recalculateRoute: (from) => {
        const done = new Set(
          Object.entries(get().progress)
            .filter(([, p]) => isEffectivelyDone(p.status))
            .map(([id]) => id),
        )
        const anchor = from ?? todayKey()
        set({
          schedule: buildSchedule(anchor, done),
          scheduleAnchor: anchor,
          lastRecalcAt: todayKey(),
          updatedAt: new Date().toISOString(),
        })
        scheduleCloudPush(get)
      },

      addRabbitHole: (title, notes = '') => {
        const hole: RabbitHole = {
          id: `rh-${Date.now()}`,
          title,
          notes,
          createdAt: todayKey(),
          optional: true,
        }
        set((s) => ({
          rabbitHoles: [hole, ...s.rabbitHoles],
          updatedAt: new Date().toISOString(),
        }))
        scheduleCloudPush(get)
      },

      removeRabbitHole: (id) => {
        set((s) => ({
          rabbitHoles: s.rabbitHoles.filter((r) => r.id !== id),
          updatedAt: new Date().toISOString(),
        }))
        scheduleCloudPush(get)
      },

      resetJourney: () => {
        set({
          dayMode: 'normal',
          progress: mergeProgressWithCatalog(undefined),
          schedule: buildSchedule(JOURNEY_START),
          scheduleAnchor: JOURNEY_START,
          completedDays: [],
          rabbitHoles: [],
          moduleStatuses: defaultModuleStatuses(),
          modules: catalogModules(),
          updatedAt: new Date().toISOString(),
        })
        scheduleCloudPush(get)
      },

      getWeightedPercent: () => weightedProgress(get().progress),

      ensureSyncId: () => {
        const existing = get().syncId ?? readStoredSyncId()
        if (existing) {
          writeStoredSyncId(existing)
          set({ syncId: existing })
          return existing
        }
        const id = generateSyncCode()
        writeStoredSyncId(id)
        set({ syncId: id })
        return id
      },

      linkSyncCode: async (code) => {
        const id = normalizeSyncCode(code)
        if (!id.startsWith('RTD-') || id.length < 14) {
          throw new Error('Use a code like RTD-XXXX-XXXX-XXXX')
        }
        writeStoredSyncId(id)
        set({ syncId: id, syncStatus: 'syncing', syncError: null })

        if (!isSyncConfigured()) {
          set({ syncStatus: 'unconfigured' })
          return
        }

        try {
          const remote = await pullJourney(id)
          const local = get().getPersistedSnapshot()
          if (remote) {
            const winner = pickNewer(local, remote)
            get().applyPersisted(winner)
            await pushJourney(id, get().getPersistedSnapshot())
          } else {
            await pushJourney(id, local)
          }
          set({
            syncStatus: 'synced',
            lastSyncedAt: new Date().toISOString(),
            syncError: null,
          })
        } catch (e) {
          set({
            syncStatus: 'error',
            syncError: e instanceof Error ? e.message : 'Sync failed',
          })
          throw e
        }
      },

      syncNow: async () => {
        if (!isSyncConfigured()) {
          set({ syncStatus: 'unconfigured' })
          return
        }
        const id = get().ensureSyncId()
        set({ syncStatus: 'syncing', syncError: null })
        try {
          const remote = await pullJourney(id)
          const local = get().getPersistedSnapshot()
          const winner = pickNewer(local, remote)
          if (winner !== local) {
            get().applyPersisted(winner)
          }
          const snapshot = get().getPersistedSnapshot()
          await pushJourney(id, snapshot)
          set({
            syncStatus: 'synced',
            lastSyncedAt: new Date().toISOString(),
            syncError: null,
          })
        } catch (e) {
          const offline =
            typeof navigator !== 'undefined' && navigator.onLine === false
          set({
            syncStatus: offline ? 'offline' : 'error',
            syncError: e instanceof Error ? e.message : 'Sync failed',
          })
        }
      },
    }),
    {
      name: 'career-switch-os-v1',
      version: 1,
      migrate: (persisted) => {
        // Zustand persist migrate — preserve progress across app/plugin updates
        const migrated = migratePersisted(persisted)
        return {
          ...migrated,
          schedule: rebuildSchedule(migrated),
          modules: catalogModules(migrated.moduleStatuses),
          syncId: readStoredSyncId(),
          syncStatus: isSyncConfigured() ? 'idle' : 'unconfigured',
          syncError: null,
          lastSyncedAt: null,
        }
      },
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        updatedAt: s.updatedAt,
        dayMode: s.dayMode,
        progress: s.progress,
        scheduleAnchor: s.scheduleAnchor,
        completedDays: s.completedDays,
        rabbitHoles: s.rabbitHoles,
        moduleStatuses: s.moduleStatuses,
        // schedule + modules rebuilt from catalog on hydrate so code updates apply cleanly
      }),
      merge: (persisted, current) => {
        const migrated = migratePersisted(persisted)
        return {
          ...current,
          ...migrated,
          progress: mergeProgressWithCatalog(migrated.progress),
          modules: catalogModules(migrated.moduleStatuses),
          schedule: rebuildSchedule(migrated),
          syncId: readStoredSyncId() ?? current.syncId,
          syncStatus: isSyncConfigured() ? 'idle' : 'unconfigured',
        }
      },
    },
  ),
)

export function revisionsDueToday(
  progress: Record<string, ProblemProgress>,
  today = todayKey(),
): string[] {
  return Object.entries(progress)
    .filter(
      ([, p]) =>
        p.nextRevisionAt &&
        p.nextRevisionAt <= today &&
        p.status !== 'mastered' &&
        p.status !== 'not_started',
    )
    .map(([id]) => id)
}

export function currentMissionSlot(
  schedule: ReturnType<typeof buildSchedule>,
  progress: Record<string, ProblemProgress>,
) {
  return schedule.find(
    (s) => !isEffectivelyDone(progress[s.problemId]?.status ?? 'not_started'),
  )
}
