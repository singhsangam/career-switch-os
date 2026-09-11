export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Phase = 1 | 2
export type DayMode = 'normal' | 'busy' | 'low'

export type ProblemStatus =
  | 'not_started'
  | 'attempting'
  | 'solved_independent'
  | 'solved_with_hint'
  | 'understood_after_explanation'
  | 'needs_revision'
  | 'mastered'

export type TopicId =
  | 'arrays-hashing'
  | 'two-pointers'
  | 'sliding-window'
  | 'stack'
  | 'binary-search'
  | 'linked-list'
  | 'trees'
  | 'tries'
  | 'heap'
  | 'backtracking'
  | 'graphs'
  | 'advanced-graphs'
  | 'dp-1d'
  | 'dp-2d'
  | 'greedy'
  | 'intervals'
  | 'math-geometry'
  | 'bit-manipulation'

export interface Problem {
  id: string
  order: number
  title: string
  difficulty: Difficulty
  topic: TopicId
  pattern: string
  leetcodeUrl: string
  phase: Phase
  chapterId: string
  /** Effort in fractional study-days (working-pro calibrated) */
  effortDays: number
  whyThis: string
  recallPrompts: string[]
}

export interface Chapter {
  id: string
  title: string
  subtitle: string
  phase: Phase
  topic: TopicId
  order: number
  kind: 'chapter' | 'checkpoint' | 'boss'
}

export interface ProblemProgress {
  status: ProblemStatus
  confidence: 1 | 2 | 3 | 4 | 5
  notes: string
  takeaway: string
  minutesSpent: number
  firstSolvedAt?: string
  lastTouchedAt?: string
  revisionDates: string[]
  nextRevisionAt?: string
  revisionCount: number
}

export interface ScheduleSlot {
  problemId: string
  recommendedStart: string
  recommendedEnd: string
  bufferEnd: string
}

export interface JourneyState {
  dayMode: DayMode
  progress: Record<string, ProblemProgress>
  schedule: ScheduleSlot[]
  scheduleAnchor: string
  lastRecalcAt?: string
  completedDays: string[]
  rabbitHoles: RabbitHole[]
  modules: ModuleMeta[]
}

export interface RabbitHole {
  id: string
  title: string
  notes: string
  createdAt: string
  optional: true
}

export interface ModuleMeta {
  id: string
  title: string
  status: 'active' | 'locked' | 'placeholder'
  description: string
}

export const MILESTONE_DATE = '2026-12-31'
export const JOURNEY_START = '2026-09-11'
