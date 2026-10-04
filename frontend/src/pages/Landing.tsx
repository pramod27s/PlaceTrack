import { Link } from 'react-router-dom'
import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CalendarPlus,
  Check,
  HelpCircle,
  KanbanSquare,
  NotebookPen,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  TriangleAlert,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { PlaceTrackIcon } from '../components/PlaceTrackLogo'
import { HeroPreview } from '../components/landing/HeroPreview'
import { Reveal } from '../components/landing/Reveal'
import { ParticleField } from '../components/landing/ParticleField'
import { CountUp, RevealHeading, SplitWords, StaggerList } from '../components/landing/Kinetic'
import { CursorGlow, ScrollProgress } from '../components/landing/PageFx'
import { useInView } from '../hooks/useInView'
import { clamp, useMagnetic, usePointerFx, useScrollProgress } from '../hooks/useLandingFx'
import { cn } from '../lib/format'

/* ------------------------------------------------------------------ helpers */

const PRIMARY_LINK =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
const SECONDARY_LINK =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
const NAV_LINK =
  'relative transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-indigo-400 after:to-sky-400 after:transition-transform after:duration-300 hover:after:scale-x-100'
/** Smooths the per-frame tilt written by usePointerFx. */
const TILT_EASE = 'transition-transform duration-300 ease-out will-change-transform'

/** Hero background layers drift at different speeds as the page scrolls. */
function parallaxHero(_: number, el: HTMLElement) {
  el.style.setProperty('--sy', String(window.scrollY))
}

/** The product preview starts tipped back like an open laptop lid and flattens as it scrolls up. */
function tiltPreview(progress: number, el: HTMLElement) {
  const t = clamp((0.42 - progress) / 0.24)
  el.style.transform = `perspective(1600px) rotateX(${(t * 20).toFixed(2)}deg) scale(${(1 - t * 0.06).toFixed(4)})`
}

/** The example post drifts against the scroll for depth. */
function driftPost(progress: number, el: HTMLElement) {
  el.style.transform = `translate3d(0, ${((0.5 - progress) * 70).toFixed(1)}px, 0)`
}

/** Small label above a section heading. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-indigo-400">{children}</p>
}

/** A primary link that leans towards the cursor and has a light sweeping across it. */
function MagneticLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const ref = useMagnetic<HTMLAnchorElement>(0.28)
  return (
    <Link ref={ref} to={to} className={cn(PRIMARY_LINK, 'fx-shine group', className)}>
      {children}
    </Link>
  )
}

/** A comet of light that runs along a section's top border. */
function SectionComet({ delay = 0 }: { delay?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-px h-px overflow-hidden">
      <div
        style={{ animationDelay: `${delay}ms` }}
        className="animate-comet h-px w-1/3 bg-gradient-to-r from-transparent via-indigo-400/80 to-transparent"
      />
    </div>
  )
}

/** A feature tile in the "Everything you need" grid. Zooms in on scroll; tilts towards the cursor with a spotlight under it. */
function FeatureCard({
  icon,
  title,
  delay = 0,
  children,
}: {
  icon: ReactNode
  title: string
  delay?: number
  children: ReactNode
}) {
  const ref = usePointerFx<HTMLDivElement>(5)
  return (
    <Reveal delay={delay} from="zoom" className="h-full">
      <div
        ref={ref}
        className="fx-spotlight group h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-[border-color,translate,background-color,transform] duration-300 ease-out hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900 sm:p-7"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-200 transition-[background-color,color,rotate,scale,box-shadow] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_0_24px_rgba(99,102,241,0.55)]"
          aria-hidden="true"
        >
          {icon}
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{children}</p>
      </div>
    </Reveal>
  )
}

const EXTRACTED = [
  ['Company', 'Deloitte USI'],
  ['Role', 'Associate Analyst'],
  ['CTC', '7.6 LPA'],
  ['Superset', 'joinsuperset.com/…'],
  ['Round', 'Technical, 45 min'],
] as const

