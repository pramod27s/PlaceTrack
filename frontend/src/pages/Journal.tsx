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
  LoadingState,
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
    <span className="flex items-center gap-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 px-2 py-1 ring-1 ring-amber-200/60 dark:ring-amber-800/60">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={cn(n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700')}
        />
      ))}
    </span>
  )
}

function Section({ label, value }: { label: string; value: string | null }) {
  if (!value || !value.trim()) return null
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-200">{value}</p>
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
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {entry.title?.trim() || (
              <span className="font-semibold text-slate-400 dark:text-slate-500">Untitled entry</span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Logged {formatDate(entry.createdAt)}
            {entry.updatedAt !== entry.createdAt && (
              <> · edited {formatDate(entry.updatedAt)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Rating value={entry.rating} />
          <Button
            variant="secondary"
            size="sm"
            onClick={onShare}
            className="gap-1.5 text-xs font-semibold hover:border-indigo-300 dark:hover:border-indigo-700"
            title="Publish this interview note to Community Vault"
          >
            <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400" />
            <span>Share to Vault</span>
          </Button>
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
    <Card className="p-5 sm:p-6 shadow-sm border-slate-200/80 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/companies/${group.entries[0].companyId}`}
              className="text-base font-extrabold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors tracking-tight"
            >
              {group.round.companyName}
            </Link>
            <Badge className={type.badge}>{type.label}</Badge>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {formatDate(group.round.scheduledAt)} ·{' '}
            {group.entries.length} {group.entries.length === 1 ? 'entry logged' : 'entries logged'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onShareGroup(group)}
            className="gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
          >
            <Sparkles size={13} />
            <span>Share Full Experience</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onAddEntry(group.round)}>
            <Plus size={14} />
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
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="grid lg:grid-cols-[1fr_22rem]">
        <div className="p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/20 dark:ring-indigo-400/30">
            <NotebookPen size={24} />
          </div>
          <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Your Interview Prep Dataset</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
            After every round, record the questions you faced, topics covered, and what went well or flopped.
            This builds a personal interview bank that compounds in value with every company.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Questions Asked', 'Topics & DSA', 'Lessons to Revisit'].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 p-3.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Log
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between bg-gradient-to-br from-slate-950 to-indigo-950 p-6 sm:p-8 text-white border-t lg:border-t-0 lg:border-l border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30">
              <Sparkles size={12} />
              <span>Get Started</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 font-medium">
              Open a scheduled or completed round to add your first reflection note.
            </p>
          </div>
          <Link
            to="/rounds"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:bg-slate-100"
          >
            <CalendarClock size={15} />
            Browse all rounds
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
  const { data: entries, isLoading, isError } = useAllJournal()
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
      title: `${entry.companyName} ${entry.roundType || 'Interview'} Experience`,
      questionsAsked: entry.questionsAsked ?? '',
      topics: entry.topics ?? '',
      roundsDetails: `• ${entry.roundType || 'Round'}: ${entry.title || 'Interview'}\nWhat went well: ${entry.whatWentWell || 'N/A'}\nWhat flopped: ${entry.whatFlopped || 'N/A'}`,
      tips: entry.resources ? `Resources: ${entry.resources}` : (entry.whatWentWell ? `Focus on: ${entry.whatWentWell}` : ''),
      anonymous: true,
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

  if (isLoading) return <LoadingState label="Loading your interview dataset…" />
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Interview Journal</h2>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700/50">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            Searchable prep repository of past questions, reflections, and learnings.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {entries.length > 0 && (
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <Input
                className="pl-9.5"
                placeholder="Search questions, DBMS, DSA, TCS…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}

          <Link to="/experiences" className="shrink-0">
            <Button variant="secondary" size="md" className="gap-1.5 text-xs font-semibold">
              <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Peer Vault ➔</span>
            </Button>
          </Link>
        </div>
      </div>


      {error && <ErrorNote message={error} />}

      {entries.length === 0 ? (
        <JournalStarter />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="No matching journal notes"
          description={`No questions or reflections matched "${query}".`}
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
