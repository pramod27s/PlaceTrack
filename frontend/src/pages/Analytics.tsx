import { Building2, CircleCheckBig, NotebookPen, Target, TrendingDown, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAnalytics } from '../hooks/queries'
import { Card, EmptyState, ErrorNote, LoadingState } from '../components/ui'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { cn } from '../lib/format'

const FUNNEL_TONES = [
  'bg-indigo-600',
  'bg-sky-500',
  'bg-violet-600',
  'bg-amber-500',
  'bg-blue-600',
  'bg-fuchsia-600',
  'bg-emerald-600',
] as const

function MetricCard({
  icon,
  gradientClass,
  value,
  label,
}: {
  icon: ReactNode
  gradientClass: string
  value: string | number
  label: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3.5">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md', gradientClass)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function Analytics() {
  const { data, isLoading, isError } = useAnalytics()

  if (isLoading) return <LoadingState label="Analyzing your pipeline & conversion funnel…" />
  if (isError || !data) return <ErrorNote message="Couldn't load analytics. Please retry." />

  if (data.totalCompanies === 0) {
    return (
      <EmptyState
        icon={<Target size={24} />}
        title="No data to analyze yet"
        description="Add companies to your pipeline and move them across stages to see your conversion funnel, drop-off hotspots, and offer rates."
      />
    )
  }

  const top = data.funnel[0]?.count ?? 0
  const finalStep = data.funnel[data.funnel.length - 1]
  const endToEndRate = top > 0 && finalStep ? Math.round((finalStep.count / top) * 100) : 0

  let biggestDrop = { from: '', to: '', lost: 0 }
  for (let i = 1; i < data.funnel.length; i++) {
    const lost = data.funnel[i - 1].count - data.funnel[i].count
    if (lost > biggestDrop.lost) {
      biggestDrop = { from: data.funnel[i - 1].label, to: data.funnel[i].label, lost }
    }
  }

  const maxStage = Math.max(
    1,
    ...STAGE_ORDER.filter((s) => s !== 'REJECTED').map((s) => data.stageCounts[s] ?? 0),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Placement Analytics</h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              Live Insights
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Conversion funnel, stage-wise drop-offs, and hiring statistics.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={<Building2 size={22} />}
          gradientClass="bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-indigo-500/25"
          value={data.totalCompanies}
          label="Companies Tracked"
        />
        <MetricCard
          icon={<CircleCheckBig size={22} />}
          gradientClass="bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-violet-500/25"
          value={`${data.shortlistRate}%`}
          label="Shortlist Rate"
        />
        <MetricCard
          icon={<Trophy size={22} />}
          gradientClass="bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/25"
          value={`${data.offerRate}%`}
          label="Offer Rate"
        />
        <MetricCard
          icon={<NotebookPen size={22} />}
          gradientClass="bg-gradient-to-tr from-sky-500 to-blue-600 shadow-sky-500/25"
          value={data.journalEntries}
          label="Journal Entries"
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Funnel */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 px-1">Conversion Funnel</h3>
          <Card className="p-5 sm:p-6 shadow-sm border-slate-200/80">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Stage-by-Stage Funnel</p>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">
                  Count of applications progressing past each milestone.
                </p>
              </div>
              <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700 ring-1 ring-indigo-200">
                {endToEndRate}% end-to-end
              </span>
            </div>

            <div className="space-y-3">
              {data.funnel.map((step, i) => {
                const width = top > 0 ? (step.count / top) * 100 : 0
                const prev = i > 0 ? data.funnel[i - 1].count : step.count
                const conv = prev > 0 ? Math.round((step.count / prev) * 100) : 100
                const tone = FUNNEL_TONES[i % FUNNEL_TONES.length]
                return (
                  <div
                    key={step.label}
                    className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:grid-cols-[11rem_1fr_6rem] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {step.label}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">Step {i + 1}</p>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600">{step.count} reached</span>
                        <span className="text-slate-400">
                          {i === 0 ? 'Baseline' : `${conv}% pass`}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-slate-200/80">
                        <div
                          className={cn('h-full rounded-full transition-all duration-300', tone)}
                          style={{ width: `${Math.max(width, step.count > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200/80 sm:justify-center">
                      <span className="text-xs font-medium text-slate-400 sm:hidden">Count</span>
                      <div
                        className={cn(
                          'flex h-6 min-w-6 items-center justify-center rounded-md px-2 text-xs font-bold text-white',
                          tone,
                        )}
                      >
                        {step.count}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {biggestDrop.lost > 0 && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5">
                <TrendingDown size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-xs font-medium text-amber-900 leading-relaxed">
                  Your biggest drop-off is between{' '}
                  <span className="font-bold">{biggestDrop.from}</span> and{' '}
                  <span className="font-bold">{biggestDrop.to}</span> ({biggestDrop.lost}{' '}
                  {biggestDrop.lost === 1 ? 'company' : 'companies'} dropped). Focus your upcoming prep on this round type!
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Outcomes & Summary */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 px-1">Pipeline Outcomes</h3>
            <Card className="space-y-3.5 p-5 shadow-sm border-slate-200/80">
              <Outcome label="Active in pipeline" value={data.activeCompanies} tone="indigo" />
              <Outcome label="Offers secured" value={data.offers} tone="emerald" />
              <Outcome label="Rejections" value={data.rejections} tone="rose" />
            </Card>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 px-1">Rounds Summary</h3>
            <Card className="space-y-3.5 p-5 shadow-sm border-slate-200/80">
              <Outcome label="Total rounds scheduled" value={data.totalRounds} tone="slate" />
              <Outcome label="Completed & cleared" value={data.completedRounds} tone="emerald" />
              <Outcome label="Upcoming scheduled" value={data.upcomingRounds} tone="indigo" />
            </Card>
          </div>
        </div>
      </div>

      {/* Stage Breakdown Bar */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 px-1">Stage-Wise Distribution</h3>
        <Card className="grid gap-4.5 p-5 sm:grid-cols-2 lg:grid-cols-4 shadow-sm border-slate-200/80">
          {STAGE_ORDER.map((stage) => {
            const count = data.stageCounts[stage] ?? 0
            const meta = STAGE_META[stage]
            return (
              <div key={stage} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
                    {meta.label}
                  </span>
                  <span className="font-bold text-slate-900">{count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', meta.bar)}
                    style={{ width: `${(count / maxStage) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}

function Outcome({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'indigo' | 'emerald' | 'rose' | 'slate'
}) {
  const tones: Record<typeof tone, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    slate: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <span
        className={cn(
          'min-w-9 rounded-lg px-2.5 py-0.5 text-center text-xs font-bold',
          tones[tone],
        )}
      >
        {value}
      </span>
    </div>
  )
}
