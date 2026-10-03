import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarPlus, Check, CheckCircle2, Sparkles, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/format'
import { prefersReducedMotion } from '../../hooks/useInView'

/*
 * A scripted product demo for the landing hero. It plays once:
 *   1. a placement notice is "pasted" and read,
 *   2. AI fills in the company details,
 *   3. the new company drops into the pipeline,
 *   4. a schedule clash is flagged.
 * Visitors who prefer reduced motion see the final state straight away.
 */
const STEP_AT_MS = [700, 2100, 3300, 4300]
const FINAL_STEP = STEP_AT_MS.length

const NOTICE = 'Deloitte USI drive · Associate Analyst · 7.6 LPA · register on Superset by Friday'

function PreviewCard({
  company,
  role,
  left,
  right,
  avatar,
  superset,
  className,
}: {
  company: string
  role: string
  left: string
  right: ReactNode
  avatar: string
  superset?: boolean
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-slate-800 bg-slate-900 p-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold', avatar)}>
            {company
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{company}</p>
            <p className="truncate text-xs text-slate-400">{role}</p>
          </div>
        </div>
        {superset && <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" aria-label="Registered on Superset" />}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2 text-xs text-slate-500">
        <span>{left}</span>
        <span className="inline-flex items-center gap-1 text-slate-300">{right}</span>
      </div>
    </div>
  )
}

function Column({
  title,
  dot,
  heading,
  count,
  tint,
  children,
}: {
  title: string
  dot: string
  heading: string
  count: number
  tint: string
  children: ReactNode
}) {
  return (
    <div className={cn('rounded-xl border p-2.5 sm:min-h-[15.5rem]', tint)}>
      <div className="mb-2 flex items-center justify-between px-1 text-sm">
        <span className={cn('flex items-center gap-2 font-semibold', heading)}>
          <span className={cn('h-2 w-2 rounded-full', dot)} aria-hidden="true" />
          {title}
        </span>
        <span
          key={count}
          className="animate-pop rounded-full bg-slate-800 px-2 py-0.5 text-xs tabular-nums text-slate-300"
        >
          {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

export function HeroPreview() {
  const [step, setStep] = useState(() => (prefersReducedMotion() ? FINAL_STEP : 0))

  useEffect(() => {
    if (prefersReducedMotion()) return
    const timers = STEP_AT_MS.map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    return () => timers.forEach(clearTimeout)
  }, [])

  const reading = step === 1
  const filled = step >= 2
  const added = step >= 3
  const clash = step >= 4

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 text-left shadow-2xl shadow-black/50 sm:p-4">
      {/* Window bar */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-2 pb-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        </div>
        <span className="truncate text-xs text-slate-500">Example pipeline</span>
      </div>

      <div className="space-y-3 p-2 sm:p-4" aria-live="off">
        {/* AI auto-fill panel */}
        <div
          className={cn(
            'relative min-h-[4.75rem] overflow-hidden rounded-lg border bg-slate-950/60 p-3 text-sm transition-colors duration-500',
            filled ? 'border-indigo-500/40' : 'border-slate-800',
          )}
        >
          {reading && <span aria-hidden="true" className="animate-scan pointer-events-none absolute inset-y-0 w-1/3" />}
          <div className="flex items-start gap-2.5">
            <Sparkles
              size={16}
              aria-hidden="true"
              className={cn('mt-0.5 shrink-0 text-indigo-400', reading && 'animate-pulse')}
            />
            <div className="min-w-0 flex-1">
              {step === 0 && (
                <p className="text-slate-500">
                  Paste a placement notice
                  <span className="animate-caret ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-slate-400" aria-hidden="true" />
                </p>
              )}
              {reading && (
                <p className="text-slate-300">
                  <span className="font-medium text-white">Reading notice</span>
                  <span className="ml-1 inline-flex gap-0.5" aria-hidden="true">
                    <span className="animate-dot h-1 w-1 rounded-full bg-slate-400" />
                    <span className="animate-dot h-1 w-1 rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="animate-dot h-1 w-1 rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-500">{NOTICE}</span>
                </p>
              )}
              {filled && (
                <div>
                  <p className="font-medium text-white">Filled in from the notice</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {['Deloitte USI', 'Associate Analyst', '7.6 LPA', 'Superset link'].map((chip, i) => (
                      <span
                        key={chip}
                        style={{ animationDelay: `${i * 110}ms` }}
                        className="animate-pop inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-200 opacity-0"
                      >
                        <Check size={12} aria-hidden="true" className="text-emerald-400" />
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clash alert: space is reserved so nothing below jumps when it appears */}
        <div
          className={cn(
            'flex items-start gap-2.5 rounded-lg border border-rose-900/60 bg-rose-950/30 p-3 text-sm text-rose-200 transition-[opacity,transform] duration-500',
            clash ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
          )}
          aria-hidden={!clash}
        >
          <span className="relative mt-0.5 shrink-0">
            <TriangleAlert size={16} className="text-rose-400" aria-hidden="true" />
            {clash && <span className="animate-ping-once absolute inset-0 rounded-full bg-rose-500/40" aria-hidden="true" />}
          </span>
          <span>
            <span className="font-medium">Clash:</span> Google technical round overlaps with the Amazon OA on Friday at
            10:00 AM.
          </span>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Column
            title="Online assessment"
            dot="bg-sky-500"
            heading="text-sky-300"
            count={added ? 2 : 1}
            tint="border-sky-900/50 bg-sky-950/20"
          >
            {added && (
              <PreviewCard
                className="animate-drop"
                company="Deloitte USI"
                role="Associate Analyst · 7.6 LPA"
                left="Just added"
                right="OA on Friday"
                avatar="bg-sky-900/50 text-sky-300"
                superset
              />
            )}
            <PreviewCard
              className="animate-pop opacity-0 [animation-delay:150ms]"
              company="Amazon"
              role="SDE-1 · ₹44 LPA"
              left="OA scheduled"
              right="Fri, 10 AM"
              avatar="bg-sky-900/50 text-sky-300"
              superset
            />
          </Column>

          <Column title="Technical" dot="bg-blue-500" heading="text-blue-300" count={1} tint="border-blue-900/50 bg-blue-950/20">
            <PreviewCard
              className="animate-pop opacity-0 [animation-delay:250ms]"
              company="Google"
              role="Software Engineer · ₹52 LPA"
              left="Google Meet"
              right={
                <>
                  <CalendarPlus size={12} aria-hidden="true" />
                  In calendar
                </>
              }
              avatar="bg-blue-900/50 text-blue-300"
            />
          </Column>

          <Column title="Offer" dot="bg-emerald-500" heading="text-emerald-300" count={1} tint="border-emerald-900/50 bg-emerald-950/20">
            <PreviewCard
              className="animate-pop opacity-0 [animation-delay:350ms]"
              company="Microsoft"
              role="Full-time SDE"
              left="4 journal notes"
              right="Offer accepted"
              avatar="bg-emerald-900/50 text-emerald-300"
            />
          </Column>
        </div>
      </div>
    </div>
  )
}
