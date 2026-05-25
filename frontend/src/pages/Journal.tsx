import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { apiError } from '../lib/api'
import { useAllJournal, useDeleteJournal } from '../hooks/queries'
import { JournalModal } from '../components/JournalModal'
import type { JournalRoundContext } from '../components/JournalModal'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorNote,
  IconButton,
  Input,
  LoadingState,
} from '../components/ui'
import { ROUND_TYPE_META } from '../lib/constants'
import { cn, formatDate } from '../lib/format'
import type { JournalEntry } from '../lib/types'

/** All entries that belong to the same round, plus the round context. */
interface RoundGroup {
  round: JournalRoundContext
  entries: JournalEntry[]
  /** Most-recent updatedAt across the group's entries (for sorting groups). */
  latestUpdatedAt: string
}

function Rating({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
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

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const hasContent =
    entry.questionsAsked ||
    entry.topics ||
    entry.whatWentWell ||
    entry.whatFlopped ||
    entry.resources

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            {entry.title?.trim() || (
              <span className="font-medium text-slate-400">Untitled entry</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Logged {formatDate(entry.createdAt)}
            {entry.updatedAt !== entry.createdAt && (
              <> · edited {formatDate(entry.updatedAt)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Rating value={entry.rating} />
          <IconButton title="Edit entry" onClick={onEdit}>
            <Pencil size={14} />
          </IconButton>
          <IconButton
            title="Delete entry"
            onClick={onDelete}
            className="hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>

      {hasContent && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Section label="Questions asked" value={entry.questionsAsked} />
          <Section label="Topics" value={entry.topics} />
          <Section label="What went well" value={entry.whatWentWell} />
          <Section label="What flopped" value={entry.whatFlopped} />
          <Section label="Resources to revisit" value={entry.resources} />
        </div>
      )}
    </div>
  )
}

function RoundGroupCard({
  group,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}: {
  group: RoundGroup
  onAddEntry: (round: JournalRoundContext) => void
  onEditEntry: (entry: JournalEntry) => void
  onDeleteEntry: (entry: JournalEntry) => void
}) {
  const type = ROUND_TYPE_META[group.round.type]
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/companies/${group.entries[0].companyId}`}
              className="text-base font-semibold text-slate-900 hover:text-indigo-600"
            >
              {group.round.companyName}
            </Link>
            <Badge className={type.badge}>{type.label}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatDate(group.round.scheduledAt)} ·{' '}
            {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => onAddEntry(group.round)}>
          <Plus size={14} />
          Add entry
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {group.entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={() => onEditEntry(entry)}
            onDelete={() => onDeleteEntry(entry)}
          />
        ))}
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

/** Build round-keyed groups from a flat list of entries. */
function groupByRound(entries: JournalEntry[]): RoundGroup[] {
  const byRound = new Map<number, RoundGroup>()
  for (const entry of entries) {
    const existing = byRound.get(entry.roundId)
    if (existing) {
      existing.entries.push(entry)
      if (entry.updatedAt > existing.latestUpdatedAt) {
        existing.latestUpdatedAt = entry.updatedAt
      }
    } else {
      byRound.set(entry.roundId, {
        round: {
          id: entry.roundId,
          companyName: entry.companyName,
          type: entry.roundType,
          scheduledAt: entry.roundScheduledAt,
        },
        entries: [entry],
        latestUpdatedAt: entry.updatedAt,
      })
    }
  }
  // Within group: oldest entry first (reads like a reflection trail).
  for (const group of byRound.values()) {
    group.entries.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
  }
  // Across groups: most recently active first.
  return Array.from(byRound.values()).sort(
    (a, b) => +new Date(b.latestUpdatedAt) - +new Date(a.latestUpdatedAt),
  )
}

export default function Journal() {
  const { data: entries, isLoading, isError } = useAllJournal()
  const deleteJournal = useDeleteJournal()
  const [query, setQuery] = useState('')
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null)
  const [addRound, setAddRound] = useState<JournalRoundContext | null>(null)
  const [pendingDelete, setPendingDelete] = useState<JournalEntry | null>(null)
  const [error, setError] = useState('')

  const groups = useMemo(() => {
    if (!entries) return []
    const q = query.trim().toLowerCase()
    const filtered = !q
      ? entries
      : entries.filter((e) =>
          [
            e.companyName,
            e.title,
            e.topics,
            e.questionsAsked,
            e.whatWentWell,
            e.whatFlopped,
            e.resources,
          ]
            .filter(Boolean)
            .some((field) => field!.toLowerCase().includes(q)),
        )
    return groupByRound(filtered)
  }, [entries, query])

  if (isLoading) return <LoadingState label="Loading your journal…" />
  if (isError || !entries) return <ErrorNote message="Couldn't load your journal. Please retry." />

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setError('')
    try {
      await deleteJournal.mutateAsync({
        entryId: pendingDelete.id,
        roundId: pendingDelete.roundId,
      })
      setPendingDelete(null)
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Interview journal</h2>
          <p className="text-sm text-slate-500">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} across{' '}
            {new Set(entries.map((e) => e.roundId)).size} rounds — your personal interview-prep
            dataset.
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

      {error && <ErrorNote message={error} />}

      {entries.length === 0 ? (
        <JournalStarter />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No matches"
          description={`Nothing in your journal matches "${query}".`}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <RoundGroupCard
              key={group.round.id}
              group={group}
              onAddEntry={setAddRound}
              onEditEntry={setEditEntry}
              onDeleteEntry={setPendingDelete}
            />
          ))}
        </div>
      )}

      {editEntry && (
        <JournalModal
          round={{
            id: editEntry.roundId,
            companyName: editEntry.companyName,
            type: editEntry.roundType,
            scheduledAt: editEntry.roundScheduledAt,
          }}
          entry={editEntry}
          onClose={() => setEditEntry(null)}
        />
      )}
      {addRound && (
        <JournalModal round={addRound} onClose={() => setAddRound(null)} />
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteJournal.isPending}
        title="Delete this entry?"
        message={
          pendingDelete
            ? `"${pendingDelete.title?.trim() || 'Untitled entry'}" for ${pendingDelete.companyName} will be permanently removed.`
            : ''
        }
      />
    </div>
  )
}
