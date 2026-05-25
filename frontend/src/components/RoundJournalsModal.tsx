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
  Spinner,
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
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={cn(n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200')}
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
    'No notes yet — open to add details.'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {entry.title?.trim() || 'Untitled entry'}
          </p>
          <p className="text-xs text-slate-400">
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
            className="hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{preview}</p>
    </div>
  )
}

export function RoundJournalsModal({ round, onClose }: RoundJournalsModalProps) {
  const { data: entries, isLoading, isError } = useRoundJournals(round.id)
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
              <Plus size={16} />
              {entries && entries.length > 0 ? 'Add another' : 'Add first entry'}
            </Button>
          </>
        }
      >
        {error && <ErrorNote message={error} />}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : isError ? (
          <ErrorNote message="Couldn't load journal entries. Please retry." />
        ) : !entries || entries.length === 0 ? (
          <EmptyState
            icon={<NotebookPen size={20} />}
            title="No entries yet"
            description="Capture the questions, topics, and your own reflection here. Add multiple entries over time to track how your prep evolves."
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
