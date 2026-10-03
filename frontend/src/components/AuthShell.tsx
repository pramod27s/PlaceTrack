import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { PlaceTrackIcon } from './PlaceTrackLogo'

const HIGHLIGHTS = [
  'A Kanban pipeline for every company you apply to',
  'A round scheduler that flags overlapping interviews',
  'A personal journal of the questions you were asked',
  'Interview experiences shared by your peers',
]


/** Two-pane shell shared by the login and signup screens. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#090d16]">
      {/* Brand / value panel */}
      <div className="hidden w-1/2 flex-col justify-between border-r border-slate-800 bg-slate-950 p-12 lg:flex xl:p-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
            <PlaceTrackIcon size={20} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">PlaceTrack</span>
        </div>

        <div className="max-w-lg">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
            Placement season deserves better than a messy spreadsheet.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Turn WhatsApp forwards, portal notices and calendar invites into one pipeline you control.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                <Check size={16} className="mt-0.5 shrink-0 text-indigo-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500">Built with Spring Boot and React.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 dark:bg-[#090d16]">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
