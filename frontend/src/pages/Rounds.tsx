import { useMemo, useState } from 'react'
import { CalendarClock, NotebookPen, Pencil, Trash2 } from 'lucide-react'
import { useAllRounds, useDeleteRound } from '../hooks/queries'
import { RoundListItem } from '../components/RoundListItem'
import { RoundModal } from '../components/RoundModal'
import { RoundJournalsModal } from '../components/RoundJournalsModal'
import { ConfirmDialog, EmptyState, ErrorNote, IconButton, LoadingState } from '../components/ui'
import { cn, isPastIso } from '../lib/format'
import type { Round } from '../lib/types'

type Bucket = 'overdue' | 'upcoming' | 'completed'

const SECTIONS: { key: Bucket; title: string; description: string }[] = [
  { key: 'overdue', title: 'Needs an update', description: 'Scheduled rounds whose time has passed' },
  { key: 'upcoming', title: 'Upcoming', description: 'Rounds still ahead of you' },
  { key: 'completed', title: 'Completed', description: 'Rounds you have already been through' },
]

function bucketOf(round: Round): Bucket {
  if (round.status !== 'SCHEDULED') return 'completed'
  return isPastIso(round.scheduledAt) ? 'overdue' : 'upcoming'
}

export default function Rounds() {
  const { data: rounds, isLoading, isError } = useAllRounds()
  const deleteRound = useDeleteRound()

  const [editRound, setEditRound] = useState<Round | null>(null)
  const [journalRound, setJournalRound] = useState<Round | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Round | null>(null)

  const grouped = useMemo(() => {
    const groups: Record<Bucket, Round[]> = { overdue: [], upcoming: [], completed: [] }
    for (const round of rounds ?? []) groups[bucketOf(round)].push(round)
    groups.overdue.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
    groups.upcoming.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
    groups.completed.sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt))
    return groups
  }, [rounds])

  if (isLoading) return <LoadingState label="Loading your rounds…" />
  if (isError || !rounds) return <ErrorNote message="Couldn't load your rounds. Please retry." />

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await deleteRound.mutateAsync(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Rounds &amp; schedule</h2>
        <p className="text-sm text-slate-500">
          Every round across all your companies, with overlap detection.
        </p>
      </div>

      {rounds.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={22} />}
          title="No rounds scheduled"
          description="Open a company from your pipeline and add its first round to see it here."
        />
      ) : (
        SECTIONS.map(({ key, title, description }) => {
          const list = grouped[key]
          if (list.length === 0) return null
          return (
            <section key={key}>
              <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <span className="text-xs text-slate-400">· {description}</span>
              </div>
              <div className="space-y-3">
                {list.map((round) => (
                  <RoundListItem
                    key={round.id}
                    round={round}
                    actions={
                      <>
                        <IconButton
                          title={round.hasJournal ? 'View journal' : 'Add journal'}
                          onClick={() => setJournalRound(round)}
                          className={cn(round.hasJournal && 'text-indigo-600')}
                        >
                          <NotebookPen size={16} />
                        </IconButton>
                        <IconButton title="Edit round" onClick={() => setEditRound(round)}>
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          title="Delete round"
                          onClick={() => setPendingDelete(round)}
                          className="hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </>
                    }
                  />
                ))}
              </div>
            </section>
          )
        })
      )}

      {editRound && (
        <RoundModal open onClose={() => setEditRound(null)} round={editRound} />
      )}
      {journalRound && (
        <RoundJournalsModal
          round={journalRound}
          onClose={() => setJournalRound(null)}
        />
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteRound.isPending}
        title="Delete this round?"
        message={
          pendingDelete
            ? `The ${pendingDelete.companyName} round and any journal entry attached to it will be permanently removed.`
            : ''
        }
      />
    </div>
  )
}
