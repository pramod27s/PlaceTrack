import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Check,
  HelpCircle,
  KanbanSquare,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { PlaceTrackIcon } from '../components/PlaceTrackLogo'
import { HeroPreview } from '../components/landing/HeroPreview'
import { Reveal } from '../components/landing/Reveal'
import { useInView } from '../hooks/useInView'
import { cn } from '../lib/format'

/* ------------------------------------------------------------------ helpers */

const PRIMARY_LINK =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
const SECONDARY_LINK =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

/** Small label above a section heading. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-indigo-400">{children}</p>
}

/** A feature tile in the "Everything you need" grid. Fades in on scroll; lifts and lights up on hover. */
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
  return (
    <Reveal delay={delay}>
      <div className="group h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-slate-900 sm:p-7">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-200 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white"
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

/** The "AI pulled these out of the notice" box; fields tick in one by one when it scrolls into view. */
function ExtractedFields() {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className="w-full shrink-0 space-y-1.5 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 lg:w-auto lg:min-w-[300px]"
    >
      <p className="flex items-center gap-2 text-slate-500">
        Extracted from the notice
        {!inView && <span className="animate-caret inline-block h-3.5 w-px bg-slate-500" aria-hidden="true" />}
      </p>
      {EXTRACTED.map(([k, v], i) => (
        <p
          key={k}
          style={inView ? { animationDelay: `${200 + i * 180}ms` } : undefined}
          className={cn('flex gap-2', inView ? 'animate-pop opacity-0' : 'opacity-0')}
        >
          <Check size={14} className="shrink-0 text-emerald-400" aria-hidden="true" />
          <span className="text-slate-500">{k}:</span>
          <span className="truncate text-slate-200">{v}</span>
        </p>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------- page */

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* ---------------- Navbar ---------------- */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
              <PlaceTrackIcon size={18} className="text-white" />
            </div>
            <span className="truncate text-base font-semibold tracking-tight text-white">PlaceTrack</span>
          </Link>

          <nav aria-label="Page sections" className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#community" className="transition-colors hover:text-white">
              Experiences
            </a>
            <a href="#problem" className="transition-colors hover:text-white">
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
            <Link to="/signup" className={cn(PRIMARY_LINK, 'h-9 whitespace-nowrap px-3.5 text-sm')}>
              Get started
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
          {/* Background: a faint dot grid plus two slowly drifting glows (gradients, not blur filters, so they stay cheap). */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:28px_28px]"
              style={{
                maskImage: 'radial-gradient(70% 55% at 50% 30%, black, transparent)',
                WebkitMaskImage: 'radial-gradient(70% 55% at 50% 30%, black, transparent)',
              }}
            />
            <div className="animate-aurora absolute -top-56 left-1/2 h-[560px] w-[960px] -ml-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(79,70,229,0.30),transparent)]" />
            <div className="animate-aurora-slow absolute top-24 left-[8%] h-[380px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(14,165,233,0.12),transparent)]" />
            <div className="animate-aurora absolute top-40 right-[6%] h-[340px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.10),transparent)]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-8">
            <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-slate-300">
              <Sparkles size={14} className="shrink-0 text-indigo-400" aria-hidden="true" />
              <span>New: AI fills in forms from placement notices</span>
            </div>

            <h1 className="animate-slide-up-delay-1 mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl">
              Placement season deserves better than a <span className="text-indigo-400">messy Google Sheet.</span>
            </h1>

            <p className="animate-slide-up-delay-2 mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              Turn WhatsApp forwards, portal notices and overlapping interview rounds into one organised pipeline.
              Paste a notice and AI fills in the details, then track every round through to the offer.
            </p>

            <div className="animate-slide-up-delay-3 mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link to="/signup" className={cn(PRIMARY_LINK, 'group h-11 px-6 text-sm')}>
                Start tracking for free
                <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/login" className={cn(SECONDARY_LINK, 'h-11 px-6 text-sm')}>
                Sign in
              </Link>
            </div>

            {/* ---------------- Product preview (animated) ---------------- */}
            <div className="animate-slide-up-delay-3 relative mx-auto mt-16 max-w-5xl">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* ---------------- The problem vs the solution ---------------- */}
        <section id="problem" className="scroll-mt-16 border-t border-slate-900 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>The reality of placement season</Eyebrow>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Why spreadsheets fall apart under pressure
              </h2>
              <p className="mt-3 text-pretty text-base text-slate-400">
                With dozens of companies testing and interviewing at once, scattered notes lead to missed deadlines and
                double-booked rounds.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Reveal className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
                <p className="text-sm font-medium text-slate-400">The usual way</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Spreadsheets and WhatsApp forwards</h3>
                <ul className="mt-5 space-y-3 text-sm text-slate-400">
                  {[
                    'Hours spent copying company names, eligibility and CTCs out of forwarded messages.',
                    'Interview slots double-booked with no warning.',
                    'No record of the questions you struggled with in earlier rounds.',
                    'Losing track of which resume version went to which company.',
                    'No easy way to see what seniors were actually asked.',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <X size={16} className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120} className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 sm:p-8">
                <p className="text-sm font-medium text-indigo-300">With PlaceTrack</p>
                <h3 className="mt-1 text-xl font-semibold text-white">One organised placement pipeline</h3>
                <ul className="mt-5 space-y-3 text-sm text-slate-300">
                  {[
                    'Paste a WhatsApp or Superset notice and AI fills in the details.',
                    'Overlapping rounds are flagged automatically.',
                    'A journal after each round builds your own question bank.',
                    'Add any round to Google Calendar or download an .ics file.',
                    'Read real interview experiences shared by your peers.',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="scroll-mt-16 border-t border-slate-900 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>Built for students</Eyebrow>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Everything you need for placement season
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* Featured: AI auto-fill */}
              <Reveal className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 md:col-span-2 lg:col-span-3">
                <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                      <Sparkles size={14} className="text-indigo-400" aria-hidden="true" />
                      AI auto-fill
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white sm:text-2xl">Add applications without retyping them</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      Got a placement announcement on WhatsApp or an interview invite by email? Paste it into{' '}
                      <span className="font-medium text-slate-200">Add company</span> or{' '}
                      <span className="font-medium text-slate-200">Schedule round</span>. AI pulls out the company, role,
                      CTC, Superset link, round type, time and meeting link for you to review.
                    </p>
                  </div>
                  <ExtractedFields />
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
        <section id="community" className="scroll-mt-16 border-t border-slate-900 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <Eyebrow>Peer experiences</Eyebrow>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Learn from real interviews before your turn comes
              </h2>
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
                  <Reveal key={item.title} delay={i * 100} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
                      <span className="text-indigo-400" aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.title}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.body}</p>
                  </Reveal>
                ))}
              </div>

              {/* Example post */}
              <Reveal delay={150} className="lg:col-span-7">
              <figure>
                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/30 sm:p-6">
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
                    <span className="rounded-md bg-amber-950/60 px-2 py-0.5 text-xs font-medium text-amber-300">Medium</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-200">Rounds</p>
                      <p className="mt-1 leading-relaxed text-slate-400">
                        Round 1 was an OA with two questions: DP on trees and string manipulation. Round 2 was DSA, focused
                        on graph shortest paths. Round 3 covered behavioural and leadership questions.
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
                      <ThumbsUp size={14} aria-hidden="true" />
                      Helpful
                    </span>
                    <span>2026 batch</span>
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
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[360px] bg-[radial-gradient(50%_70%_at_50%_100%,rgba(79,70,229,0.18),transparent_70%)]"
          />
          <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-8">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Take control of your placement season.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-400">
              It's free. Create an account and add your first company in a couple of minutes.
            </p>
            <Link to="/signup" className={cn(PRIMARY_LINK, 'group mt-8 h-11 px-7 text-sm')}>
              Create a free account
              <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-slate-900 py-10">
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
