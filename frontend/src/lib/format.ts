import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isPast,
  isToday,
  isTomorrow,
  parseISO,
} from 'date-fns'

/** Joins truthy class names — a tiny `clsx` substitute. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** "4 May 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return format(parseISO(iso), 'd MMM yyyy')
}

/** "Fri, 23 May · 10:00 AM" */
export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'EEE, d MMM · h:mm a')
}

/** "10:00 AM" */
export function formatTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a')
}

/** A short, friendly relative label: "in 6 hours", "Today", "Tomorrow", "3 days ago". */
export function relativeDay(iso: string): string {
  const date = parseISO(iso)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  const days = differenceInCalendarDays(date, new Date())
  if (days < 0) return `${Math.abs(days)}d ago`
  return `In ${days}d`
}

/** "in about 6 hours" / "2 days ago" */
export function fromNow(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true })
}

export function isPastIso(iso: string): boolean {
  return isPast(parseISO(iso))
}

/** Converts an API timestamp to the value a `datetime-local` input expects. */
export function toDateTimeLocal(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm")
}

/** Up to two uppercase initials for an avatar. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
