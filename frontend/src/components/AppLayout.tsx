import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  BarChart3,
  CalendarClock,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Sparkles,
  Route as RouteIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../store/auth'
import { cn, initials } from '../lib/format'
import { NotificationBell } from './NotificationBell'
import { ToastContainer } from './ToastContainer'

interface NavItem {
  to: string
  label: string
  mobileLabel: string
  icon: LucideIcon
  end?: boolean
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/pipeline', label: 'Pipeline', mobileLabel: 'Pipeline', icon: KanbanSquare },
  { to: '/rounds', label: 'Rounds', mobileLabel: 'Rounds', icon: CalendarClock },
  { to: '/journal', label: 'Journal', mobileLabel: 'Journal', icon: NotebookPen },
  { to: '/analytics', label: 'Analytics', mobileLabel: 'Insights', icon: BarChart3 },
]

/** Maps the current path to the heading shown in the top bar. */
function sectionTitle(pathname: string): { title: string; subtitle?: string } {
  if (pathname.startsWith('/pipeline')) return { title: 'Pipeline', subtitle: 'Kanban Board' }
  if (pathname.startsWith('/companies/')) return { title: 'Company Details', subtitle: 'Overview & Rounds' }
  if (pathname.startsWith('/rounds')) return { title: 'Rounds & Schedule', subtitle: 'Timeline & Conflicts' }
  if (pathname.startsWith('/journal')) return { title: 'Interview Journal', subtitle: 'Reflections & Questions' }
  if (pathname.startsWith('/analytics')) return { title: 'Analytics & Insights', subtitle: 'Funnel & Conversion' }
  return { title: 'Dashboard', subtitle: 'Overview' }
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

  const currentSection = sectionTitle(location.pathname)

  return (
    <div className="min-h-screen bg-slate-50/60 lg:pl-64">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-950 border-r border-slate-800/80 shadow-xl shadow-slate-950/20 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5.5 border-b border-slate-800/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            <RouteIcon size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold tracking-tight text-white">PlaceTrack</p>
              <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-300 ring-1 ring-indigo-400/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Command Center</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menu
          </p>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-900/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
                )
              }
            >
              <Icon size={18} className="transition-transform group-hover:scale-110" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* AI Quick Tip / Status */}
        <div className="mx-3 mb-4 rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold">Placement Season</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Keep your journal updated after every round to build your interview dataset.
          </p>
        </div>

        {/* User Card */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950/80">
          <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-900/80">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm ring-2 ring-indigo-400/20">
              {user ? initials(user.fullName) : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-100">{user?.fullName}</p>
              <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-rose-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between">
            <div className="min-w-0 flex items-center gap-3">
              {/* Mobile brand icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md lg:hidden">
                <RouteIcon size={18} className="text-white" />
              </div>
              <div>
                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  {currentSection.title}
                </h1>
                {currentSection.subtitle && (
                  <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                    {currentSection.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="relative flex items-center gap-2">
              <NotificationBell />

              {/* Mobile user profile button */}
              <button
                type="button"
                aria-label="Account menu"
                onClick={() => setAccountOpen((open) => !open)}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 ring-1 ring-indigo-300/60 transition hover:bg-indigo-200 lg:hidden"
              >
                {user ? initials(user.fullName) : '?'}
              </button>

              {accountOpen && (
                <div className="animate-pop absolute right-0 top-12 z-40 w-[min(calc(100vw-2rem),18rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:hidden">
                  <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/50">
                    <p className="truncate text-sm font-bold text-slate-900">{user?.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-8 sm:pt-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Primary navigation"
        className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200/80 bg-white/90 px-2 pt-1.5 pb-1 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md lg:hidden"
      >
        {NAV.map(({ to, mobileLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'min-w-0 flex-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-all',
                'flex flex-col items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                isActive
                  ? 'text-indigo-600 bg-indigo-50/80'
                  : 'text-slate-400 hover:text-slate-700',
              )
            }
          >
            <Icon size={18} />
            <span className="truncate">{mobileLabel}</span>
          </NavLink>
        ))}
      </nav>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}
