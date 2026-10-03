import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  CheckCircle2,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Sparkles,
  Users,
} from 'lucide-react'
import { apiError } from '../lib/api'
import { useAllJournal, useDeleteJournal } from '../hooks/queries'
import { JournalModal } from '../components/JournalModal'
import { ExperienceModal } from '../components/ExperienceModal'
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
  ListSkeleton,
} from '../components/ui'
import { ROUND_TYPE_META } from '../lib/constants'
import { cn, formatDate } from '../lib/format'
import type { ExperienceInput, JournalEntry } from '../lib/types'


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
    <span className="flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          aria-hidden="true"
          className={cn(n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700')}
        />
      ))}
    </span>
  )
}

function Section({ label, value }: { label: string; value: string | null }) {
  if (!value || !value.trim()) return null
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  )
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
  onShare,
}: {
  entry: JournalEntry
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
}) {
  const hasContent =
    entry.questionsAsked ||
    entry.topics ||
    entry.whatWentWell ||
    entry.whatFlopped ||
    entry.resources

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {entry.title?.trim() || (
              <span className="font-normal italic text-slate-500 dark:text-slate-400">Untitled entry</span>
            )}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
            Logged {formatDate(entry.createdAt)}
            {entry.updatedAt !== entry.createdAt && (
              <> · edited {formatDate(entry.updatedAt)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Rating value={entry.rating} />
          {entry.isShared ? (
            <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={12} aria-hidden="true" />
              Shared
            </Badge>
          ) : (
            <Button variant="secondary" size="sm" onClick={onShare}>
              <Sparkles size={12} aria-hidden="true" />
              Share
            </Button>
          )}
          <IconButton title="Edit entry" onClick={onEdit}>
            <Pencil size={14} />
          </IconButton>
          <IconButton
            title="Delete entry"
            onClick={onDelete}
            className="hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>

      </div>

      {hasContent && (
        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          <Section label="Questions asked" value={entry.questionsAsked} />
          <Section label="Topics covered" value={entry.topics} />
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
  onShareEntry,
  onShareGroup,
}: {
  group: RoundGroup
  onAddEntry: (round: JournalRoundContext) => void
  onEditEntry: (entry: JournalEntry) => void
  onDeleteEntry: (entry: JournalEntry) => void
  onShareEntry: (entry: JournalEntry) => void
  onShareGroup: (group: RoundGroup) => void
}) {
  const type = ROUND_TYPE_META[group.round.type]
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/companies/${group.entries[0].companyId}`}
              className="text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {group.round.companyName}
            </Link>
            <Badge className={type.badge}>{type.label}</Badge>
          </div>
          <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {formatDate(group.round.scheduledAt)} ·{' '}
            {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onShareGroup(group)}>
            <Sparkles size={13} aria-hidden="true" />
            Share experience
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onAddEntry(group.round)}>
            <Plus size={14} aria-hidden="true" />
            Add note
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {group.entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={() => onEditEntry(entry)}
            onDelete={() => onDeleteEntry(entry)}
            onShare={() => onShareEntry(entry)}
          />
        ))}
      </div>
    </Card>
  )
}


function JournalStarter() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="grid lg:grid-cols-[1fr_22rem]">
        <div className="p-6 sm:p-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <NotebookPen size={20} aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Start your interview journal</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            After each round, note the questions you were asked, the topics covered, and what went well or didn't.
            Over time this becomes your own searchable question bank.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Questions asked', 'Topics covered', 'Lessons to revisit'].map((label) => (
              <li
                key={label}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-3 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/40 sm:p-8 lg:border-l lg:border-t-0">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Get started</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Open any round and use the journal button to add your first note.
            </p>
          </div>
          <Link
            to="/rounds"
            className="mt-6 inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <CalendarClock size={15} aria-hidden="true" />
            Browse rounds
          </Link>
        </div>
      </div>
    </div>
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
  for (const group of byRound.values()) {
    group.entries.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
  }
  return Array.from(byRound.values()).sort(
    (a, b) => +new Date(b.latestUpdatedAt) - +new Date(a.latestUpdatedAt),
  )
}

export default function Journal() {
  const { data: entries, isLoading, isError, refetch } = useAllJournal()
  const deleteJournal = useDeleteJournal()
  const [query, setQuery] = useState('')
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null)
  const [addRound, setAddRound] = useState<JournalRoundContext | null>(null)
  const [pendingDelete, setPendingDelete] = useState<JournalEntry | null>(null)
  const [shareExperienceData, setShareExperienceData] = useState<Partial<ExperienceInput> | null>(null)
  const [error, setError] = useState('')

  const handleShareEntry = (entry: JournalEntry) => {
    setShareExperienceData({
      companyName: entry.companyName,
      role: 'Software Engineer',
      verdict: 'IN_PROGRESS',
      title: `${entry.companyName} — ${entry.roundType || 'Interview'} Round Experience`,
      summary: `Questions and reflection from the ${entry.roundType || 'recent'} round (Drive is currently in progress).`,
      questionsAsked: entry.questionsAsked ?? '',
      topics: entry.topics ?? '',
      roundsDetails: `• ${entry.roundType || 'Round'}: ${entry.title || 'Discussion'}\n- What went well: ${entry.whatWentWell || 'N/A'}\n- What flopped: ${entry.whatFlopped || 'N/A'}`,
      tips: entry.resources ? `Resources: ${entry.resources}` : (entry.whatWentWell ? `Focus on: ${entry.whatWentWell}` : ''),
      anonymous: true,
      journalEntryId: entry.id,
    })
  }



  const handleShareGroup = (group: RoundGroup) => {
    const combinedQuestions = group.entries
      .map((e) => e.questionsAsked)
      .filter(Boolean)
      .join('\n')
    const combinedTopics = Array.from(
      new Set(
        group.entries
          .map((e) => e.topics)
          .filter(Boolean)
          .join(',')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ).join(', ')

    const roundsText = group.entries
      .map(
        (e, idx) =>
          `Round ${idx + 1} (${group.round.type}): ${e.title || 'Discussion'}\n- What went well: ${e.whatWentWell || 'N/A'}\n- What flopped: ${e.whatFlopped || 'N/A'}`,
      )
      .join('\n\n')

    setShareExperienceData({
      companyName: group.round.companyName,
      role: 'Software Engineer',
      title: `${group.round.companyName} Interview Experience`,
      questionsAsked: combinedQuestions,
      topics: combinedTopics,
      roundsDetails: roundsText,
      anonymous: true,
    })
  }

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

  if (isLoading) return <ListSkeleton rows={3} label="Loading journal" />
  if (isError || !entries) {
    return <ErrorNote message="Couldn't load your journal." onRetry={() => refetch()} />
  }

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Interview journal</h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
              {entries.length}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Your questions, reflections and lessons from every round.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          {entries.length > 0 && (
            <div className="relative flex-1 sm:w-72">
              <Search
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
              />
              <Input
                className="pl-9"
                placeholder="Search questions, topics, companies…"
                aria-label="Search journal"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}

          <Link
            to="/experiences"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Users size={14} aria-hidden="true" />
            Experiences
          </Link>
        </div>
      </div>


      {error && <ErrorNote message={error} />}

      {entries.length === 0 ? (
        <JournalStarter />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No matching notes"
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
              onShareEntry={handleShareEntry}
              onShareGroup={handleShareGroup}
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
      {shareExperienceData && (
        <ExperienceModal
          initialData={shareExperienceData}
          onClose={() => setShareExperienceData(null)}
        />
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteJournal.isPending}
        title="Delete this entry?"
        message={
          pendingDelete
            ? `Delete the note for "${pendingDelete.companyName}" (${formatDate(pendingDelete.roundScheduledAt)})?`
            : ''
        }
      />
    </div>
  )
}
