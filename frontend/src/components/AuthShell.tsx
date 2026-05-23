import type { ReactNode } from 'react'
import { CircleCheckBig, Route as RouteIcon } from 'lucide-react'

const HIGHLIGHTS = [
  'A clear Kanban pipeline for every company you apply to',
  'Round scheduling with automatic conflict detection',
  'A personal interview journal that compounds in value',
  'Honest analytics — see exactly where you drop off',
]

/** Two-pane shell shared by the login and signup screens. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand / value panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 xl:p-16 lg:flex">
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-950/40">
            <RouteIcon size={22} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">PlaceTrack</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Placement season deserves better than a Google Sheet.
          </h1>
          <p className="mt-4 text-slate-300">
            Turn the chaos of WhatsApp forwards, portal notices, and calendar
            invites into one structured pipeline you actually control.
          </p>
          <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 py-3 text-sm text-slate-200">
                <CircleCheckBig size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Built by a student, for students.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
