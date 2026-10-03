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
import { Button, Card, EmptyState, ErrorNote, Skeleton } from '../components/ui'
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
  value,
  label,
  to,
  attention = false,
}: {
  icon: ReactNode
  value: number
  label: string
  to: string
  /** Tint the icon amber when the number needs action. */
  attention?: boolean
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            attention
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          {icon}
        </div>
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="text-slate-300 dark:text-slate-600 transition-colors group-hover:text-slate-500 dark:group-hover:text-slate-400"
        />
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{label}</p>
    </Link>
  )
}

function AttentionItem({
  icon,
  tone,
  count,
  title,
  description,
  to,
}: {
  icon: ReactNode
  tone: 'amber' | 'rose' | 'slate'
  count: number
  title: string
  description: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/60"
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          tone === 'amber' && 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
          tone === 'rose' && 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
          tone === 'slate' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </span>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
            {count}
          </span>
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</span>
      </span>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-12" />
            <Skeleton className="mt-2 h-4 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
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
    return <DashboardSkeleton />
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
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {greeting()}, {user?.fullName?.split(' ')[0] ?? 'there'}
          </h2>
          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400">
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

      {/* Conflict alert */}
      {conflictCount > 0 && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3"
        >
          <TriangleAlert size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="min-w-0 flex-1 text-sm text-rose-900 dark:text-rose-200">
            <span className="font-semibold">
              {conflictCount} scheduling {conflictCount === 1 ? 'conflict' : 'conflicts'}
            </span>{' '}
            in your upcoming rounds.
          </p>
          <Link
            to="/rounds#upcoming"
            className="inline-flex items-center gap-1 text-sm font-medium text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 transition-colors"
          >
            Review conflicts <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<CalendarCheck2 size={18} />} value={todayCount} label="Rounds today" to="/rounds#upcoming" />
        <StatCard
          icon={<ClockAlert size={18} />}
          value={overdueRounds.length}
          label="Need a status update"
          to="/rounds#overdue"
          attention={overdueRounds.length > 0}
        />
        <StatCard icon={<CalendarClock size={18} />} value={rounds.length} label="In the next 7 days" to="/rounds#upcoming" />
        <StatCard
          icon={<NotebookPen size={18} />}
          value={journalFollowUps.length}
          label="Rounds without a journal"
          to="/rounds#completed"
        />
      </div>

      {/* Upcoming rounds + needs attention */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-3" aria-labelledby="upcoming-heading">
          <div className="flex items-center justify-between">
            <h3 id="upcoming-heading" className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Upcoming rounds
            </h3>
            <Link
              to="/rounds"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {rounds.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={22} />}
              title="No rounds in the next 7 days"
              description="Open a company from your pipeline to schedule its next round."
              action={
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Link
                    to="/pipeline"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    Go to pipeline
                    <ArrowRight size={14} />
                  </Link>
                  <Button variant="secondary" onClick={() => setAddOpen(true)}>
                    <Plus size={16} />
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
        </section>

        <section className="space-y-3" aria-labelledby="attention-heading">
          <h3 id="attention-heading" className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Needs attention
          </h3>
          <Card className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {overdueRounds.length > 0 && (
              <AttentionItem
                icon={<ClockAlert size={16} />}
                tone="amber"
                count={overdueRounds.length}
                to="/rounds#overdue"
                title="Update round status"
                description="These rounds have ended but are still marked as scheduled."
              />
            )}
            {conflictCount > 0 && (
              <AttentionItem
                icon={<TriangleAlert size={16} />}
                tone="rose"
                count={conflictCount}
                to="/rounds#upcoming"
                title="Resolve conflicts"
                description="Two or more rounds overlap in time."
              />
            )}
            {journalFollowUps.length > 0 && (
              <AttentionItem
                icon={<NotebookPen size={16} />}
                tone="slate"
                count={journalFollowUps.length}
                to="/rounds#completed"
                title="Write journal entries"
                description="Note the questions and takeaways while they're fresh."
              />
            )}
            {overdueRounds.length === 0 && journalFollowUps.length === 0 && conflictCount === 0 && (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <CircleCheckBig size={22} className="text-emerald-600 dark:text-emerald-400" />
                <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">You're all caught up</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  No conflicts, overdue updates or missing journal entries.
                </p>
              </div>
            )}
          </Card>
        </section>
      </div>

      <CompanyModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
