import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Code2,
  HelpCircle,
  KanbanSquare,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  TriangleAlert,
  Users,
  Zap,
} from 'lucide-react'

import { PlaceTrackIcon } from '../components/PlaceTrackLogo'
import { Button } from '../components/ui'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* ---------------- Navbar ---------------- */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3.5 sm:px-8">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-sm shadow-indigo-600/15 ring-1 ring-white/10">
              <PlaceTrackIcon size={18} className="text-white sm:hidden" />
              <PlaceTrackIcon size={20} className="text-white hidden sm:block" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white truncate">PlaceTrack</span>
                <span className="hidden sm:inline-flex rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/30">
                  v1.0
                </span>
              </div>
              <p className="hidden sm:block text-[11px] font-medium text-slate-400">Placement Command Center</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#community" className="hover:text-white transition-colors">
              Community Vault
            </a>
            <a href="#problem" className="hover:text-white transition-colors">
              Why PlaceTrack
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link to="/signup" className="shrink-0">
              <Button size="sm" className="font-bold shadow-md shadow-indigo-500/25 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap">
                Get Started
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- Hero Section ---------------- */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Ambient Animated Gradient Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/30 via-violet-600/25 to-pink-600/15 blur-[140px] animate-pulse-glow" />
        <div className="pointer-events-none absolute top-1/3 -left-32 -z-10 h-[380px] w-[380px] rounded-full bg-indigo-600/20 blur-[110px] animate-float-slow" />
        <div className="pointer-events-none absolute top-1/2 -right-32 -z-10 h-[380px] w-[380px] rounded-full bg-violet-600/20 blur-[110px] animate-float-reverse" />

        <div className="mx-auto max-w-7xl px-4 sm:px-8 text-center relative">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md animate-slide-up shadow-sm hover:border-indigo-400/50 transition-colors">
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>Built for Final-Year Students Navigating Campus Placements</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl max-w-4xl mx-auto leading-[1.1] animate-slide-up-delay-1">
            Placement season deserves better than a{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-shimmer">
              messy Google Sheet.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed animate-slide-up-delay-2">
            Turn WhatsApp forwards, portal notices, and overlapping interview rounds into one structured command center. Track your pipeline, detect schedule clashes, log reflections, and explore peer interview intel.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-slide-up-delay-3">
            <Link to="/signup">
              <Button size="lg" className="px-8 py-3 text-sm font-bold shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Start Tracking Free
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="px-7 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Sign In to Pipeline
              </Button>
            </Link>
          </div>

          {/* ---------------- Interactive Hero Mockup Preview with Motion ---------------- */}
          <div className="relative mt-16 mx-auto max-w-5xl">
            {/* Floating Live Badge 1: Top-Right Countdown */}
            <div className="hidden lg:flex items-center gap-2.5 absolute -top-5 -right-6 z-20 rounded-2xl border border-indigo-500/30 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-indigo-950/50 backdrop-blur-xl animate-float">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-slate-300">Upcoming OA:</span>
              <span className="font-bold text-amber-300">Amazon in 2h 45m</span>
            </div>

            {/* Floating Live Badge 2: Bottom-Left Offer Notification */}
            <div className="hidden lg:flex items-center gap-2.5 absolute -bottom-5 -left-6 z-20 rounded-2xl border border-emerald-500/30 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-emerald-950/40 backdrop-blur-xl animate-float-slow">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                ✓
              </span>
              <span className="text-slate-300">Offer Secured:</span>
              <span className="font-bold text-emerald-300">Microsoft Full-Time SDE</span>
            </div>

            {/* Floating Live Badge 3: Right-Side Community Intel */}
            <div className="hidden xl:flex items-center gap-2 absolute top-1/2 -right-12 z-20 -translate-y-1/2 rounded-2xl border border-sky-500/30 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-200 shadow-xl shadow-sky-950/40 backdrop-blur-xl animate-float-reverse">
              <Users size={14} className="text-sky-400" />
              <span>48 Senior Reviews in Vault</span>
            </div>

            {/* Main Preview Container */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-3 sm:p-5 shadow-2xl shadow-indigo-950/40 ring-1 ring-white/10 backdrop-blur-2xl text-left transition-all duration-300 hover:border-slate-700">
              {/* Window bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-500">
                  placetrack.app/pipeline — live preview
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </div>
              </div>

              {/* Simulated Live UI inside Hero */}
              <div className="p-3 sm:p-5 space-y-4">
                {/* Conflict Alert Banner with Live Radar Ping */}
                <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-200 shadow-inner">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <TriangleAlert size={15} className="text-rose-400 shrink-0" />
                  <span className="font-semibold">
                    Conflict detected: Google Technical Round overlaps with Amazon OA (Friday, 10:00 AM)
                  </span>
                  <span className="ml-auto font-bold text-rose-300 underline cursor-pointer hover:text-rose-100 transition-colors">
                    Auto-flagged by Conflict Engine
                  </span>
                </div>

                {/* Kanban Column Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Column 1 */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                        Online Assessment
                      </span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px]">3</span>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 space-y-2 shadow-sm card-hover cursor-pointer">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-bold text-white">Amazon</p>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                          Superset ✓
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">SDE-1 (₹44 LPA)</p>
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-500">
                        <span>OA Scheduled</span>
                        <span className="text-indigo-400 font-semibold">Tomorrow 10 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 space-y-2.5 ring-1 ring-indigo-500/20">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-300">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        Technical Interview
                      </span>
                      <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-[10px]">2</span>
                    </div>

                    <div className="rounded-lg border border-indigo-500/40 bg-slate-900 p-3 space-y-2 shadow-md card-hover cursor-pointer">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-bold text-white">Google</p>
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                          Round 2
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Software Engineer (₹52 LPA)</p>
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px]">
                        <span className="text-slate-400">Google Meet</span>
                        <span className="inline-flex items-center gap-1 text-indigo-300 font-bold">
                          <CalendarPlus size={11} />
                          1-Click Cal Sync
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Offer Secured 🎉
                      </span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px]">1</span>
                    </div>

                    <div className="rounded-lg border border-emerald-500/30 bg-slate-900/90 p-3 space-y-2 shadow-sm card-hover cursor-pointer">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-bold text-white">Microsoft</p>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                          Accepted
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Full-Time SDE</p>
                      <div className="border-t border-slate-800/80 pt-2 text-[10px] text-emerald-400 font-semibold">
                        Journal &amp; questions logged (4 notes)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- The Core Pain vs Solution ---------------- */}
      <section id="problem" className="border-t border-slate-900 bg-slate-950/90 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">The Reality of Placement Season</span>
            <h2 className="mt-3 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Why standard spreadsheets fail under pressure
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              When 30 companies are testing and interviewing at once, scattered notes and messy sheets cause missed opportunities.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {/* The Old Way */}
            <div className="rounded-3xl border border-rose-500/20 bg-rose-950/10 p-7 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300">
                <span>The Chaotic Way</span>
              </div>
              <h3 className="text-xl font-bold text-white">Spreadsheets &amp; WhatsApp Forwards</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Double-booked interview slots without any collision warning.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Zero record of what questions you flopped on in previous technical rounds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Confusion over which tailored resume version was submitted to which drive.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No shared peer wisdom to know what actual questions seniors were asked.</span>
                </li>
              </ul>
            </div>

            {/* The PlaceTrack Way */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/15 p-7 sm:p-8 space-y-4 shadow-xl shadow-emerald-950/20">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                <span>The PlaceTrack Way</span>
              </div>
              <h3 className="text-xl font-bold text-white">Structured Placement Command Center</h3>
              <ul className="space-y-3 text-sm text-slate-300 font-medium">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time overlap conflict detection flags overlapping rounds automatically.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Compounding interview journal creates a personal question bank for revision.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>1-Click Google Calendar &amp; .ics export with pre-filled meeting links.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Campus Community Vault to discover real drive experiences and questions from peers.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 6-Card Bento Grid ---------------- */}
      <section id="features" className="py-24 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Engineered For Students</span>
            <h2 className="mt-3 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Everything you need to conquer placement season
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Bento Card 1 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
                <KanbanSquare size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Customizable Stage Kanban</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Move applications effortlessly from Applied → OA → Technical → HR → Offer. Includes a dedicated Superset registration checkbox.
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30">
                <CalendarClock size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Conflict Engine &amp; Calendar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Auto-detects overlapping tests and interviews with instant clash warnings. 1-click sync to Google Calendar, Apple, or Outlook.
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                <NotebookPen size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Compounding Interview Journal</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                60-second reflection prompt capturing questions asked, topics covered, and mistakes made. Searchable prep bank for next drives.
              </p>
            </div>

            {/* Bento Card 4: Community Vault */}
            <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 p-7 sm:p-8 space-y-4 ring-1 ring-indigo-500/30 hover:border-indigo-500/60 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
                <Users size={24} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Community Experience Vault</h3>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  New
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Discover real campus interview questions, tips, and drive breakdowns shared by peers with full anonymity options and helpful upvoting.
              </p>
            </div>

            {/* Bento Card 5 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Inline Status &amp; Undo</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                1-click to mark rounds Cleared or Failed directly from cards with instant Undo toast safety nets.
              </p>
            </div>

            {/* Bento Card 6 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/30">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Strict Tenant Isolation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                JWT-secured Spring Boot backend ensuring your application pipeline, CTC notes, and reflections stay private to your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Community Vault Spotlight Showcase ---------------- */}
      <section id="community" className="py-24 border-t border-slate-900 bg-slate-950/70 relative overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 right-0 -z-10 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-300">
              <Users size={14} className="text-sky-400" />
              <span>Campus Interview Intelligence</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Learn from real interviews before your turn comes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              Don't enter your dream interview blind. The Community Vault lets seniors and batchmates share exact questions asked, round patterns, and verdict tips.
            </p>
          </div>

          {/* Community Feature Highlights & Interactive-style Mockup */}
          <div className="mt-14 grid gap-8 lg:grid-cols-12 items-center">
            {/* Left: Key capabilities */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 hover:border-indigo-500/40 transition-colors">
                <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
                  <BookOpen size={18} />
                  <span>Real Questions &amp; Topic Breakdowns</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search by company name to see DSA questions, system design prompts, and behavioral questions asked in recent rounds.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 hover:border-sky-500/40 transition-colors">
                <div className="flex items-center gap-2.5 text-sky-400 font-bold text-sm">
                  <ThumbsUp size={18} />
                  <span>Peer Upvoting &amp; Curated Insights</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upvote high-yield experiences with 1-click. Sort by most helpful to quickly read the best preparation playbooks.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                  <HelpCircle size={18} />
                  <span>Anonymous or Verified Sharing</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Share your candid experience freely with one-click anonymity, or build your campus reputation with your verified batch name.
                </p>
              </div>
            </div>

            {/* Right: Mock Community Card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-2xl ring-1 ring-white/10 space-y-4">
                {/* Header bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-sm">
                      G
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Google — Software Engineer</h4>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          Selected 🎉
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">On-Campus Drive • ₹52 LPA • Anonymous Senior</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300 border border-amber-500/20">
                    Medium Difficulty
                  </span>
                </div>

                {/* Experience Content Snippet */}
                <div className="space-y-3 text-xs text-slate-300">
                  <div>
                    <span className="font-bold text-slate-200">Rounds Breakdown:</span>
                    <p className="text-slate-400 mt-0.5">
                      Round 1 was OA (2 questions: DP on Trees &amp; String manipulation). Round 2 was DSA with focus on Graph shortest paths. Round 3 was Googliness &amp; leadership principles.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
                    <span className="font-bold text-indigo-300">Top Pro-Tip:</span>
                    <p className="text-slate-400 italic">
                      "Make sure to explain time complexity tradeoffs out loud before you start writing code in Google Docs."
                    </p>
                  </div>
                </div>

                {/* Footer / Interaction Bar */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <ThumbsUp size={14} />
                    <span>48 students found this helpful</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Shared for 2026 Batch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Architecture Showcase ---------------- */}
      <section id="architecture" className="border-t border-slate-900 bg-slate-950/80 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-8 sm:p-12 shadow-2xl ring-1 ring-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                  <Code2 size={14} />
                  <span>Under The Hood</span>
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Architecture &amp; Engineering Decisions
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Spring Boot 3 + React + PostgreSQL</span>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Backend Core</p>
                <p className="text-sm font-semibold text-white">Layered Spring Boot Monolith</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clean controllers, services, repositories, and immutable Java Records for high-throughput REST APIs.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-400">Domain Logic</p>
                <p className="text-sm font-semibold text-white">Conflict Engine &amp; Community Feed</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Time-overlap detection algorithms for rounds alongside aggregated peer review upvoting services.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Data &amp; Security</p>
                <p className="text-sm font-semibold text-white">PostgreSQL &amp; JWT Security</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  User-isolated JPA query enforcement, BCrypt password hashing, and clean relational normalization.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-400">Frontend State</p>
                <p className="text-sm font-semibold text-white">React Query + Zustand</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Optimistic Kanban dragging with @dnd-kit, community search filters, and responsive mobile-first views.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Bottom CTA Banner ---------------- */}
      <section className="py-24 border-t border-slate-900 relative overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="mx-auto max-w-5xl px-4 sm:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-5xl">
            Own your placement season starting today.
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join hundreds of students turning placement stress into a structured, trackable journey.
          </p>
          <div className="pt-2">
            <Link to="/signup">
              <Button size="lg" className="px-9 py-3 text-base font-bold shadow-xl shadow-indigo-600/30">
                Create Free Account
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
              <PlaceTrackIcon size={13} />
            </div>
            <span className="font-bold text-slate-300">PlaceTrack</span>
            <span>— Placement Command Center</span>
          </div>
          <p>© {new Date().getFullYear()} PlaceTrack. Built for ambitious students.</p>
        </div>
      </footer>
    </div>
  )
}
