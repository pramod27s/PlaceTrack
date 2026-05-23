import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarClock, TriangleAlert } from 'lucide-react'
import { differenceInHours, parseISO } from 'date-fns'
import { useAllRounds } from '../hooks/queries'
import { IconButton } from './ui'
import { cn, formatDateTime, fromNow } from '../lib/format'
import type { Round } from '../lib/types'

interface Alert {
  id: string
  kind: 'conflict' | 'soon'
  title: string
  detail: string
  roundId: number
  at: string
}

/** Builds the in-app alert feed purely from round data already in the cache. */
function buildAlerts(rounds: Round[]): Alert[] {
  const now = new Date()
  const alerts: Alert[] = []
  const seenConflicts = new Set<string>()

  for (const round of rounds) {
    if (round.status !== 'SCHEDULED') continue
    const start = parseISO(round.scheduledAt)

    // Conflicts — one alert per overlapping pair.
    for (const conflict of round.conflicts) {
      const key = [round.id, conflict.roundId].sort((a, b) => a - b).join('-')
      if (seenConflicts.has(key)) continue
      seenConflicts.add(key)
      alerts.push({
        id: `conflict-${key}`,
        kind: 'conflict',
        title: 'Schedule conflict',
        detail: `${round.companyName} overlaps with ${conflict.companyName}`,
        roundId: round.id,
        at: round.scheduledAt,
      })
    }

    // Rounds happening within the next 24 hours.
    const hours = differenceInHours(start, now)
    if (start > now && hours <= 24) {
      alerts.push({
        id: `soon-${round.id}`,
        kind: 'soon',
        title: `${round.companyName} round ${fromNow(round.scheduledAt)}`,
        detail: formatDateTime(round.scheduledAt),
        roundId: round.id,
        at: round.scheduledAt,
      })
    }
  }

  return alerts.sort((a, b) => +parseISO(a.at) - +parseISO(b.at))
}

export function NotificationBell() {
  const { data: rounds } = useAllRounds()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const alerts = useMemo(() => buildAlerts(rounds ?? []), [rounds])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <IconButton onClick={() => setOpen((v) => !v)} aria-label="Notifications" type="button">
        <Bell size={19} />
        {alerts.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
        )}
      </IconButton>

      {open && (
        <div className="animate-pop absolute right-0 z-40 mt-2 w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            <p className="text-xs text-slate-400">Conflicts and rounds in the next 24 hours</p>
          </div>

          {alerts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              You're all caught up.
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      navigate('/rounds')
                    }}
                    className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        alert.kind === 'conflict'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-indigo-100 text-indigo-600',
                      )}
                    >
                      {alert.kind === 'conflict' ? (
                        <TriangleAlert size={14} />
                      ) : (
                        <CalendarClock size={14} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">
                        {alert.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {alert.detail}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
