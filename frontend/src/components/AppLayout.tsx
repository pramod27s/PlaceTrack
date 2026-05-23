import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  BarChart3,
  CalendarClock,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Route as RouteIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../store/auth'
import { cn, initials } from '../lib/format'
import { NotificationBell } from './NotificationBell'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/rounds', label: 'Rounds', icon: CalendarClock },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

/** Maps the current path to the heading shown in the top bar. */
function sectionTitle(pathname: string): string {
  if (pathname.startsWith('/pipeline')) return 'Pipeline'
  if (pathname.startsWith('/companies/')) return 'Company'
  if (pathname.startsWith('/rounds')) return 'Rounds & Schedule'
  if (pathname.startsWith('/journal')) return 'Interview Journal'
  if (pathname.startsWith('/analytics')) return 'Analytics'
  return 'Dashboard'
}

export function AppLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [accountOpen, setAccountOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
    setAccountOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-900 lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <RouteIcon size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">PlaceTrack</p>
            <p className="text-[11px] text-slate-400">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
              {user ? initials(user.fullName) : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Compact brand for small screens where the sidebar is hidden. */}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 lg:hidden">
                <RouteIcon size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900">
                {sectionTitle(location.pathname)}
              </h1>
            </div>
            <div className="relative flex items-center gap-1">
              <NotificationBell />
              <button
                type="button"
                aria-label="Account menu"
                onClick={() => setAccountOpen((open) => !open)}
                className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-200 lg:hidden"
              >
                {user ? initials(user.fullName) : '?'}
              </button>
              {accountOpen && (
                <div className="animate-pop absolute right-0 top-12 z-40 w-[min(calc(100vw-2rem),18rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200 lg:hidden">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-6 sm:px-8 sm:pt-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition',
                isActive ? 'text-indigo-600' : 'text-slate-400',
              )
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
