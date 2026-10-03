import type { Difficulty, DriveType, RoundStatus, RoundType, Stage, Verdict } from './types'

/**
 * Visual metadata for each pipeline stage. Tailwind class strings are written
 * out in full (never interpolated) so the compiler can detect them.
 */
interface StageMeta {
  label: string
  short: string
  /** Pill used wherever the stage is named (company page, etc.). */
  badge: string
  dot: string
  bar: string
  /** Kanban column background + border. */
  column: string
  /** Left stripe on a Kanban card. */
  accent: string
  /** Kanban column title colour. */
  heading: string
  /** Kanban column count pill. */
  count: string
  /** Company initials tile on a Kanban card. */
  avatar: string
}

export const STAGE_ORDER: Stage[] = [
  'APPLIED',
  'PPT',
  'OA',
  'SHORTLISTED',
  'GD',
  'TECH',
  'HR',
  'OFFER',
  'REJECTED',
]

/*
 * Outside the pipeline, colour carries meaning: indigo = scheduled,
 * green = success, amber = attention, red = negative. Categories that carry
 * no judgement (round type, drive type) stay neutral.
 */
const NEUTRAL = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
const SCHEDULED = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
const SUCCESS = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
const ATTENTION = 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
const NEGATIVE = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'

/*
 * Each pipeline stage has its own hue so the board is easy to scan:
 * early stages are cool (slate, cyan, sky, violet), interview stages warm up
 * (amber, blue, fuchsia), and outcomes are green (offer) or red (rejected).
 */
export const STAGE_META: Record<Stage, StageMeta> = {
  PPT: {
    label: 'Pre-placement talk',
    short: 'PPT',
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
    dot: 'bg-cyan-500',
    bar: 'bg-cyan-500',
    column: 'border-cyan-200 bg-cyan-50 dark:border-cyan-900/50 dark:bg-cyan-950/20',
    accent: 'border-l-cyan-500 dark:border-l-cyan-500',
    heading: 'text-cyan-800 dark:text-cyan-300',
    count: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    avatar: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  },
  APPLIED: {
    label: 'Applied',
    short: 'Applied',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-500 dark:bg-slate-400',
    bar: 'bg-slate-500 dark:bg-slate-400',
    column: 'border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50',
    accent: 'border-l-slate-400 dark:border-l-slate-400',
    heading: 'text-slate-800 dark:text-slate-200',
    count: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    avatar: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  OA: {
    label: 'Online assessment',
    short: 'OA',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
    column: 'border-sky-200 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/20',
    accent: 'border-l-sky-500 dark:border-l-sky-500',
    heading: 'text-sky-800 dark:text-sky-300',
    count: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    avatar: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    short: 'Shortlisted',
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
    column: 'border-violet-200 bg-violet-50 dark:border-violet-900/50 dark:bg-violet-950/20',
    accent: 'border-l-violet-500 dark:border-l-violet-500',
    heading: 'text-violet-800 dark:text-violet-300',
    count: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    avatar: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  GD: {
    label: 'Group discussion',
    short: 'GD',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    column: 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20',
    accent: 'border-l-amber-500 dark:border-l-amber-500',
    heading: 'text-amber-800 dark:text-amber-300',
    count: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    avatar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  TECH: {
    label: 'Technical',
    short: 'Tech',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
    column: 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20',
    accent: 'border-l-blue-500 dark:border-l-blue-500',
    heading: 'text-blue-800 dark:text-blue-300',
    count: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    avatar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  HR: {
    label: 'HR round',
    short: 'HR',
    badge: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300',
    dot: 'bg-fuchsia-500',
    bar: 'bg-fuchsia-500',
    column: 'border-fuchsia-200 bg-fuchsia-50 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/20',
    accent: 'border-l-fuchsia-500 dark:border-l-fuchsia-500',
    heading: 'text-fuchsia-800 dark:text-fuchsia-300',
    count: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
    avatar: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  },
  OFFER: {
    label: 'Offer',
    short: 'Offer',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    column: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20',
    accent: 'border-l-emerald-500 dark:border-l-emerald-500',
    heading: 'text-emerald-800 dark:text-emerald-300',
    count: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    avatar: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  REJECTED: {
    label: 'Rejected',
    short: 'Rejected',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    column: 'border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20',
    accent: 'border-l-rose-500 dark:border-l-rose-500',
    heading: 'text-rose-800 dark:text-rose-300',
    count: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    avatar: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
}

export const ROUND_TYPE_META: Record<RoundType, { label: string; badge: string }> = {
  PPT: { label: 'Pre-placement talk', badge: NEUTRAL },
  OA: { label: 'Online assessment', badge: NEUTRAL },
  GD: { label: 'Group discussion', badge: NEUTRAL },
  TECHNICAL: { label: 'Technical interview', badge: NEUTRAL },
  HR: { label: 'HR interview', badge: NEUTRAL },
  OTHER: { label: 'Other', badge: NEUTRAL },
}

export const ROUND_STATUS_META: Record<RoundStatus, { label: string; badge: string }> = {
  SCHEDULED: { label: 'Scheduled', badge: SCHEDULED },
  COMPLETED: { label: 'Completed', badge: NEUTRAL },
  CLEARED: { label: 'Cleared', badge: SUCCESS },
  FAILED: { label: 'Did not clear', badge: NEGATIVE },
  CANCELLED: { label: 'Cancelled', badge: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
}

export const DRIVE_TYPE_META: Record<DriveType, { label: string; badge: string }> = {
  ON_CAMPUS: { label: 'On-campus', badge: NEUTRAL },
  OFF_CAMPUS: { label: 'Off-campus', badge: NEUTRAL },
  POOL_CAMPUS: { label: 'Pool campus', badge: NEUTRAL },
  REFERRAL: { label: 'Referral', badge: NEUTRAL },
}

export const VERDICT_META: Record<Verdict, { label: string; badge: string; iconLabel: string }> = {
  SELECTED: { label: 'Selected', badge: SUCCESS, iconLabel: 'Selected' },
  REJECTED: { label: 'Not selected', badge: NEGATIVE, iconLabel: 'Rejected' },
  WAITLISTED: { label: 'Waitlisted', badge: ATTENTION, iconLabel: 'Waitlisted' },
  IN_PROGRESS: { label: 'In progress', badge: SCHEDULED, iconLabel: 'In progress' },
}

export const DIFFICULTY_META: Record<Difficulty, { label: string; badge: string; stars: number }> = {
  EASY: { label: 'Easy', badge: SUCCESS, stars: 1 },
  MEDIUM: { label: 'Medium', badge: ATTENTION, stars: 2 },
  HARD: { label: 'Hard', badge: NEGATIVE, stars: 3 },
}

export const ROUND_TYPES: RoundType[] = ['PPT', 'OA', 'GD', 'TECHNICAL', 'HR', 'OTHER']
export const ROUND_MODES = ['ONLINE', 'OFFLINE'] as const
export const ROUND_STATUSES: RoundStatus[] = [
  'SCHEDULED',
  'COMPLETED',
  'CLEARED',
  'FAILED',
  'CANCELLED',
]
export const DRIVE_TYPES: DriveType[] = ['ON_CAMPUS', 'OFF_CAMPUS', 'POOL_CAMPUS', 'REFERRAL']
export const VERDICTS: Verdict[] = ['SELECTED', 'REJECTED', 'WAITLISTED', 'IN_PROGRESS']
export const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

