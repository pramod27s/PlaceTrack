import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CircleCheckBig,
  ClockAlert,
  NotebookPen,
  Plus,
  TriangleAlert,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useAllRounds, useUpcomingRounds } from '../hooks/queries'
import { useAuth } from '../store/auth'
import { CompanyModal } from '../components/CompanyModal'
import { RoundListItem } from '../components/RoundListItem'
import { Button, Card, EmptyState, ErrorNote, LoadingState } from '../components/ui'
import { cn, isPastIso } from '../lib/format'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function StatCard({
  icon,
  iconClass,
  value,
  label,
}: {
  icon: ReactNode
  iconClass: string
  value: string | number
  label: string
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconClass)}>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Card>
  )
}

function AttentionItem({
  icon,
  iconClass,
  count,
  title,
  description,
}: {
  icon: ReactNode
  iconClass: string
  count: number
  title: string
  description: string
}) {
  return (
    <Link to="/rounds" className="group flex items-start gap-3 p-4 transition hover:bg-slate-50">
      <span
        className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconClass)}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700">
            {title}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {count}
          </span>
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
    </Link>
  )
}

export default function Dashboard() {
  const user = useAuth((s) => s.user)
  const upcoming = useUpcomingRounds()
  const allRounds = useAllRounds()
  const [addOpen, setAddOpen] = useState(false)

  const rounds = upcoming.data ?? []
  const everyRound = useMemo(() => allRounds.data ?? [], [allRounds.data])
  const todayCount = rounds.filter(
    (round) => new Date(round.scheduledAt).toDateString() === new Date().toDateString(),
  ).length
  const overdueRounds = everyRound.filter(
    (round) => round.status === 'SCHEDULED' && isPastIso(round.scheduledAt),
  )
  const journalFollowUps = everyRound.filter(
    (round) =>
      !round.hasJournal && round.status !== 'SCHEDULED' && round.status !== 'CANCELLED',
  )

  const conflictCount = useMemo(() => {
    const pairs = new Set<string>()
    for (const r of everyRound) {
      if (r.status !== 'SCHEDULED' || isPastIso(r.scheduledAt)) continue
      for (const c of r.conflicts) {
        pairs.add([r.id, c.roundId].sort((a, b) => a - b).join('-'))
      }
    }
    return pairs.size
  }, [everyRound])

  if (upcoming.isLoading || allRounds.isLoading) {
    return <LoadingState label="Loading your dashboard…" />
  }
  if (upcoming.isError || allRounds.isError) {
    return <ErrorNote message="Couldn't load your dashboard. Please retry." />
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {greeting()}, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
          </h2>
          <p className="text-sm text-slate-500">Here's what needs your attention today.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          Add company
        </Button>
      </div>

      {/* Conflict banner */}
      {conflictCount > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm shadow-rose-100">
          <TriangleAlert size={18} className="shrink-0 text-rose-600" />
          <p className="min-w-0 flex-1 text-sm text-rose-700">
            <span className="font-semibold">
              {conflictCount} scheduling {conflictCount === 1 ? 'conflict' : 'conflicts'}
            </span>{' '}
            detected in your upcoming rounds.
          </p>
          <Link
            to="/rounds"
            className="ml-auto text-sm font-medium text-rose-700 underline-offset-2 hover:underline"
          >
            Review
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<CalendarCheck2 size={20} />}
          iconClass="bg-indigo-100 text-indigo-600"
          value={todayCount}
          label="Rounds today"
        />
        <StatCard
          icon={<ClockAlert size={20} />}
          iconClass="bg-amber-100 text-amber-700"
          value={overdueRounds.length}
          label="Need status update"
        />
        <StatCard
          icon={<CalendarClock size={20} />}
          iconClass="bg-sky-100 text-sky-600"
          value={rounds.length}
          label="Rounds next 7 days"
        />
        <StatCard
          icon={<NotebookPen size={20} />}
          iconClass="bg-violet-100 text-violet-600"
          value={journalFollowUps.length}
          label="Journal follow-ups"
        />
      </div>

      {/* Upcoming + actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Upcoming rounds</h3>
            <Link
              to="/rounds"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>
          {rounds.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={22} />}
              title="Nothing scheduled"
              description="No rounds in the next 7 days. Add rounds to a company to see them here."
            />
          ) : (
            <div className="space-y-3">
              {rounds.slice(0, 5).map((round) => (
                <RoundListItem key={round.id} round={round} />
              ))}
            </div>
          )}
        </div>

        {/* Needs attention */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Needs attention</h3>
          <Card className="divide-y divide-slate-100 overflow-hidden">
            {overdueRounds.length > 0 && (
              <AttentionItem
                icon={<ClockAlert size={17} />}
                iconClass="bg-amber-50 text-amber-700"
                count={overdueRounds.length}
                title="Update round status"
                description="These scheduled rounds have already ended."
              />
            )}
            {conflictCount > 0 && (
              <AttentionItem
                icon={<TriangleAlert size={17} />}
                iconClass="bg-rose-50 text-rose-700"
                count={conflictCount}
                title="Resolve scheduling conflicts"
                description="Upcoming rounds overlap with each other."
              />
            )}
            {journalFollowUps.length > 0 && (
              <AttentionItem
                icon={<NotebookPen size={17} />}
                iconClass="bg-violet-50 text-violet-700"
                count={journalFollowUps.length}
                title="Capture interview notes"
                description="Completed rounds are missing a journal entry."
              />
            )}
            {overdueRounds.length === 0 && journalFollowUps.length === 0 && conflictCount === 0 && (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CircleCheckBig size={22} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">You're all caught up</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  No conflicts, overdue updates, or journal follow-ups right now.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <CompanyModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
