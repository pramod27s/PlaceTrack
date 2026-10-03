import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, ExternalLink, MapPin, TriangleAlert, Video, XCircle } from 'lucide-react'
import { ROUND_STATUS_META, ROUND_TYPE_META } from '../lib/constants'
import { cn, formatDateTime, formatTime, isPastIso, relativeDay } from '../lib/format'
import { useUpdateRoundStatus } from '../hooks/queries'
import { useToast } from '../store/toast'
import { AddToCalendarButton } from './AddToCalendarButton'
import { Badge } from './ui'
import type { Round, RoundStatus } from '../lib/types'

/** A single round row, reused on the dashboard and the rounds page. */
export function RoundListItem({
  round,
  actions,
}: {
  round: Round
  actions?: ReactNode
}) {
  const type = ROUND_TYPE_META[round.type]
  const status = ROUND_STATUS_META[round.status]
  const isPast = isPastIso(round.scheduledAt)
  const upcoming = round.status === 'SCHEDULED' && !isPast
  const overdue = round.status === 'SCHEDULED' && isPast

  const updateStatus = useUpdateRoundStatus()
  const showToast = useToast((s) => s.showToast)

  const handleQuickStatus = async (newStatus: RoundStatus) => {
    const prevStatus = round.status
    const statusLabel = ROUND_STATUS_META[newStatus]?.label || newStatus

    try {
      await updateStatus.mutateAsync({ round, status: newStatus })
      showToast({
        title: `Marked as ${statusLabel.toLowerCase()}`,
        message: `${round.companyName} · ${type.label}`,
        type: newStatus === 'CLEARED' ? 'success' : newStatus === 'FAILED' ? 'error' : 'info',
        action: {
          label: 'Undo',
          onClick: () => {
            updateStatus.mutate({ round, status: prevStatus })
          },
        },
      })
    } catch {
      showToast({
        title: "Couldn't update the round",
        message: 'Please try again.',
        type: 'error',
      })
    }
  }

  return (
    <div
      className={cn(
        'group flex flex-col gap-4 rounded-xl border bg-white dark:bg-slate-900 p-4 shadow-sm transition-colors sm:flex-row sm:items-center',
        overdue
          ? 'border-amber-300 dark:border-amber-800/70'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
      )}
    >
      {/* Date */}
      <div
        className={cn(
          'flex w-full shrink-0 flex-row items-center justify-between rounded-lg px-3 py-2 sm:w-24 sm:flex-col sm:justify-center sm:gap-0.5 sm:py-2.5',
          overdue
            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
            : upcoming
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        )}
      >
        <span className="text-xs font-medium">{relativeDay(round.scheduledAt)}</span>
        <span className="text-sm font-semibold tabular-nums">{formatTime(round.scheduledAt)}</span>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={type.badge}>{type.label}</Badge>
          <Badge className={status.badge}>{status.label}</Badge>
          {overdue && (
            <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <TriangleAlert size={12} aria-hidden="true" />
              Needs update
            </Badge>
          )}
        </div>

        <p className="mt-1.5 text-sm">
          <Link
            to={`/companies/${round.companyId}`}
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {round.companyName}
          </Link>
          {round.title && <span className="text-slate-500 dark:text-slate-400"> · {round.title}</span>}
        </p>

        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="tabular-nums">{formatDateTime(round.scheduledAt)}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{round.durationMinutes} min</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            {round.mode === 'ONLINE' ? (
              <>
                <Video size={12} aria-hidden="true" />
                Online
              </>
            ) : (
              <>
                <MapPin size={12} aria-hidden="true" />
                In person {round.location ? `(${round.location})` : ''}
              </>
            )}
          </span>
        </p>

        {round.conflicts.length > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-rose-50 dark:bg-rose-950/50 px-2 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
            <TriangleAlert size={13} className="shrink-0" aria-hidden="true" />
            Overlaps with {round.conflicts.map((c) => c.companyName).join(', ')}
          </p>
        )}

        {/* Quick status update for rounds that have ended */}
        {overdue && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">How did it go?</span>
            <div className="inline-flex overflow-hidden rounded-md border border-slate-200 dark:border-slate-700" role="group" aria-label="Set round outcome">
              <button
                type="button"
                disabled={updateStatus.isPending}
                onClick={() => handleQuickStatus('CLEARED')}
                className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-50"
              >
                <Check size={12} aria-hidden="true" />
                Cleared
              </button>
              <button
                type="button"
                disabled={updateStatus.isPending}
                onClick={() => handleQuickStatus('FAILED')}
                className="inline-flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/50 disabled:opacity-50"
              >
                <XCircle size={12} aria-hidden="true" />
                Did not clear
              </button>
              <button
                type="button"
                disabled={updateStatus.isPending}
                onClick={() => handleQuickStatus('COMPLETED')}
                className="border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Completed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap shrink-0 items-center gap-2">
        <AddToCalendarButton round={round} />
        {round.meetingLink && (
          <a
            href={round.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Video size={13} />
            Join
            <ExternalLink size={11} className="opacity-70" />
          </a>
        )}
        {actions}
      </div>
    </div>
  )
}
