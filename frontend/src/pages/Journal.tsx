import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, NotebookPen, Search, Star } from 'lucide-react'
import { useAllJournal } from '../hooks/queries'
import { Badge, Card, EmptyState, ErrorNote, Input, LoadingState } from '../components/ui'
import { ROUND_TYPE_META } from '../lib/constants'
import { cn, formatDate } from '../lib/format'
import type { JournalEntry } from '../lib/types'

function Rating({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={cn(n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200')}
        />
      ))}
    </span>
  )
}

function Section({ label, value }: { label: string; value: string | null }) {
  if (!value || !value.trim()) return null
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{value}</p>
    </div>
  )
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  const type = ROUND_TYPE_META[entry.roundType]
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            to={`/companies/${entry.companyId}`}
            className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
          >
            {entry.companyName}
          </Link>
          <Badge className={type.badge}>{type.label}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Rating value={entry.rating} />
          <span className="text-xs text-slate-400">{formatDate(entry.roundScheduledAt)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Section label="Questions asked" value={entry.questionsAsked} />
        <Section label="Topics" value={entry.topics} />
        <Section label="What went well" value={entry.whatWentWell} />
        <Section label="What flopped" value={entry.whatFlopped} />
        <Section label="Resources to revisit" value={entry.resources} />
      </div>
    </Card>
  )
}

function JournalStarter() {
  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_22rem]">
        <div className="p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <NotebookPen size={24} />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-slate-900">No journal entries yet</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            After each round, save the questions, topics, and your own reflection here. The page
            turns into a searchable prep archive as soon as you add your first entry.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Questions asked', 'Topics covered', 'Lessons to revisit'].map((label) => (
              <div
                key={label}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Capture
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between bg-slate-950 p-6 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Next step
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Open a completed or upcoming round and add the first journal note from its action
              menu.
            </p>
          </div>
          <Link
            to="/rounds"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <CalendarClock size={16} />
            Open rounds
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default function Journal() {
  const { data: entries, isLoading, isError } = useAllJournal()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries ?? []
    return (entries ?? []).filter((e) =>
      [e.companyName, e.topics, e.questionsAsked, e.whatWentWell, e.whatFlopped, e.resources]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    )
  }, [entries, query])

  if (isLoading) return <LoadingState label="Loading your journal…" />
  if (isError || !entries) return <ErrorNote message="Couldn't load your journal. Please retry." />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Interview journal</h2>
          <p className="text-sm text-slate-500">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} — your personal
            interview-prep dataset.
          </p>
        </div>
        {entries.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="pl-9"
              placeholder="Search questions, topics, companies…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <JournalStarter />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No matches"
          description={`Nothing in your journal matches “${query}”.`}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
