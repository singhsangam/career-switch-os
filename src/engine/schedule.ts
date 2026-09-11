import {
  addDays,
  differenceInCalendarDays,
  format,
  isSaturday,
  isSunday,
  isWeekend,
  parseISO,
  startOfDay,
} from 'date-fns'
import { PROBLEMS } from '../data/neetcode150'
import type {
  DayMode,
  ProblemProgress,
  ScheduleSlot,
} from '../types'
import { JOURNEY_START, MILESTONE_DATE } from '../types'

/** Weekday: ~1.0 study-day units available; weekend day: ~1.8 */
function capacityForDate(d: Date): number {
  if (isSaturday(d) || isSunday(d)) return 1.8
  return 1.0
}

/** Leave ~20% weekly slack as buffer by reducing effective capacity */
function effectiveCapacity(d: Date): number {
  return capacityForDate(d) * 0.8
}

function toKey(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function buildSchedule(
  fromDate: string = JOURNEY_START,
  completedIds: Set<string> = new Set(),
): ScheduleSlot[] {
  const remaining = PROBLEMS.filter((p) => !completedIds.has(p.id)).sort(
    (a, b) => a.order - b.order,
  )

  const slots: ScheduleSlot[] = []
  let cursor = startOfDay(parseISO(fromDate))
  let dayBudget = effectiveCapacity(cursor)

  for (const problem of remaining) {
    while (dayBudget < 0.15) {
      cursor = addDays(cursor, 1)
      dayBudget = effectiveCapacity(cursor)
    }

    const start = cursor
    let effortLeft = problem.effortDays
    let end = cursor
    let localBudget = dayBudget

    while (effortLeft > 0.05) {
      const take = Math.min(effortLeft, localBudget)
      effortLeft -= take
      localBudget -= take
      end = cursor
      if (effortLeft > 0.05) {
        cursor = addDays(cursor, 1)
        localBudget = effectiveCapacity(cursor)
      }
    }

    dayBudget = localBudget
    const bufferDays =
      problem.difficulty === 'Hard' ? 2 : problem.difficulty === 'Medium' ? 1 : 0

    slots.push({
      problemId: problem.id,
      recommendedStart: toKey(start),
      recommendedEnd: toKey(end),
      bufferEnd: toKey(addDays(end, bufferDays)),
    })
  }

  return slots
}

export function isEffectivelyDone(status: ProblemProgress['status']): boolean {
  return (
    status === 'solved_independent' ||
    status === 'solved_with_hint' ||
    status === 'understood_after_explanation' ||
    status === 'mastered'
  )
}

export function weightedProgress(
  progress: Record<string, ProblemProgress>,
): number {
  let earned = 0
  let total = 0
  for (const p of PROBLEMS) {
    const weight =
      p.difficulty === 'Hard' ? 3 : p.difficulty === 'Medium' ? 2 : 1
    total += weight
    const st = progress[p.id]?.status
    if (!st || st === 'not_started' || st === 'attempting') continue
    if (st === 'mastered') earned += weight
    else if (st === 'solved_independent') earned += weight * 0.9
    else if (st === 'solved_with_hint') earned += weight * 0.65
    else if (st === 'understood_after_explanation') earned += weight * 0.5
    else if (st === 'needs_revision') earned += weight * 0.4
  }
  return total === 0 ? 0 : Math.round((earned / total) * 1000) / 10
}

export function nextRevisionDate(
  confidence: number,
  revisionCount: number,
  from: Date = new Date(),
): string {
  const base = [2, 7, 21, 45]
  let days = base[Math.min(revisionCount, base.length - 1)]
  if (confidence <= 2) days = Math.max(1, Math.floor(days * 0.5))
  if (confidence >= 5) days = Math.floor(days * 1.5)
  return toKey(addDays(startOfDay(from), days))
}

export function journeyMessage(opts: {
  percent: number
  projectedEnd?: string
  daysShifted: number
}): string {
  const { percent, projectedEnd, daysShifted } = opts
  if (daysShifted > 0) {
    return `Your journey has shifted by ${daysShifted} day${daysShifted === 1 ? '' : 's'}. Here's the new route — no backlog, just a recalibrated path.`
  }
  if (projectedEnd && projectedEnd > MILESTONE_DATE) {
    return `December 31 is still the north star. At the current pace the map extends a little past it — that's okay. Consistency beats a crushed schedule.`
  }
  if (percent >= 5 && projectedEnd && projectedEnd < MILESTONE_DATE) {
    return `You're slightly ahead. Don't add more work. Use the buffer.`
  }
  return `One meaningful step today is enough. Job first — this journey waits without judgment.`
}

export function daysUntilMilestone(today: Date = new Date()): number {
  return Math.max(0, differenceInCalendarDays(parseISO(MILESTONE_DATE), today))
}

export function missionForMode(
  mode: DayMode,
  primary: ScheduleSlot | undefined,
  revisionsDue: string[],
): { kind: 'mission' | 'revision' | 'light' | 'rest'; title: string; detail: string; problemId?: string } {
  if (mode === 'low') {
    if (revisionsDue[0]) {
      return {
        kind: 'light',
        title: 'Low-energy continuity',
        detail: "Skim your notes or recall the pattern for one past problem. Ten minutes. That's a win.",
        problemId: revisionsDue[0],
      }
    }
    return {
      kind: 'light',
      title: 'Low-energy continuity',
      detail: 'Read one takeaway you wrote earlier, or answer: what pattern am I in this chapter? Then stop.',
    }
  }

  if (mode === 'busy') {
    if (revisionsDue[0]) {
      return {
        kind: 'revision',
        title: 'Busy-day revision',
        detail: 'Re-solve or review one prior problem. 20–30 minutes. Continuity over volume.',
        problemId: revisionsDue[0],
      }
    }
    return {
      kind: 'light',
      title: 'Busy-day micro-mission',
      detail: primary
        ? 'Read the problem statement and outline the pattern only — full solve can wait for a normal day.'
        : 'Review one pattern card. Protect your energy for work.',
      problemId: primary?.problemId,
    }
  }

  // Prefer a due revision about one in four calendar days (deterministic)
  const day = new Date().getDate()
  if (revisionsDue[0] && day % 4 === 0) {
    return {
      kind: 'revision',
      title: 'Spaced revision',
      detail: 'A past problem is due for active recall. Prefer understanding over rushing forward.',
      problemId: revisionsDue[0],
    }
  }

  if (!primary) {
    return {
      kind: 'rest',
      title: 'Map complete for now',
      detail: 'No active DSA mission queued. Revisit weak-confidence problems or rest.',
    }
  }

  return {
    kind: 'mission',
    title: "Today's mission",
    detail: "Understand the pattern, attempt independently, record confidence, write one takeaway. That's enough for today.",
    problemId: primary.problemId,
  }
}

export function weekStats(
  schedule: ScheduleSlot[],
  progress: Record<string, ProblemProgress>,
  today: Date = new Date(),
) {
  const start = addDays(today, -((today.getDay() + 6) % 7)) // Monday
  const days = Array.from({ length: 7 }, (_, i) => toKey(addDays(start, i)))
  const weekSlots = schedule.filter((s) =>
    days.some((d) => d >= s.recommendedStart && d <= s.bufferEnd),
  )
  const completed = weekSlots.filter((s) =>
    isEffectivelyDone(progress[s.problemId]?.status ?? 'not_started'),
  ).length
  const bufferDays = days.filter((d) => {
    const date = parseISO(d)
    return isWeekend(date)
  }).length
  return {
    planned: weekSlots.length,
    completed,
    bufferDays: Math.max(1, Math.round(bufferDays * 0.5)),
    weekStart: days[0],
  }
}

export function projectedEndDate(schedule: ScheduleSlot[]): string | undefined {
  if (!schedule.length) return undefined
  return schedule[schedule.length - 1].bufferEnd
}
