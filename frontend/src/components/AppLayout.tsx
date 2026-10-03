import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  CalendarClock,
  ChevronDown,
  KanbanSquare,
  Key,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PlaceTrackIcon } from './PlaceTrackLogo'
import { useAuth } from '../store/auth'
import { cn, initials } from '../lib/format'
import { NotificationBell } from './NotificationBell'
import { ToastContainer } from './ToastContainer'
import { ThemeToggle } from './ThemeToggle'
import { AiSettingsModal } from './AiSettingsModal'
import { GEMINI_API_KEY_STORAGE } from '../lib/api'

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
  { to: '/experiences', label: 'Experiences', mobileLabel: 'Experiences', icon: Users },
]

/** Maps the current path to the heading shown in the top bar. */
function sectionTitle(pathname: string): { title: string; subtitle?: string } {
  if (pathname.startsWith('/pipeline')) return { title: 'Pipeline', subtitle: 'Every application by stage' }
  if (pathname.startsWith('/companies/')) return { title: 'Company', subtitle: 'Details and rounds' }
  if (pathname.startsWith('/rounds')) return { title: 'Rounds', subtitle: 'Schedule and conflicts' }
  if (pathname.startsWith('/journal')) return { title: 'Journal', subtitle: 'Notes from your rounds' }
  if (pathname.startsWith('/experiences')) return { title: 'Experiences', subtitle: 'Interview experiences shared by peers' }
  return { title: 'Dashboard', subtitle: 'Overview' }
}


export function AppLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [accountOpen, setAccountOpen] = useState(false)
  const accountButtonRef = useRef<HTMLButtonElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [hasCustomKey, setHasCustomKey] = useState(() =>
    Boolean(localStorage.getItem(GEMINI_API_KEY_STORAGE)?.trim()),
  )

  const handleSignOut = () => {
    signOut()
    setAccountOpen(false)
    navigate('/login', { replace: true })
  }

  // Account menu: focus the first item on open, close on Escape and return focus to the trigger.
  useEffect(() => {
    if (!accountOpen) return
    accountMenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountOpen(false)
        accountButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [accountOpen])

  const currentSection = sectionTitle(location.pathname)

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#090d16] lg:pl-64">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-950 border-r border-slate-800/80 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5.5 border-b border-slate-800/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <PlaceTrackIcon size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-white">PlaceTrack</p>
            <p className="text-xs font-medium text-slate-400">Placement tracker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-2xs font-bold text-slate-500">
            Menu
          </p>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* AI Quick Tip / Status */}
        <div className="mx-3 mb-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="flex items-center gap-2 text-slate-200">
            <Sparkles size={14} className="text-slate-400" />
            <span className="text-xs font-semibold">Tip</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Keep your journal updated after every round to build your interview dataset.
          </p>
        </div>

      </aside>

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 dark:bg-slate-950/80 dark:border-slate-800/80 px-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between">
            <div className="min-w-0 flex items-center gap-3">
              {/* Mobile brand icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 lg:hidden">
                <PlaceTrackIcon size={18} className="text-white" />
              </div>
              <div>
                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  {currentSection.title}
                </h1>
                {currentSection.subtitle && (
                  <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
                    {currentSection.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="relative flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />

              {/* User profile & settings menu (Desktop & Mobile) */}
              <div className="relative">
                <button
                  ref={accountButtonRef}
                  type="button"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-controls="account-menu"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="ml-1 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {user ? initials(user.fullName) : '?'}
                  </div>
                  <span className="hidden max-w-[110px] truncate text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
                    {user?.fullName?.split(' ')[0] ?? 'Account'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" aria-hidden="true" />
                </button>

                {accountOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setAccountOpen(false)}
                    />
                    <div
                      id="account-menu"
                      ref={accountMenuRef}
                      role="menu"
                      aria-label="Account"
                      className="animate-pop absolute right-0 top-12 z-40 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-lg shadow-slate-900/10 dark:shadow-black/40">
                      <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{user?.fullName}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>

                      <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setAccountOpen(false)
                            setAiModalOpen(true)
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Key size={15} className="text-slate-500 dark:text-slate-400" />
                            <span>AI API key settings</span>
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-2xs font-medium',
                              hasCustomKey
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            )}
                          >
                            {hasCustomKey ? 'Custom' : 'Default'}
                          </span>
                        </button>
                      </div>

                      <div className="p-1.5">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
        className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200/80 bg-white/90 dark:bg-slate-950/90 dark:border-slate-800/80 px-2 pt-1.5 pb-1 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md lg:hidden"
      >
        {NAV.map(({ to, mobileLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'min-w-0 flex-1 rounded-xl px-1 py-1.5 text-2xs font-semibold transition-all',
                'flex flex-col items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
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

      {/* AI API Key Settings Modal */}
      <AiSettingsModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onKeySaved={() =>
          setHasCustomKey(Boolean(localStorage.getItem(GEMINI_API_KEY_STORAGE)?.trim()))
        }
      />
    </div>
  )
}
