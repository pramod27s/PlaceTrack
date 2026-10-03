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
  Sparkles,
} from 'lucide-react'
import {
  useCompany,
  useCompanyRounds,
  useDeleteCompany,
  useDeleteRound,
} from '../hooks/queries'
import { CompanyModal } from '../components/CompanyModal'
import { RoundModal } from '../components/RoundModal'
import { RoundJournalsModal } from '../components/RoundJournalsModal'
import { RoundListItem } from '../components/RoundListItem'
import { ExperienceModal } from '../components/ExperienceModal'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  ListSkeleton,
  Skeleton,
} from '../components/ui'
import { STAGE_META } from '../lib/constants'
import { cn, formatDate, initials } from '../lib/format'
import type { ExperienceInput, Round, Verdict } from '../lib/types'


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
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
      <span className="mt-0.5 text-slate-400 dark:text-slate-500" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">{children}</div>
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
  const [shareOpen, setShareOpen] = useState(false)

  if (company.isLoading) return <ListSkeleton rows={2} label="Loading company" />
  if (company.isError || !company.data) {
    return (
      <EmptyState
        icon={<TriangleAlert size={24} />}
        title="Company not found"
        description="This company may have been deleted, or the URL is invalid."
        action={
          <Button onClick={() => navigate('/pipeline')}>Back to pipeline</Button>
        }
      />
    )
  }

  const c = company.data
  const stage = STAGE_META[c.stage]
  const roundList = rounds.data ?? []

  const verdict: Verdict =
    c.stage === 'OFFER'
      ? 'SELECTED'
      : c.stage === 'REJECTED'
        ? 'REJECTED'
        : 'IN_PROGRESS'

  const shareInitialData: Partial<ExperienceInput> = {
    companyName: c.name,
    role: c.role || 'Software Engineer',
    ctc: c.ctc || '',
    location: c.location || '',
    verdict,
    title: `${c.name} ${c.role || 'Interview'} Experience`,
    summary:
      c.stage === 'OFFER'
        ? `Received a full-time offer from ${c.name}. Here is how the process went, round by round.`
        : c.stage === 'REJECTED'
          ? `Interview experience and learnings from ${c.name}.`
          : `Interview notes and questions for ${c.name} (drive in progress).`,
    roundsDetails:
      roundList.length > 0
        ? roundList
            .map(
              (r, i) =>
                `• Round ${i + 1} (${r.type}): ${r.title || r.type} — Status: ${r.status}`,
            )
            .join('\n\n')
        : '',
    tips: c.researchNotes ? `Prep notes: ${c.researchNotes}` : '',

    anonymous: true,
  }

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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to pipeline
      </Link>

      {/* Final-stage prompt to share the experience */}
      {(c.stage === 'OFFER' || c.stage === 'REJECTED') && (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 sm:p-5',
            c.stage === 'OFFER'
              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
          )}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {c.stage === 'OFFER' ? `You got an offer from ${c.name}` : `Share what you learned at ${c.name}`}
            </p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              {c.stage === 'OFFER'
                ? 'Help other students prepare by sharing your rounds, questions and advice.'
                : 'The questions you were asked can help peers prepare for the same drive.'}
            </p>
          </div>
          <Button variant={c.stage === 'OFFER' ? 'primary' : 'secondary'} onClick={() => setShareOpen(true)}>
            <Sparkles size={14} aria-hidden="true" />
            Share your experience
          </Button>
        </div>
      )}

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-base font-semibold text-slate-700 dark:text-slate-200">
              {initials(c.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{c.name}</h2>
                <Badge className={stage.badge}>{stage.label}</Badge>
              </div>
              {c.role && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{c.role}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {c.stage !== 'OFFER' && c.stage !== 'REJECTED' && (
              <Button variant="secondary" size="sm" onClick={() => setShareOpen(true)}>
                <Sparkles size={14} aria-hidden="true" />
                Share experience
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil size={14} />
              Edit details
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmCompany(true)}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>


        {/* Company Meta Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={<IndianRupee size={16} />} label="CTC">
            {c.ctc || <span className="text-slate-500 dark:text-slate-400">Not specified</span>}
          </InfoRow>
          <InfoRow icon={<MapPin size={16} />} label="Location">
            {c.location || <span className="text-slate-500 dark:text-slate-400">Not specified</span>}
          </InfoRow>
          <InfoRow icon={<CalendarDays size={16} />} label="Applied on">
            <span className="tabular-nums">{formatDate(c.appliedOn)}</span>
          </InfoRow>
          <InfoRow icon={<FileText size={16} />} label="Resume version">
            {c.resumeVersion || <span className="text-slate-500 dark:text-slate-400">Default resume</span>}
          </InfoRow>
          <InfoRow icon={<Briefcase size={16} />} label="Job description">
            {c.jdLink ? (
              <a
                href={c.jdLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open link <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">Not attached</span>
            )}
          </InfoRow>
          <InfoRow icon={<CircleCheckBig size={16} />} label="Superset registration">
            <Badge
              className={
                c.registeredOnSuperset
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }
            >
              {c.registeredOnSuperset ? 'Registered' : 'Not registered'}
            </Badge>
          </InfoRow>
        </div>
      </div>

      {/* Research notes */}
      <section className="space-y-2" aria-labelledby="notes-heading">
        <h3 id="notes-heading" className="text-base font-semibold text-slate-900 dark:text-slate-100">Research notes</h3>
        <Card className="p-5">
          {c.researchNotes?.trim() ? (
            <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {c.researchNotes}
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No notes yet. Use <span className="font-medium text-slate-700 dark:text-slate-300">Edit details</span> to
              add eligibility, tech stack or anything you want to remember.
            </p>
          )}
        </Card>
      </section>

      {/* Rounds */}
      <section className="space-y-3" aria-labelledby="rounds-heading">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 id="rounds-heading" className="text-base font-semibold text-slate-900 dark:text-slate-100">Rounds</h3>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
              {roundList.length}
            </span>
          </div>
          <Button size="sm" onClick={() => setAddRoundOpen(true)}>
            <Plus size={15} aria-hidden="true" />
            Schedule round
          </Button>
        </div>

        {rounds.isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading rounds">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : roundList.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="No rounds yet"
            description="Schedule the first round for this company: an OA, GD, technical or HR interview."
            action={
              <Button onClick={() => setAddRoundOpen(true)}>
                <Plus size={16} />
                Schedule first round
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
                      className={cn(round.hasJournal && 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60')}
                    >
                      <NotebookPen size={16} />
                    </IconButton>
                    <IconButton title="Edit round" onClick={() => setEditRound(round)}>
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      title="Delete round"
                      onClick={() => setPendingRound(round)}
                      className="hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <CompanyModal open={editOpen} onClose={() => setEditOpen(false)} company={c} />
      {shareOpen && (
        <ExperienceModal
          initialData={shareInitialData}
          onClose={() => setShareOpen(false)}
        />
      )}
      <RoundModal
        open={addRoundOpen}
        onClose={() => setAddRoundOpen(false)}
        companyId={c.id}
      />

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
