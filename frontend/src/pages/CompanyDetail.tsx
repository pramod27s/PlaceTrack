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
  LoadingState,
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
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800">
      <span className="mt-0.5 text-indigo-500 dark:text-indigo-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{children}</div>
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

  if (company.isLoading) return <LoadingState label="Loading company details…" />
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
        ? `Received full-time offer from ${c.name}! Here is my interview journey and round breakdown.`
        : c.stage === 'REJECTED'
          ? `Interview experience & learnings from ${c.name}.`
          : `Interview notes and questions for ${c.name} (Drive in progress).`,
    roundsDetails:
      roundList.length > 0
        ? roundList
            .map(
              (r, i) =>
                `• Round ${i + 1} (${r.type}): ${r.title || r.type} — Status: ${r.status}`,
            )
            .join('\n\n')
        : '',
    tips: c.researchNotes ? `Prep Notes: ${c.researchNotes}` : '',

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
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        Back to pipeline
      </Link>

      {/* 🚀 Offer / Cleared Callout */}
      {c.stage === 'OFFER' && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-300 dark:border-emerald-700/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent dark:from-emerald-950/40 dark:via-teal-950/30 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Offer Cleared from {c.name}! 🎉
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Help fellow students by publishing your complete interview journey, questions asked, and preparation advice.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShareOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
          >
            <Sparkles size={14} />
            Share Selected Experience 🚀
          </Button>
        </div>
      )}

      {/* 💡 Rejected / Learning Callout */}
      {c.stage === 'REJECTED' && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Share your learnings from {c.name} 💪
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Every interview is valuable data. Help peers by documenting the questions asked and technical concepts tested.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShareOpen(true)}
            className="gap-2 font-bold hover:border-indigo-300 dark:hover:border-indigo-700"
          >
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
            Share Learnings to Vault
          </Button>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white shadow-md ring-4 ring-indigo-50 dark:ring-indigo-950/60">
              {initials(c.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{c.name}</h2>
                <Badge className={cn('px-3 py-1 font-bold', stage.badge)}>{stage.label}</Badge>
              </div>
              {c.role && <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{c.role}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700"
            >
              <Sparkles size={14} />
              Share Experience
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil size={14} />
              Edit details
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmCompany(true)}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-900/60"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>


        {/* Company Meta Grid */}
        <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={<IndianRupee size={16} />} label="Compensation (CTC)">
            {c.ctc || 'Not specified'}
          </InfoRow>
          <InfoRow icon={<MapPin size={16} />} label="Location">
            {c.location || 'Flexible / Remote'}
          </InfoRow>
          <InfoRow icon={<CalendarDays size={16} />} label="Applied On">
            {formatDate(c.appliedOn)}
          </InfoRow>
          <InfoRow icon={<FileText size={16} />} label="Resume Version">
            {c.resumeVersion || 'Default Resume'}
          </InfoRow>
          <InfoRow icon={<Briefcase size={16} />} label="Job Description">
            {c.jdLink ? (
              <a
                href={c.jdLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View JD Link <ExternalLink size={12} />
              </a>
            ) : (
              'Not attached'
            )}
          </InfoRow>
          <InfoRow icon={<CircleCheckBig size={16} />} label="College Portal (Superset)">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                c.registeredOnSuperset
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
              )}
            >
              {c.registeredOnSuperset ? 'Registered' : 'Action Needed'}
            </span>
          </InfoRow>
        </div>
      </div>

      {/* Research notes */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 px-1">Research Notes &amp; Prep</h3>
        <Card className="p-5 sm:p-6 shadow-sm">
          {c.researchNotes?.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              {c.researchNotes}
            </p>
          ) : (
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
              <Sparkles size={18} className="text-indigo-400" />
              <p className="text-xs font-medium">
                No notes captured yet. Click "Edit details" above to jot down culture, tech stack, interviewer names, and why you want to work here.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Rounds */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">Interview Rounds</h3>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              {roundList.length}
            </span>
          </div>
          <Button size="sm" onClick={() => setAddRoundOpen(true)}>
            <Plus size={15} />
            Schedule round
          </Button>
        </div>

        {rounds.isLoading ? (
          <LoadingState label="Loading rounds…" />
        ) : roundList.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={24} />}
            title="No interview rounds added yet"
            description="Schedule the first round for this company — an OA, technical interview, GD, or PPT."
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
      </div>

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