/** The "AI pulled these out of the notice" box: a scan passes over it, then each field ticks in and types itself out. */
function ExtractedFields() {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className="relative w-full shrink-0 space-y-1.5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 lg:w-auto lg:min-w-[300px]"
    >
      {inView && (
        <span
          aria-hidden="true"
          className="animate-scan-down pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-indigo-500/25 to-transparent"
        />
      )}
      <p className="flex items-center gap-2 text-slate-500">
        Extracted from the notice
        {!inView && <span className="animate-caret inline-block h-3.5 w-px bg-slate-500" aria-hidden="true" />}
      </p>
      {EXTRACTED.map(([k, v], i) => {
        const at = 500 + i * 320
        return (
          <p key={k} className="flex min-w-0 gap-2">
            <Check
              size={14}
              style={inView ? { animationDelay: `${at}ms` } : undefined}
              className={cn('shrink-0 text-emerald-400', inView ? 'animate-icon-pop' : 'opacity-0')}
              aria-hidden="true"
            />
            <span className={cn('text-slate-500 transition-opacity duration-300', inView ? 'opacity-100' : 'opacity-0')} style={inView ? { transitionDelay: `${at}ms` } : undefined}>
              {k}:
            </span>
            <span
              style={inView ? ({ '--n': v.length, animationDelay: `${at + 120}ms` } as CSSProperties) : undefined}
              className={cn('min-w-0 text-slate-200', inView ? 'animate-type' : 'opacity-0')}
            >
              {v}
            </span>
          </p>
        )
      })}
    </div>
  )
}

