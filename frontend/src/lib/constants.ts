import type { RoundStatus, RoundType, Stage } from './types'

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
  'PPT',
  'APPLIED',
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
    badge: 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200',
    dot: 'bg-zinc-400',
    bar: 'bg-zinc-400',
  },
  APPLIED: {
    label: 'Applied',
    short: 'Applied',
    badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
  },
  OA: {
    label: 'Online Assessment',
    short: 'OA',
    badge: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    short: 'Shortlisted',
    badge: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
  },
  GD: {
    label: 'Group Discussion',
    short: 'GD',
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  TECH: {
    label: 'Technical',
    short: 'Tech',
    badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
  },
  HR: {
    label: 'HR Round',
    short: 'HR',
    badge: 'bg-fuchsia-100 text-fuchsia-700 ring-1 ring-fuchsia-200',
    dot: 'bg-fuchsia-500',
    bar: 'bg-fuchsia-500',
  },
  OFFER: {
    label: 'Offer',
    short: 'Offer',
    badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    short: 'Rejected',
    badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
    dot: 'bg-rose-400',
    bar: 'bg-rose-400',
  },
}

export const ROUND_TYPE_META: Record<RoundType, { label: string; badge: string }> = {
  PPT: { label: 'Pre-Placement Talk', badge: 'bg-slate-100 text-slate-700' },
  OA: { label: 'Online Assessment', badge: 'bg-sky-100 text-sky-700' },
  GD: { label: 'Group Discussion', badge: 'bg-amber-100 text-amber-700' },
  TECHNICAL: { label: 'Technical Interview', badge: 'bg-blue-100 text-blue-700' },
  HR: { label: 'HR Interview', badge: 'bg-fuchsia-100 text-fuchsia-700' },
  OTHER: { label: 'Other', badge: 'bg-slate-100 text-slate-700' },
}

export const ROUND_STATUS_META: Record<RoundStatus, { label: string; badge: string }> = {
  SCHEDULED: { label: 'Scheduled', badge: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' },
  COMPLETED: { label: 'Completed', badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  CLEARED: { label: 'Cleared', badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
  FAILED: { label: 'Did not clear', badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' },
  CANCELLED: { label: 'Cancelled', badge: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
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
