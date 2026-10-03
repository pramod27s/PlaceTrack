import { useState } from 'react'
import { NotebookPen, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { apiError } from '../lib/api'
import { useDeleteJournal, useRoundJournals } from '../hooks/queries'
import { ROUND_TYPE_META } from '../lib/constants'
import { cn, formatDateTime } from '../lib/format'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorNote,
  IconButton,
  Modal,
  Skeleton,
} from './ui'
import { JournalModal } from './JournalModal'
import type { JournalEntry, Round } from '../lib/types'

interface RoundJournalsModalProps {
  round: Round
  onClose: () => void
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

function snippet(text: string | null, max = 140): string {
  if (!text) return ''
  const t = text.trim().replace(/\s+/g, ' ')
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function EntryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const preview =
    snippet(entry.questionsAsked) ||
    snippet(entry.topics) ||
    snippet(entry.whatWentWell) ||
    snippet(entry.whatFlopped) ||
    'No notes yet. Edit to add details.'

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {entry.title?.trim() || 'Untitled entry'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Logged {formatDateTime(entry.createdAt)}
            {entry.updatedAt !== entry.createdAt && (
              <> · edited {formatDateTime(entry.updatedAt)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Rating value={entry.rating} />
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
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{preview}</p>
    </div>
  )
}

export function RoundJournalsModal({ round, onClose }: RoundJournalsModalProps) {
  const { data: entries, isLoading, isError, refetch } = useRoundJournals(round.id)
  const deleteJournal = useDeleteJournal()

  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null)
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<JournalEntry | null>(null)
  const [error, setError] = useState('')

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setError('')
    try {
      await deleteJournal.mutateAsync({
        entryId: pendingDelete.id,
        roundId: round.id,
      })
      setPendingDelete(null)
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="lg"
        title="Journal entries"
        description={`${round.companyName} · ${ROUND_TYPE_META[round.type].label} · ${formatDateTime(round.scheduledAt)}`}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="button" onClick={() => setCreating(true)}>
              <Plus size={16} aria-hidden="true" />
              {entries && entries.length > 0 ? 'Add entry' : 'Add first entry'}
            </Button>
          </>
        }
      >
        {error && <ErrorNote message={error} />}

        {isLoading ? (
          <div className="space-y-2.5" aria-busy="true" aria-label="Loading entries">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : isError ? (
          <ErrorNote message="Couldn't load journal entries." onRetry={() => refetch()} />
        ) : !entries || entries.length === 0 ? (
          <EmptyState
            icon={<NotebookPen size={20} />}
            title="No entries yet"
            description="Note the questions, topics and your reflection. You can add more entries over time."
          />
        ) : (
          <div className="space-y-2.5">
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onEdit={() => setEditEntry(entry)}
                onDelete={() => setPendingDelete(entry)}
              />
            ))}
          </div>
        )}
      </Modal>

      {creating && (
        <JournalModal round={round} onClose={() => setCreating(false)} />
      )}
      {editEntry && (
        <JournalModal
          round={round}
          entry={editEntry}
          onClose={() => setEditEntry(null)}
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
            ? `"${pendingDelete.title?.trim() || 'Untitled entry'}" will be permanently removed.`
            : ''
        }
      />
    </>
  )
}
