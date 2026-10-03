import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarClock, NotebookPen, Pencil, Trash2 } from 'lucide-react'
import { useAllRounds, useDeleteRound } from '../hooks/queries'
import { RoundListItem } from '../components/RoundListItem'
import { RoundModal } from '../components/RoundModal'
import { RoundJournalsModal } from '../components/RoundJournalsModal'
import { ConfirmDialog, EmptyState, ErrorNote, IconButton, ListSkeleton } from '../components/ui'
import { cn, isPastIso } from '../lib/format'
import type { Round } from '../lib/types'

type Bucket = 'overdue' | 'upcoming' | 'completed'

const SECTIONS: { key: Bucket; title: string; description: string; badge: string }[] = [
  {
    key: 'overdue',
    title: 'Needs an update',
    description: 'Ended, but still marked as scheduled',
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
  },
  {
    key: 'upcoming',
    title: 'Upcoming',
    description: 'Rounds ahead of you',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
  {
    key: 'completed',
    title: 'Past rounds',
    description: 'Rounds with an outcome',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
]

function bucketOf(round: Round): Bucket {
  if (round.status !== 'SCHEDULED') return 'completed'
  return isPastIso(round.scheduledAt) ? 'overdue' : 'upcoming'
}

export default function Rounds() {
  const { data: rounds, isLoading, isError, refetch } = useAllRounds()
  const deleteRound = useDeleteRound()
  const { hash } = useLocation()

  // Dashboard links point at a section (#overdue, #upcoming, #completed); scroll to it once loaded.
  useEffect(() => {
    if (!hash || !rounds) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, rounds])

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

  if (isLoading) return <ListSkeleton rows={5} label="Loading rounds" />
  if (isError || !rounds) {
    return <ErrorNote message="Couldn't load your rounds." onRetry={() => refetch()} />
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await deleteRound.mutateAsync(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <div className="space-y-7">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">All rounds</h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
              {rounds.length}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Interviews, assessments and talks across every company, with overlaps flagged.
          </p>
        </div>
      </div>

      {rounds.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={22} />}
          title="No rounds yet"
          description="Open a company from your pipeline to add an OA, GD, technical or HR round."
        />
      ) : (
        SECTIONS.map(({ key, title, description, badge }) => {
          const list = grouped[key]
          if (list.length === 0) return null
          return (
            <section key={key} id={key} className="scroll-mt-24 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium tabular-nums', badge)}>
                    {list.length}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
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
                          className={cn(round.hasJournal && 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60')}
                        >
                          <NotebookPen size={16} />
                        </IconButton>
                        <IconButton title="Edit round" onClick={() => setEditRound(round)}>
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          title="Delete round"
                          onClick={() => setPendingDelete(round)}
                          className="hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
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
            ? `The ${pendingDelete.companyName} round and any attached journal entries will be permanently deleted.`
            : ''
        }
      />
    </div>
  )
}
