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
  Sparkles,
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

function StatCard({
  icon,
  gradientClass,
  value,
  label,
  sublabel,
}: {
  icon: ReactNode
  gradientClass: string
  value: string | number
  label: string
  sublabel?: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md', gradientClass)}>
          {icon}
        </div>
        {sublabel && (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            {sublabel}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
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
    <Link
      to="/rounds"
      className="group flex items-start gap-3.5 p-4 transition-colors hover:bg-slate-50/90"
    >
      <span
        className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm', iconClass)}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
            {title}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200/70">
            {count}
          </span>
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-slate-500 font-medium">{description}</span>
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
    return <ErrorNote message="Couldn't load your dashboard. Please retry." />
  }

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-950/10 border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30 backdrop-blur-sm">
            <Sparkles size={13} className="text-indigo-300" />
            <span>Placement Season Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting()}, {user?.fullName?.split(' ')[0] ?? 'Student'} 👋
          </h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Here's what needs your focus today. Stay prepared, log your rounds, and track your offers.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-white text-slate-950 hover:bg-slate-100 hover:text-indigo-950 shadow-lg font-bold border-none"
        >
          <Plus size={16} />
          Add company
        </Button>
      </div>

      {/* Conflict Alert Banner */}
      {conflictCount > 0 && (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-2xl border border-rose-200/90 bg-rose-50/90 p-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <TriangleAlert size={20} />
          </div>
          <p className="min-w-0 flex-1 text-sm font-medium text-rose-900">
            <span className="font-bold">
              {conflictCount} scheduling {conflictCount === 1 ? 'conflict' : 'conflicts'}
            </span>{' '}
            detected across your upcoming rounds.
          </p>
          <Link
            to="/rounds"
            className="inline-flex items-center gap-1 text-sm font-bold text-rose-700 hover:text-rose-900 transition-colors"
          >
            Review schedule <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<CalendarCheck2 size={22} />}
          gradientClass="bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-indigo-500/25"
          value={todayCount}
          label="Rounds Today"
          sublabel="Active"
        />
        <StatCard
          icon={<ClockAlert size={22} />}
          gradientClass="bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/25"
          value={overdueRounds.length}
          label="Need Update"
          sublabel={overdueRounds.length > 0 ? 'Pending' : 'Done'}
        />
        <StatCard
          icon={<CalendarClock size={22} />}
          gradientClass="bg-gradient-to-tr from-sky-500 to-blue-600 shadow-sky-500/25"
          value={rounds.length}
          label="Next 7 Days"
          sublabel="Scheduled"
        />
        <StatCard
          icon={<NotebookPen size={22} />}
          gradientClass="bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-violet-500/25"
          value={journalFollowUps.length}
          label="Journal Follow-ups"
          sublabel={journalFollowUps.length > 0 ? 'Notes' : 'Logged'}
        />
      </div>

      {/* Upcoming Rounds + Attention Split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming List */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Upcoming Rounds</h3>
            <Link
              to="/rounds"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View all schedule <ArrowRight size={13} />
            </Link>
          </div>

          {rounds.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={24} />}
              title="No upcoming rounds scheduled"
              description="You have no rounds in the next 7 days. Open a company from your pipeline to add a round."
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
          <h3 className="text-base font-bold text-slate-900 tracking-tight px-1">Action Center</h3>
          <Card className="divide-y divide-slate-100 overflow-hidden shadow-sm">
            {overdueRounds.length > 0 && (
              <AttentionItem
                icon={<ClockAlert size={18} className="text-amber-600" />}
                iconClass="bg-amber-100/80"
                count={overdueRounds.length}
                title="Update Round Status"
                description="These scheduled interview rounds have already ended."
              />
            )}
            {conflictCount > 0 && (
              <AttentionItem
                icon={<TriangleAlert size={18} className="text-rose-600" />}
                iconClass="bg-rose-100/80"
                count={conflictCount}
                title="Resolve Conflicts"
                description="Two or more interview slots overlap in time."
              />
            )}
            {journalFollowUps.length > 0 && (
              <AttentionItem
                icon={<NotebookPen size={18} className="text-violet-600" />}
                iconClass="bg-violet-100/80"
                count={journalFollowUps.length}
                title="Log Interview Journals"
                description="Record questions asked and reflections while fresh."
              />
            )}
            {overdueRounds.length === 0 && journalFollowUps.length === 0 && conflictCount === 0 && (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm">
                  <CircleCheckBig size={24} />
                </div>
                <p className="mt-3.5 text-sm font-bold text-slate-900 tracking-tight">You're all caught up!</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 max-w-xs font-medium">
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
