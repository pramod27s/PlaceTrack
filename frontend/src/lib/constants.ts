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

/*
 * Colour is reserved for meaning: grey = early / neutral, blue = interviewing,
 * indigo = scheduled, green = success, amber = attention, red = negative.
 * Categories that carry no judgement (round type, drive type) stay neutral.
 */
const NEUTRAL = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
const INTERVIEWING = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
const SCHEDULED = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
const SUCCESS = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
const ATTENTION = 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
const NEGATIVE = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'

export const STAGE_META: Record<Stage, StageMeta> = {
  PPT: { label: 'Pre-placement talk', short: 'PPT', badge: NEUTRAL, dot: 'bg-slate-400', bar: 'bg-slate-400' },
  APPLIED: { label: 'Applied', short: 'Applied', badge: NEUTRAL, dot: 'bg-slate-400', bar: 'bg-slate-400' },
  OA: { label: 'Online assessment', short: 'OA', badge: NEUTRAL, dot: 'bg-slate-400', bar: 'bg-slate-400' },
  SHORTLISTED: { label: 'Shortlisted', short: 'Shortlisted', badge: NEUTRAL, dot: 'bg-slate-400', bar: 'bg-slate-400' },
  GD: { label: 'Group discussion', short: 'GD', badge: INTERVIEWING, dot: 'bg-blue-500', bar: 'bg-blue-500' },
  TECH: { label: 'Technical', short: 'Tech', badge: INTERVIEWING, dot: 'bg-blue-500', bar: 'bg-blue-500' },
  HR: { label: 'HR round', short: 'HR', badge: INTERVIEWING, dot: 'bg-blue-500', bar: 'bg-blue-500' },
  OFFER: { label: 'Offer', short: 'Offer', badge: SUCCESS, dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  REJECTED: { label: 'Rejected', short: 'Rejected', badge: NEGATIVE, dot: 'bg-rose-500', bar: 'bg-rose-500' },
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

