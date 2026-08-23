import type { ReactNode } from 'react'
import { CircleCheckBig, Sparkles } from 'lucide-react'
import { PlaceTrackIcon } from './PlaceTrackLogo'

const HIGHLIGHTS = [
  'Clear visual Kanban pipeline for every applied company',
  'Round scheduler with instant time-overlap conflict detection',
  'Personal interview journal that compounds in value',
  'Honest conversion funnel & drop-off analytics',
]

/** Two-pane shell shared by the login and signup screens. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#090d16]">
      {/* Brand / value panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-12 xl:p-16 lg:flex border-r border-slate-800">
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-sm shadow-indigo-600/15 ring-1 ring-white/10">
            <PlaceTrackIcon size={22} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight">PlaceTrack</span>
            <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/30">
              PRO
            </span>
          </div>
        </div>

        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30 backdrop-blur-sm mb-4">
            <Sparkles size={13} className="text-indigo-300" />
            <span>Placement Season Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl tracking-tight">
            Placement season deserves better than a messy Google Sheet.
          </h1>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Turn the chaos of WhatsApp forwards, portal notices, and calendar invites into one structured pipeline you actually control.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-xs font-semibold text-slate-200 ring-1 ring-white/10 backdrop-blur-sm">
                <CircleCheckBig size={16} className="shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs font-medium text-slate-500">
          Built with Spring Boot &amp; React for ambitious students.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 dark:bg-[#090d16]">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