/** A pill that floats beside the hero preview and shifts with the cursor (wide screens only). */
function FloatingChip({
  className,
  depth,
  delay,
  float = 'animate-float',
  children,
}: {
  className: string
  depth: number
  delay: number
  float?: string
  children: ReactNode
}) {
  return (
    <div
      aria-hidden="true"
      style={{ translate: `calc(var(--px, 0) * ${depth}px) calc(var(--py, 0) * ${depth * 0.7}px)` }}
      className={cn('pointer-events-none absolute z-10 hidden transition-[translate] duration-500 ease-out xl:block', className)}
    >
      <div style={{ animationDelay: `${delay}ms` }} className="animate-icon-pop">
        <div className={float}>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs font-medium text-slate-200 shadow-2xl shadow-black/50 backdrop-blur">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- page */

export default function Landing() {
  const heroRef = usePointerFx<HTMLElement>()
  const heroBgRef = useScrollProgress<HTMLDivElement>(parallaxHero)
  const previewScrollRef = useScrollProgress<HTMLDivElement>(tiltPreview)
  const previewTiltRef = usePointerFx<HTMLDivElement>(3)
  const usualRef = usePointerFx<HTMLDivElement>(4)
  const betterRef = usePointerFx<HTMLDivElement>(4)
  const postDriftRef = useScrollProgress<HTMLDivElement>(driftPost)
  const postTiltRef = usePointerFx<HTMLDivElement>(5)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <CursorGlow />

      {/* ---------------- Navbar ---------------- */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link to="/" className="group flex min-w-0 items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.45)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(99,102,241,0.75)]">
              <PlaceTrackIcon size={18} className="fx-logo text-white" />
            </div>
            <span className="truncate text-base font-semibold tracking-tight text-white">PlaceTrack</span>
          </Link>

          <nav aria-label="Page sections" className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#features" className={NAV_LINK}>
              Features
            </a>
            <a href="#community" className={NAV_LINK}>
              Experiences
            </a>
            <a href="#problem" className={NAV_LINK}>
              Why PlaceTrack
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/login"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Sign in
            </Link>
            <Link to="/signup" className={cn(PRIMARY_LINK, 'group h-9 whitespace-nowrap px-3.5 text-sm')}>
              Get started
              <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <ScrollProgress />
      </header>

      <main>
        {/* ---------------- Hero ---------------- */}
        <section ref={heroRef} className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
          {/*
           * Background, back to front: a faint dot grid, a brighter grid that only shows around the cursor,
           * drifting glows (gradients, not blur filters, so they stay cheap) that parallax on scroll,
           * and an interactive constellation.
           */}
          <div ref={heroBgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:28px_28px]"
              style={{
                maskImage: 'radial-gradient(70% 55% at 50% 30%, black, transparent)',
                WebkitMaskImage: 'radial-gradient(70% 55% at 50% 30%, black, transparent)',
              }}
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(rgba(165,180,252,0.55)_1px,transparent_1px)] [background-size:28px_28px]"
              style={{
                maskImage: 'radial-gradient(220px circle at var(--mx, -999px) var(--my, -999px), black, transparent)',
                WebkitMaskImage: 'radial-gradient(220px circle at var(--mx, -999px) var(--my, -999px), black, transparent)',
              }}
            />
            <div style={{ translate: '0 calc(var(--sy, 0) * 0.35px)' }} className="absolute inset-0">
              <div className="animate-aurora absolute -top-56 left-1/2 h-[560px] w-[960px] -ml-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(79,70,229,0.34),transparent)]" />
            </div>
            <div style={{ translate: '0 calc(var(--sy, 0) * 0.2px)' }} className="absolute inset-0">
              <div className="animate-aurora-slow absolute top-24 left-[8%] h-[380px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(14,165,233,0.14),transparent)]" />
            </div>
            <div style={{ translate: '0 calc(var(--sy, 0) * 0.5px)' }} className="absolute inset-0">
              <div className="animate-aurora absolute top-40 right-[6%] h-[340px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.13),transparent)]" />
            </div>
            <ParticleField className="[mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-8">
            <div className="animate-slide-up fx-beam inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-slate-300">
              <Sparkles size={14} className="shrink-0 animate-pulse text-indigo-400" aria-hidden="true" />
              <span>New: AI fills in forms from placement notices</span>
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl">
              <SplitWords text="Placement season deserves better than a" delay={150} step={80} />{' '}
              <span style={{ animationDelay: '700ms' }} className="animate-land">
                <span className="animate-flow bg-[linear-gradient(90deg,#818cf8,#38bdf8,#e879f9,#818cf8)] bg-clip-text text-transparent [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                  messy Google Sheet.
                </span>
              </span>
            </h1>

            <p
              style={{ animationDelay: '800ms' }}
              className="animate-slide-up mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg"
            >
              Turn WhatsApp forwards, portal notices and overlapping interview rounds into one organised pipeline.
              Paste a notice and AI fills in the details, then track every round through to the offer.
            </p>

            <div
              style={{ animationDelay: '950ms' }}
              className="animate-slide-up mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            >
              <MagneticLink to="/signup" className="h-11 px-6 text-sm shadow-[0_0_32px_rgba(99,102,241,0.45)] hover:shadow-[0_0_44px_rgba(99,102,241,0.7)]">
                Start tracking for free
                <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
              </MagneticLink>
              <Link to="/login" className={cn(SECONDARY_LINK, 'h-11 px-6 text-sm')}>
                Sign in
              </Link>
            </div>

            {/* ---------------- Product preview (animated) ---------------- */}
            <div style={{ animationDelay: '900ms' }} className="animate-slide-up relative mx-auto mt-16 max-w-5xl">
              {/* A slowly turning halo of colour behind the preview. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div
                  className="animate-spin-slow absolute left-1/2 top-1/2 h-[1100px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.38),rgba(56,189,248,0.22),transparent_45%,rgba(232,121,249,0.28),rgba(99,102,241,0.3),transparent)] opacity-60"
                  style={{
                    maskImage: 'radial-gradient(closest-side, black 20%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(closest-side, black 20%, transparent 70%)',
                  }}
                />
              </div>

              <div ref={previewScrollRef} className="will-change-transform">
                <div ref={previewTiltRef} className={cn('fx-beam fx-beam-slow rounded-2xl', TILT_EASE)}>
                  <HeroPreview />
                </div>
              </div>

              <FloatingChip className="-left-24 top-24" depth={-28} delay={2200}>
                <TriangleAlert size={14} className="text-rose-400" />
                Clash flagged · Fri 10:00
              </FloatingChip>
              <FloatingChip className="-right-20 top-[45%]" depth={36} delay={2500} float="animate-float-slow">
                <PartyPopper size={14} className="text-emerald-400" />
                Offer accepted · Microsoft
              </FloatingChip>
              <FloatingChip className="-left-16 bottom-14" depth={22} delay={2800} float="animate-float-slow">
                <CalendarPlus size={14} className="text-sky-400" />
                Added to Google Calendar
              </FloatingChip>
            </div>
          </div>
        </section>

        {/* ---------------- The problem vs the solution ---------------- */}
        <section id="problem" className="relative scroll-mt-16 border-t border-slate-900 py-20 sm:py-24">
          <SectionComet />
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>The reality of placement season</Eyebrow>
              <RevealHeading
                text="Why spreadsheets fall apart under pressure"
                className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              />
              <p className="mt-3 text-pretty text-base text-slate-400">
                With dozens of companies testing and interviewing at once, scattered notes lead to missed deadlines and
                double-booked rounds.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Reveal from="left">
                <div
                  ref={usualRef}
                  style={{ '--spot': '244, 63, 94' } as CSSProperties}
                  className={cn('fx-spotlight h-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8', TILT_EASE)}
                >
                  <p className="text-sm font-medium text-slate-400">The usual way</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Spreadsheets and WhatsApp forwards</h3>
                  <StaggerList
                    from="left"
                    className="mt-5 space-y-3 text-sm text-slate-400"
                    icon={<X size={16} className="text-rose-400" aria-hidden="true" />}
                    items={[
                      'Hours spent copying company names, eligibility and CTCs out of forwarded messages.',
                      'Interview slots double-booked with no warning.',
                      'No record of the questions you struggled with in earlier rounds.',
                      'Losing track of which resume version went to which company.',
                      'No easy way to see what seniors were actually asked.',
                    ]}
                  />
                </div>
              </Reveal>

              <Reveal from="right" delay={120}>
                <div
                  ref={betterRef}
                  className={cn('fx-beam h-full rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 shadow-[0_0_60px_-15px_rgba(99,102,241,0.35)] sm:p-8', TILT_EASE)}
                >
                  <p className="text-sm font-medium text-indigo-300">With PlaceTrack</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">One organised placement pipeline</h3>
                  <StaggerList
                    from="right"
                    className="mt-5 space-y-3 text-sm text-slate-300"
                    icon={<Check size={16} className="text-emerald-400" aria-hidden="true" />}
                    items={[
                      'Paste a WhatsApp or Superset notice and AI fills in the details.',
                      'Overlapping rounds are flagged automatically.',
                      'A journal after each round builds your own question bank.',
                      'Add any round to Google Calendar or download an .ics file.',
                      'Read real interview experiences shared by your peers.',
                    ]}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="relative scroll-mt-16 border-t border-slate-900 py-20 sm:py-24">
          <SectionComet delay={2300} />
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>Built for students</Eyebrow>
              <RevealHeading
                text="Everything you need for placement season"
                className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              />
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* Featured: AI auto-fill */}
              <Reveal from="zoom" className="md:col-span-2 lg:col-span-3">
                <div className="fx-beam fx-beam-slow rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
                  <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                        <Sparkles size={14} className="animate-pulse text-indigo-400" aria-hidden="true" />
                        AI auto-fill
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white sm:text-2xl">Add applications without retyping them</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">
                        Got a placement announcement on WhatsApp or an interview invite by email? Paste it into{' '}
                        <span className="font-medium text-slate-200">Add company</span> or{' '}
                        <span className="font-medium text-slate-200">Schedule round</span>. AI pulls out the company,
                        role, CTC, Superset link, round type, time and meeting link for you to review.
                      </p>
                    </div>
                    <ExtractedFields />
                  </div>
                </div>
              </Reveal>

              <FeatureCard icon={<KanbanSquare size={20} />} title="Kanban pipeline" delay={0}>
                Move applications from Applied to OA, Technical, HR and Offer. Track Superset registration on every card.
              </FeatureCard>
              <FeatureCard icon={<CalendarClock size={20} />} title="Clash detection and calendar" delay={100}>
                Overlapping tests and interviews are flagged straight away. Add any round to Google Calendar, Apple
                Calendar or Outlook.
              </FeatureCard>
              <FeatureCard icon={<NotebookPen size={20} />} title="Interview journal" delay={200}>
                A quick note after each round: questions asked, topics covered and what to fix. It becomes a searchable
                question bank.
              </FeatureCard>
              <FeatureCard icon={<Users size={20} />} title="Peer experiences" delay={0}>
                Read real interview questions, tips and round breakdowns shared by peers, with the option to post
                anonymously.
              </FeatureCard>
              <FeatureCard icon={<Zap size={20} />} title="Quick updates with undo" delay={100}>
                Mark a round cleared or not cleared straight from its card, with an undo in case you tap the wrong one.
              </FeatureCard>
              <FeatureCard icon={<ShieldCheck size={20} />} title="Private by default" delay={200}>
                Your pipeline, CTC notes and journal are tied to your account and visible only to you.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* ---------------- Peer experiences ---------------- */}
        <section id="community" className="relative scroll-mt-16 border-t border-slate-900 py-20 sm:py-24">
          <SectionComet delay={4600} />
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <Eyebrow>Peer experiences</Eyebrow>
              <RevealHeading
                text="Learn from real interviews before your turn comes"
                className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              />
              <p className="mt-3 text-pretty text-base leading-relaxed text-slate-400">
                Seniors and batchmates share the exact questions they were asked, how the rounds were structured, and
                what they'd do differently.
              </p>
            </Reveal>

            <div className="mt-12 grid items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                {[
                  {
                    icon: <BookOpen size={18} />,
                    title: 'Real questions by company',
                    body: 'Search a company to see the DSA, system design and behavioural questions from recent rounds.',
                  },
                  {
                    icon: <ThumbsUp size={18} />,
                    title: 'The most helpful posts first',
                    body: 'Mark posts as helpful and sort by them, so the best preparation guides rise to the top.',
                  },
                  {
                    icon: <HelpCircle size={18} />,
                    title: 'Share anonymously or by name',
                    body: 'Post candidly without your name, or add your name and batch so juniors can reach out.',
                  },
                ].map((item, i) => (
                  <Reveal key={item.title} from="left" delay={i * 120}>
                    <div className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors duration-300 hover:border-indigo-500/40 hover:bg-slate-900">
                      <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
                        <span
                          className="text-indigo-400 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-125"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        {item.title}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Example post */}
              <Reveal from="right" delay={150} className="lg:col-span-7">
                <figure>
                  <div ref={postDriftRef} className="will-change-transform">
                    <div className="animate-float-slow">
                      <div
                        ref={postTiltRef}
                        className={cn('fx-spotlight space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/30 sm:p-6', TILT_EASE)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-200">
                              G
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-semibold text-white">Google · Software Engineer</h4>
                                <span className="rounded-md bg-emerald-950/60 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                  Selected
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-400">On-campus · ₹52 LPA · Anonymous senior</p>
                            </div>
                          </div>
                          <span className="rounded-md bg-amber-950/60 px-2 py-0.5 text-xs font-medium text-amber-300">
                            Medium
                          </span>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-medium text-slate-200">Rounds</p>
                            <p className="mt-1 leading-relaxed text-slate-400">
                              Round 1 was an OA with two questions: DP on trees and string manipulation. Round 2 was DSA,
                              focused on graph shortest paths. Round 3 covered behavioural and leadership questions.
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-950/60 p-3">
                            <p className="font-medium text-slate-200">Tip</p>
                            <p className="mt-1 leading-relaxed text-slate-400">
                              "Talk through the time complexity trade-offs out loud before you start writing code."
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <ThumbsUp size={14} aria-hidden="true" className="text-indigo-400" />
                            <span>
                              <CountUp to={128} /> found this helpful
                            </span>
                          </span>
                          <span>2026 batch</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <figcaption className="mt-3 text-center text-xs text-slate-500">Example of a shared experience</figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- Closing call to action ---------------- */}
        <section className="relative overflow-hidden border-t border-slate-900 py-20 sm:py-24">
          <SectionComet delay={1200} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 bottom-0 h-[360px] bg-[radial-gradient(50%_70%_at_50%_100%,rgba(79,70,229,0.28),transparent_70%)]" />
            <div className="fx-grid-floor absolute -inset-x-1/2 bottom-0 h-full overflow-hidden">
              <div />
            </div>
            <div className="animate-aurora absolute bottom-[-180px] left-1/2 -ml-[300px] h-[360px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(129,140,248,0.35),transparent)]" />
            <ParticleField density={0.45} className="[mask-image:linear-gradient(to_top,black,transparent)]" />
          </div>
          <Reveal from="zoom" className="relative mx-auto max-w-3xl px-4 text-center sm:px-8">
            <RevealHeading
              text="Take control of your placement season."
              className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl"
            />
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-400">
              It's free. Create an account and add your first company in a couple of minutes.
            </p>
            <MagneticLink to="/signup" className="mt-8 h-11 px-7 text-sm shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:shadow-[0_0_56px_rgba(99,102,241,0.8)]">
              Create a free account
              <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </MagneticLink>
          </Reveal>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative border-t border-slate-900 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-slate-400 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
              <PlaceTrackIcon size={13} />
            </div>
            <span className="font-medium text-slate-200">PlaceTrack</span>
            <span className="text-slate-500">· Placement tracker</span>
          </div>
          <p className="text-slate-500">© {new Date().getFullYear()} PlaceTrack</p>
        </div>
      </footer>
    </div>
  )
}
