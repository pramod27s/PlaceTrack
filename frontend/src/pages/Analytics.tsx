import { Building2, CircleCheckBig, NotebookPen, Target, TrendingDown, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAnalytics } from '../hooks/queries'
import { Card, EmptyState, ErrorNote, LoadingState } from '../components/ui'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { cn } from '../lib/format'

const FUNNEL_TONES = [
  'bg-indigo-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-blue-500',
  'bg-fuchsia-500',
  'bg-emerald-500',
] as const

function Metric({
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
    <Card className="flex min-h-28 items-center gap-4 p-5">
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', iconClass)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  )
}

export default function Analytics() {
  const { data, isLoading, isError } = useAnalytics()

  if (isLoading) return <LoadingState label="Crunching your numbers..." />
  if (isError || !data) return <ErrorNote message="Couldn't load analytics. Please retry." />

  if (data.totalCompanies === 0) {
    return (
      <EmptyState
        icon={<Target size={22} />}
        title="No data to analyse yet"
        description="Once you add companies and move them through your pipeline, your conversion funnel and drop-off analysis will appear here."
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

  // Exclude REJECTED from the bar scale so a pile of rejections doesn't squash
  // the active stages into invisible slivers.
  const maxStage = Math.max(
    1,
    ...STAGE_ORDER.filter((s) => s !== 'REJECTED').map((s) => data.stageCounts[s] ?? 0),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">
          An honest mirror of your placement season - see exactly where you stand.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Metric
          icon={<Building2 size={22} />}
          iconClass="bg-indigo-100 text-indigo-600"
          value={data.totalCompanies}
          label="Companies tracked"
        />
        <Metric
          icon={<CircleCheckBig size={22} />}
          iconClass="bg-violet-100 text-violet-600"
          value={`${data.shortlistRate}%`}
          label="Shortlist rate"
        />
        <Metric
          icon={<Trophy size={22} />}
          iconClass="bg-emerald-100 text-emerald-600"
          value={`${data.offerRate}%`}
          label="Offer rate"
        />
        <Metric
          icon={<NotebookPen size={22} />}
          iconClass="bg-sky-100 text-sky-600"
          value={data.journalEntries}
          label="Journal entries"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Conversion funnel</h3>
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Stage-by-stage movement</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Counts show how many applications reached each milestone.
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {endToEndRate}% end-to-end
              </span>
            </div>

            <div className="space-y-2.5">
              {data.funnel.map((step, i) => {
                const width = top > 0 ? (step.count / top) * 100 : 0
                const prev = i > 0 ? data.funnel[i - 1].count : step.count
                const conv = prev > 0 ? Math.round((step.count / prev) * 100) : 100
                const tone = FUNNEL_TONES[i % FUNNEL_TONES.length]
                return (
                  <div
                    key={step.label}
                    className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-[10rem_1fr_6.5rem] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-400">Milestone {i + 1}</p>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">{step.count} reached</span>
                        <span className="text-slate-400">
                          {i === 0 ? 'Baseline' : `${conv}% through`}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                        <div
                          className={cn('h-full rounded-full transition-all', tone)}
                          style={{ width: `${Math.max(width, step.count > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 ring-1 ring-slate-200 sm:justify-center">
                      <span className="text-xs font-medium text-slate-400 sm:hidden">Count</span>
                      <div
                        className={cn(
                          'flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-sm font-bold text-white',
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
              <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-amber-50 px-3 py-2.5">
                <TrendingDown size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Your steepest drop-off is between{' '}
                  <span className="font-semibold">{biggestDrop.from}</span> and{' '}
                  <span className="font-semibold">{biggestDrop.to}</span> - {biggestDrop.lost}{' '}
                  {biggestDrop.lost === 1 ? 'company' : 'companies'} lost. Focus your prep there.
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Outcomes</h3>
            <Card className="space-y-3 p-5">
              <Outcome label="Active in pipeline" value={data.activeCompanies} tone="indigo" />
              <Outcome label="Offers" value={data.offers} tone="emerald" />
              <Outcome label="Rejections" value={data.rejections} tone="rose" />
            </Card>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Rounds</h3>
            <Card className="space-y-3 p-5">
              <Outcome label="Total rounds" value={data.totalRounds} tone="slate" />
              <Outcome label="Completed" value={data.completedRounds} tone="slate" />
              <Outcome label="Upcoming" value={data.upcomingRounds} tone="indigo" />
            </Card>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Where your companies are</h3>
        <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAGE_ORDER.map((stage) => {
            const count = data.stageCounts[stage] ?? 0
            const meta = STAGE_META[stage]
            return (
              <div key={stage}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
                    {meta.label}
                  </span>
                  <span className="font-semibold text-slate-700">{count}</span>
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
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={cn(
          'min-w-9 rounded-md px-2 py-0.5 text-center text-sm font-semibold',
          tones[tone],
        )}
      >
        {value}
      </span>
    </div>
  )
}
