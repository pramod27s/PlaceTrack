import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CircleCheckBig,
  ExternalLink,
  FileText,
  IndianRupee,
  MapPin,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import {
  useCompany,
  useCompanyRounds,
  useDeleteCompany,
  useDeleteRound,
} from '../hooks/queries'
import { CompanyModal } from '../components/CompanyModal'
import { RoundModal } from '../components/RoundModal'
import { JournalModal } from '../components/JournalModal'
import { RoundListItem } from '../components/RoundListItem'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  LoadingState,
} from '../components/ui'
import { STAGE_META } from '../lib/constants'
import { cn, formatDate } from '../lib/format'
import type { Round } from '../lib/types'

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="text-sm text-slate-700">{children}</div>
      </div>
    </div>
  )
}

export default function CompanyDetail() {
  const { id } = useParams()
  const companyId = Number(id)
  const navigate = useNavigate()

  const company = useCompany(companyId)
  const rounds = useCompanyRounds(companyId)
  const deleteCompany = useDeleteCompany()
  const deleteRound = useDeleteRound()

  const [editOpen, setEditOpen] = useState(false)
  const [addRoundOpen, setAddRoundOpen] = useState(false)
  const [editRound, setEditRound] = useState<Round | null>(null)
  const [journalRound, setJournalRound] = useState<Round | null>(null)
  const [pendingRound, setPendingRound] = useState<Round | null>(null)
  const [confirmCompany, setConfirmCompany] = useState(false)

  if (company.isLoading) return <LoadingState label="Loading company…" />
  if (company.isError || !company.data) {
    return (
      <EmptyState
        icon={<TriangleAlert size={22} />}
        title="Company not found"
        description="This company may have been deleted, or the link is incorrect."
        action={
          <Button onClick={() => navigate('/pipeline')}>Back to pipeline</Button>
        }
      />
    )
  }

  const c = company.data
  const stage = STAGE_META[c.stage]
  const roundList = rounds.data ?? []

  const handleDeleteCompany = async () => {
    await deleteCompany.mutateAsync(c.id)
    navigate('/pipeline', { replace: true })
  }

  const handleDeleteRound = async () => {
    if (!pendingRound) return
    await deleteRound.mutateAsync(pendingRound.id)
    setPendingRound(null)
  }

  return (
    <div className="space-y-6">
      <Link
        to="/pipeline"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Pipeline
      </Link>

      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{c.name}</h2>
              <Badge className={stage.badge}>{stage.label}</Badge>
            </div>
            {c.role && <p className="mt-1 text-sm text-slate-500">{c.role}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil size={15} />
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmCompany(true)}
              className="text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={15} />
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={<IndianRupee size={16} />} label="CTC">
            {c.ctc || '—'}
          </InfoRow>
          <InfoRow icon={<MapPin size={16} />} label="Location">
            {c.location || '—'}
          </InfoRow>
          <InfoRow icon={<CalendarDays size={16} />} label="Applied on">
            {formatDate(c.appliedOn)}
          </InfoRow>
          <InfoRow icon={<FileText size={16} />} label="Resume used">
            {c.resumeVersion || '—'}
          </InfoRow>
          <InfoRow icon={<Briefcase size={16} />} label="Job description">
            {c.jdLink ? (
              <a
                href={c.jdLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
              >
                View JD <ExternalLink size={13} />
              </a>
            ) : (
              '—'
            )}
          </InfoRow>
          <InfoRow icon={<CircleCheckBig size={16} />} label="Superset">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                c.registeredOnSuperset
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700',
              )}
            >
              {c.registeredOnSuperset ? 'Registered' : 'Not registered'}
            </span>
          </InfoRow>
        </div>
      </Card>

      {/* Research notes */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Research notes</h3>
        <Card className="p-5">
          {c.researchNotes?.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {c.researchNotes}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              No notes yet — use “Edit” to capture culture, tech stack, interviewer names, and
              why you want to work here.
            </p>
          )}
        </Card>
      </div>

      {/* Rounds */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Rounds{' '}
            <span className="font-normal text-slate-400">({roundList.length})</span>
          </h3>
          <Button size="sm" onClick={() => setAddRoundOpen(true)}>
            <Plus size={15} />
            Add round
          </Button>
        </div>

        {rounds.isLoading ? (
          <LoadingState label="Loading rounds…" />
        ) : roundList.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="No rounds yet"
            description="Schedule the first round for this company — an OA, interview, or PPT."
            action={
              <Button onClick={() => setAddRoundOpen(true)}>
                <Plus size={16} />
                Add round
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {roundList.map((round) => (
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
                      onClick={() => setPendingRound(round)}
                      className="hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CompanyModal open={editOpen} onClose={() => setEditOpen(false)} company={c} />
      <RoundModal
        open={addRoundOpen}
        onClose={() => setAddRoundOpen(false)}
        companyId={c.id}
      />
      {editRound && (
        <RoundModal open onClose={() => setEditRound(null)} round={editRound} />
      )}
      {journalRound && (
        <JournalModal round={journalRound} onClose={() => setJournalRound(null)} />
      )}
      <ConfirmDialog
        open={pendingRound !== null}
        onClose={() => setPendingRound(null)}
        onConfirm={handleDeleteRound}
        loading={deleteRound.isPending}
        title="Delete this round?"
        message="The round and any journal entry attached to it will be permanently removed."
      />
      <ConfirmDialog
        open={confirmCompany}
        onClose={() => setConfirmCompany(false)}
        onConfirm={handleDeleteCompany}
        loading={deleteCompany.isPending}
        title={`Delete ${c.name}?`}
        message="This company, all its rounds, and their journal entries will be permanently removed. This cannot be undone."
      />
    </div>
  )
}
