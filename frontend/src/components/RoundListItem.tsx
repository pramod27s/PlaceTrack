import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, MapPin, TriangleAlert } from 'lucide-react'
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
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 transition hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center">
      {/* Date chip */}
      <div
        className={cn(
          'flex w-full shrink-0 flex-row items-center justify-between rounded-lg px-3 py-2 sm:w-24 sm:flex-col sm:justify-center sm:gap-0.5 sm:py-3',
          overdue
            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
            : upcoming
              ? 'bg-indigo-50 text-indigo-700'
              : 'bg-slate-100 text-slate-500',
        )}
      >
        <span className="text-xs font-semibold uppercase tracking-wide">
          {relativeDay(round.scheduledAt)}
        </span>
        <span className="text-sm font-bold">{formatTime(round.scheduledAt)}</span>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={type.badge}>{type.label}</Badge>
          <Badge className={status.badge}>{status.label}</Badge>
          {overdue && (
            <Badge className="bg-amber-100 text-amber-800 ring-1 ring-amber-200">
              <TriangleAlert size={11} className="mr-0.5 inline-block" />
              Ended — update status
            </Badge>
          )}
        </div>
        <p className="mt-1.5 text-sm">
          <Link
            to={`/companies/${round.companyId}`}
            className="font-semibold text-slate-900 hover:text-indigo-600"
          >
            {round.companyName}
          </Link>
          {round.title && <span className="text-slate-500"> · {round.title}</span>}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
          <span>{formatDateTime(round.scheduledAt)}</span>
          <span>{round.durationMinutes} min</span>
          <span className="flex items-center gap-1">
            {round.mode === 'ONLINE' ? 'Online' : 'In person'}
            {round.location && (
              <>
                <MapPin size={11} /> {round.location}
              </>
            )}
          </span>
        </p>
        {round.conflicts.length > 0 && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <TriangleAlert size={13} />
            Overlaps with {round.conflicts.map((c) => c.companyName).join(', ')}
          </p>
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
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
          >
            Join <ExternalLink size={13} />
          </a>
        )}
        {actions}
      </div>
    </div>
  )
}
