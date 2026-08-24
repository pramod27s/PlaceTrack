import type { Difficulty, DriveType, RoundStatus, RoundType, Stage, Verdict } from './types'

/**
 * Visual metadata for each pipeline stage. Tailwind class strings are written
 * out in full (never interpolated) so the compiler can detect them.
 */
interface StageMeta {
  label: string
  short: string
  badge: string
  dot: string
  bar: string
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

export const STAGE_META: Record<Stage, StageMeta> = {
  PPT: {
    label: 'Pre-Placement Talk',
    short: 'PPT',
    badge: 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700',
    dot: 'bg-zinc-400',
    bar: 'bg-zinc-400',
  },
  APPLIED: {
    label: 'Applied',
    short: 'Applied',
    badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
  },
  OA: {
    label: 'Online Assessment',
    short: 'OA',
    badge: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    short: 'Shortlisted',
    badge: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-800',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
  },
  GD: {
    label: 'Group Discussion',
    short: 'GD',
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  TECH: {
    label: 'Technical',
    short: 'Tech',
    badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
  },
  HR: {
    label: 'HR Round',
    short: 'HR',
    badge: 'bg-fuchsia-100 text-fuchsia-700 ring-1 ring-fuchsia-200 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:ring-fuchsia-800',
    dot: 'bg-fuchsia-500',
    bar: 'bg-fuchsia-500',
  },
  OFFER: {
    label: 'Offer',
    short: 'Offer',
    badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    short: 'Rejected',
    badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800',
    dot: 'bg-rose-400',
    bar: 'bg-rose-400',
  },
}

export const ROUND_TYPE_META: Record<RoundType, { label: string; badge: string }> = {
  PPT: { label: 'Pre-Placement Talk', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  OA: { label: 'Online Assessment', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  GD: { label: 'Group Discussion', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  TECHNICAL: { label: 'Technical Interview', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  HR: { label: 'HR Interview', badge: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300' },
  OTHER: { label: 'Other', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
}

export const ROUND_STATUS_META: Record<RoundStatus, { label: string; badge: string }> = {
  SCHEDULED: { label: 'Scheduled', badge: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800' },
  COMPLETED: { label: 'Completed', badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700' },
  CLEARED: { label: 'Cleared', badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800' },
  FAILED: { label: 'Did not clear', badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800' },
  CANCELLED: { label: 'Cancelled', badge: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700' },
}

export const DRIVE_TYPE_META: Record<DriveType, { label: string; badge: string }> = {
  ON_CAMPUS: { label: 'On-Campus', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800' },
  OFF_CAMPUS: { label: 'Off-Campus', badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800' },
  POOL_CAMPUS: { label: 'Pool Campus', badge: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-800' },
  REFERRAL: { label: 'Referral', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800' },
}

export const VERDICT_META: Record<Verdict, { label: string; badge: string; iconLabel: string }> = {
  SELECTED: { label: 'Selected / Offer 🎉', badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800', iconLabel: 'Selected' },
  REJECTED: { label: 'Not Selected', badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800', iconLabel: 'Rejected' },
  WAITLISTED: { label: 'Waitlisted', badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300/80 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800', iconLabel: 'Waitlisted' },
  IN_PROGRESS: { label: 'In Progress', badge: 'bg-sky-100 text-sky-700 ring-1 ring-sky-300/80 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800', iconLabel: 'In Progress' },
}

export const DIFFICULTY_META: Record<Difficulty, { label: string; badge: string; stars: number }> = {
  EASY: { label: 'Easy', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900', stars: 1 },
  MEDIUM: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900', stars: 2 },
  HARD: { label: 'Hard', badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-900', stars: 3 },
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

