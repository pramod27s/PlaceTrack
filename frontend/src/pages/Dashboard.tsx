import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CalendarClock,
  CalendarDays,
  Plus,
  TrendingUp,
  Trophy,
  TriangleAlert,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useAllRounds, useAnalytics, useUpcomingRounds } from '../hooks/queries'
import { useAuth } from '../store/auth'
import { CompanyModal } from '../components/CompanyModal'
import { RoundListItem } from '../components/RoundListItem'
import { Button, Card, EmptyState, ErrorNote, LoadingState } from '../components/ui'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
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
    <Card className="p-5">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconClass)}>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Card>
  )
}

export default function Dashboard() {
  const user = useAuth((s) => s.user)
  const analytics = useAnalytics()
  const upcoming = useUpcomingRounds()
  const allRounds = useAllRounds()
  const [addOpen, setAddOpen] = useState(false)

  const conflictCount = useMemo(() => {
    const rounds = allRounds.data ?? []
    const pairs = new Set<string>()
    for (const r of rounds) {
      if (r.status !== 'SCHEDULED' || isPastIso(r.scheduledAt)) continue
      for (const c of r.conflicts) {
        pairs.add([r.id, c.roundId].sort((a, b) => a - b).join('-'))
      }
    }
    return pairs.size
  }, [allRounds.data])

  if (analytics.isLoading || upcoming.isLoading) {
    return <LoadingState label="Loading your dashboard…" />
  }
  if (analytics.isError || !analytics.data) {
    return <ErrorNote message="Couldn't load your dashboard. Please retry." />
  }

  const a = analytics.data
  const rounds = upcoming.data ?? []
  const maxStage = Math.max(1, ...STAGE_ORDER.map((s) => a.stageCounts[s] ?? 0))

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {greeting()}, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
          </h2>
          <p className="text-sm text-slate-500">
            Here's where your placement season stands today.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          Add company
        </Button>
      </div>

      {/* Conflict banner */}
      {conflictCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm shadow-rose-100">
          <TriangleAlert size={18} className="shrink-0 text-rose-600" />
          <p className="text-sm text-rose-700">
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Building2 size={20} />}
          iconClass="bg-indigo-100 text-indigo-600"
          value={a.activeCompanies}
          label="Active applications"
        />
        <StatCard
          icon={<Trophy size={20} />}
          iconClass="bg-emerald-100 text-emerald-600"
          value={a.offers}
          label="Offers received"
        />
        <StatCard
          icon={<CalendarClock size={20} />}
          iconClass="bg-sky-100 text-sky-600"
          value={rounds.length}
          label="Rounds next 7 days"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          iconClass="bg-violet-100 text-violet-600"
          value={`${a.shortlistRate}%`}
          label="Shortlist rate"
        />
      </div>

      {/* Upcoming + snapshot */}
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

        {/* Pipeline snapshot */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Pipeline snapshot</h3>
          <Card className="p-5">
            <div className="space-y-3">
              {STAGE_ORDER.map((stage) => {
                const count = a.stageCounts[stage] ?? 0
                const meta = STAGE_META[stage]
                return (
                  <div key={stage}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">{meta.label}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn('h-full rounded-full', meta.bar)}
                        style={{ width: `${(count / maxStage) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              {a.totalCompanies} companies tracked · {a.journalEntries} journal entries
            </div>
          </Card>
        </div>
      </div>

      <CompanyModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
