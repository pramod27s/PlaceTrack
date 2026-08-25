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
        title: `Round status updated`,
        message: `Marked ${round.companyName} (${type.label}) as ${statusLabel}.`,
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
        title: 'Update failed',
        message: 'Could not update round status. Please retry.',
        type: 'error',
      })
    }
  }

  return (
    <div
      className={cn(
        'group flex flex-col gap-3.5 rounded-2xl border bg-white dark:bg-slate-900 p-4 shadow-sm transition-all duration-150 sm:flex-row sm:items-center',
        overdue
          ? 'border-amber-200/90 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/30 dark:from-amber-950/20 via-white dark:via-slate-900 to-white dark:to-slate-900 hover:border-amber-300 dark:hover:border-amber-800'
          : upcoming
            ? 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md dark:hover:shadow-black/40'
            : 'border-slate-200/70 dark:border-slate-800/70 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700',
      )}
    >
      {/* Ticket Date Chip */}
      <div
        className={cn(
          'flex w-full shrink-0 flex-row items-center justify-between rounded-xl px-3.5 py-2.5 sm:w-28 sm:flex-col sm:justify-center sm:gap-0.5 sm:py-3 shadow-inner',
          overdue
            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800/60'
            : upcoming
              ? 'bg-gradient-to-br from-indigo-50 dark:from-indigo-950/60 to-indigo-100/70 dark:to-indigo-900/40 text-indigo-800 dark:text-indigo-300 ring-1 ring-indigo-200/60 dark:ring-indigo-700/50'
              : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200/80 dark:ring-slate-700/80',
        )}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {relativeDay(round.scheduledAt)}
        </span>
        <span className="text-sm font-extrabold tracking-tight">{formatTime(round.scheduledAt)}</span>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={type.badge}>{type.label}</Badge>
          <Badge className={status.badge}>{status.label}</Badge>
          {overdue && (
            <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700 font-semibold">
              <TriangleAlert size={12} className="mr-0.5 inline-block text-amber-700 dark:text-amber-400" />
              Ended · Needs update
            </Badge>
          )}
        </div>

        <p className="mt-1.5 text-sm">
          <Link
            to={`/companies/${round.companyId}`}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors tracking-tight"
          >
            {round.companyName}
          </Link>
          {round.title && <span className="text-slate-500 dark:text-slate-400 font-medium"> · {round.title}</span>}
        </p>

        <p className="mt-1 flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{formatDateTime(round.scheduledAt)}</span>
          <span>·</span>
          <span>{round.durationMinutes} min</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            {round.mode === 'ONLINE' ? (
              <>
                <Video size={12} className="text-indigo-500 dark:text-indigo-400" />
                Online
              </>
            ) : (
              <>
                <MapPin size={12} className="text-slate-400 dark:text-slate-500" />
                In person {round.location ? `(${round.location})` : ''}
              </>
            )}
          </span>
        </p>

        {round.conflicts.length > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <TriangleAlert size={13} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span>Overlaps with {round.conflicts.map((c) => c.companyName).join(', ')}</span>
          </div>
        )}

        {/* ⚡ Inline Quick Status Resolution Actions for Overdue / Scheduled Rounds */}
        {overdue && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-1 border-t border-amber-100/80 dark:border-amber-900/40">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Quick update:
            </span>
            <button
              type="button"
              disabled={updateStatus.isPending}
              onClick={() => handleQuickStatus('CLEARED')}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-100/90 dark:bg-emerald-950/70 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 transition-colors shadow-xs"
            >
              <Check size={12} className="stroke-[3]" />
              Cleared
            </button>
            <button
              type="button"
              disabled={updateStatus.isPending}
              onClick={() => handleQuickStatus('FAILED')}
              className="inline-flex items-center gap-1 rounded-md bg-rose-100/90 dark:bg-rose-950/70 px-2 py-0.5 text-xs font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/80 transition-colors shadow-xs"
            >
              <XCircle size={12} />
              Did not clear
            </button>
            <button
              type="button"
              disabled={updateStatus.isPending}
              onClick={() => handleQuickStatus('COMPLETED')}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              Completed
            </button>
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700/50 transition hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
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
