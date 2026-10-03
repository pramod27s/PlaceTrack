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
  ArrowRight,
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

/** A headline number that links to the list it summarises. */
function StatCard({
  icon,
  iconClass,
  value,
  label,
  to,
}: {
  icon: ReactNode
  iconClass: string
  value: number
  label: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors hover:border-indigo-300 dark:hover:border-indigo-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="flex items-center justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconClass)}>
          {icon}
        </div>
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="text-slate-300 dark:text-slate-600 transition-colors group-hover:text-indigo-500"
        />
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
    </Link>
  )
}

function AttentionItem({
  icon,
  iconClass,
  count,
  title,
  description,
  to,
}: {
  icon: ReactNode
  iconClass: string
  count: number
  title: string
  description: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3.5 p-4 transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/60"
    >
      <span
        className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm', iconClass)}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
            {title}
          </span>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200/70 dark:ring-slate-700">
            {count}
          </span>
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">{description}</span>
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
    return <LoadingState label="Loading your command center…" />
  }
  if (upcoming.isError || allRounds.isError) {
    return (
      <ErrorNote
        message="Couldn't load your dashboard."
        onRetry={() => {
          upcoming.refetch()
          allRounds.refetch()
        }}
      />
    )
  }

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {greeting()}, {user?.fullName?.split(' ')[0] ?? 'there'}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {todayCount > 0
              ? `You have ${todayCount} ${todayCount === 1 ? 'round' : 'rounds'} today.`
              : rounds.length > 0
                ? `Nothing today. ${rounds.length} ${rounds.length === 1 ? 'round is' : 'rounds are'} coming up this week.`
                : 'No rounds scheduled this week.'}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          Add company
        </Button>
      </div>

      {/* Conflict Alert Banner */}
      {conflictCount > 0 && (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-2xl border border-rose-200/90 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 p-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
            <TriangleAlert size={20} />
          </div>
          <p className="min-w-0 flex-1 text-sm font-medium text-rose-900 dark:text-rose-200">
            <span className="font-bold">
              {conflictCount} scheduling {conflictCount === 1 ? 'conflict' : 'conflicts'}
            </span>{' '}
            detected across your upcoming rounds.
          </p>
          <Link
            to="/rounds#upcoming"
            className="inline-flex items-center gap-1 text-sm font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 transition-colors"
          >
            Review conflicts <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<CalendarCheck2 size={20} />}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
          value={todayCount}
          label="Rounds today"
          to="/rounds#upcoming"
        />
        <StatCard
          icon={<ClockAlert size={20} />}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
          value={overdueRounds.length}
          label="Need a status update"
          to="/rounds#overdue"
        />
        <StatCard
          icon={<CalendarClock size={20} />}
          iconClass="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
          value={rounds.length}
          label="In the next 7 days"
          to="/rounds#upcoming"
        />
        <StatCard
          icon={<NotebookPen size={20} />}
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
          value={journalFollowUps.length}
          label="Rounds without a journal"
          to="/rounds#completed"
        />
      </div>

      {/* Upcoming Rounds + Attention Split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming List */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">Upcoming Rounds</h3>
            <Link
              to="/rounds"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              View all schedule <ArrowRight size={13} />
            </Link>
          </div>

          {rounds.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={24} />}
              title="No upcoming rounds scheduled"
              description="You have no rounds in the next 7 days. Open a company from your pipeline to schedule your next round."
              action={
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <Link
                    to="/pipeline"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all duration-150 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Go to Pipeline</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAddOpen(true)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold hover:-translate-y-0.5 transition-transform"
                  >
                    <Plus size={14} />
                    Add company
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="space-y-3">
              {rounds.slice(0, 5).map((round) => (
                <RoundListItem key={round.id} round={round} />
              ))}
            </div>
          )}
        </div>

        {/* Action Center / Needs Attention */}
        <div className="space-y-3.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight px-1">Action Center</h3>
          <Card className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
            {overdueRounds.length > 0 && (
              <AttentionItem
                icon={<ClockAlert size={18} className="text-amber-600 dark:text-amber-400" />}
                iconClass="bg-amber-100/80 dark:bg-amber-950/60"
                count={overdueRounds.length}
                to="/rounds#overdue"
                title="Update Round Status"
                description="These scheduled interview rounds have already ended."
              />
            )}
            {conflictCount > 0 && (
              <AttentionItem
                icon={<TriangleAlert size={18} className="text-rose-600 dark:text-rose-400" />}
                iconClass="bg-rose-100/80 dark:bg-rose-950/60"
                count={conflictCount}
                to="/rounds#upcoming"
                title="Resolve Conflicts"
                description="Two or more interview slots overlap in time."
              />
            )}
            {journalFollowUps.length > 0 && (
              <AttentionItem
                icon={<NotebookPen size={18} className="text-violet-600 dark:text-violet-400" />}
                iconClass="bg-violet-100/80 dark:bg-violet-950/60"
                count={journalFollowUps.length}
                to="/rounds#completed"
                title="Log Interview Journals"
                description="Record questions asked and reflections while fresh."
              />
            )}
            {overdueRounds.length === 0 && journalFollowUps.length === 0 && conflictCount === 0 && (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 dark:ring-emerald-500/40 shadow-sm">
                  <CircleCheckBig size={24} />
                </div>
                <p className="mt-3.5 text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">You're all caught up!</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs font-medium">
                  No scheduling conflicts, overdue updates, or missing journal entries right now.
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
