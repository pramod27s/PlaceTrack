import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, MapPin, TriangleAlert, Video } from 'lucide-react'
import { ROUND_STATUS_META, ROUND_TYPE_META } from '../lib/constants'
import { cn, formatDateTime, formatTime, isPastIso, relativeDay } from '../lib/format'
import { AddToCalendarButton } from './AddToCalendarButton'
import { Badge } from './ui'
import type { Round } from '../lib/types'

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

  return (
    <div
      className={cn(
        'group flex flex-col gap-3.5 rounded-2xl border bg-white p-4 shadow-sm transition-all duration-150 sm:flex-row sm:items-center',
        overdue
          ? 'border-amber-200/90 bg-gradient-to-r from-amber-50/30 via-white to-white hover:border-amber-300'
          : upcoming
            ? 'border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
            : 'border-slate-200/70 bg-slate-50/40 hover:border-slate-300',
      )}
    >
      {/* Ticket Date Chip */}
      <div
        className={cn(
          'flex w-full shrink-0 flex-row items-center justify-between rounded-xl px-3.5 py-2.5 sm:w-28 sm:flex-col sm:justify-center sm:gap-0.5 sm:py-3 shadow-inner',
          overdue
            ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
            : upcoming
              ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/70 text-indigo-800 ring-1 ring-indigo-200/60'
              : 'bg-slate-100/90 text-slate-600 ring-1 ring-slate-200/80',
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
            <Badge className="bg-amber-100 text-amber-800 ring-1 ring-amber-300 font-semibold">
              <TriangleAlert size={12} className="mr-0.5 inline-block text-amber-700" />
              Ended · Update status
            </Badge>
          )}
        </div>

        <p className="mt-1.5 text-sm">
          <Link
            to={`/companies/${round.companyId}`}
            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight"
          >
            {round.companyName}
          </Link>
          {round.title && <span className="text-slate-500 font-medium"> · {round.title}</span>}
        </p>

        <p className="mt-1 flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-xs text-slate-500 font-medium">
          <span>{formatDateTime(round.scheduledAt)}</span>
          <span>·</span>
          <span>{round.durationMinutes} min</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            {round.mode === 'ONLINE' ? (
              <>
                <Video size={12} className="text-indigo-500" />
                Online
              </>
            ) : (
              <>
                <MapPin size={12} className="text-slate-400" />
                In person {round.location ? `(${round.location})` : ''}
              </>
            )}
          </span>
        </p>

        {round.conflicts.length > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/90 px-2.5 py-1 text-xs font-semibold text-rose-700">
            <TriangleAlert size={13} className="shrink-0 text-rose-600" />
            <span>Overlaps with {round.conflicts.map((c) => c.companyName).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap shrink-0 items-center gap-2">
        {round.status === 'SCHEDULED' && <AddToCalendarButton round={round} />}
        {round.meetingLink && (
          <a
            href={round.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-100"
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
