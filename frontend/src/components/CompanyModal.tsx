import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { apiError } from '../lib/api'
import { useSaveCompany } from '../hooks/queries'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { cn } from '../lib/format'
import { Button, ErrorNote, Field, Input, Modal, Textarea } from './ui'
import type { Company, CompanyInput } from '../lib/types'

interface CompanyModalProps {
  open: boolean
  onClose: () => void
  company?: Company
}

const todayIso = () => new Date().toISOString().slice(0, 10)

function blankForm(): CompanyInput {
  return {
    name: '',
    role: '',
    ctc: '',
    location: '',
    jdLink: '',
    stage: 'APPLIED',
    appliedOn: todayIso(),
    registeredOnSuperset: false,
    researchNotes: '',
    resumeVersion: '',
  }
}

function fromCompany(company: Company): CompanyInput {
  return {
    name: company.name,
    role: company.role ?? '',
    ctc: company.ctc ?? '',
    location: company.location ?? '',
    jdLink: company.jdLink ?? '',
    stage: company.stage,
    appliedOn: company.appliedOn ?? todayIso(),
    registeredOnSuperset: company.registeredOnSuperset,
    researchNotes: company.researchNotes ?? '',
    resumeVersion: company.resumeVersion ?? '',
  }
}

export function CompanyModal({ open, onClose, company }: CompanyModalProps) {
  const save = useSaveCompany()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={company ? 'Edit company' : 'Quick Add Company'}
      description={
        company
          ? 'Update the details for this application.'
          : 'Add a company to your placement pipeline in seconds.'
      }
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="company-form" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : company ? 'Save changes' : 'Add to pipeline'}
          </Button>
        </>
      }
    >
      <CompanyForm
        key={company?.id ?? 'new-company'}
        company={company}
        onClose={onClose}
        save={save}
      />
    </Modal>
  )
}

function CompanyForm({
  company,
  onClose,
  save,
}: {
  company?: Company
  onClose: () => void
  save: ReturnType<typeof useSaveCompany>
}) {
  const [form, setForm] = useState<CompanyInput>(() =>
    company ? fromCompany(company) : blankForm(),
  )
  const [error, setError] = useState('')
  // If editing and has extra data, default to expanded, otherwise fast-track mode
  const [showMore, setShowMore] = useState<boolean>(
    Boolean(
      company &&
        (company.location ||
          company.jdLink ||
          company.researchNotes ||
          company.resumeVersion ||
          company.registeredOnSuperset),
    ),
  )

  const set = <K extends keyof CompanyInput>(key: K, value: CompanyInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await save.mutateAsync({
        id: company?.id,
        input: { ...form, appliedOn: form.appliedOn || null },
      })
      onClose()
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <form id="company-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorNote message={error} />}

      {!company && (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 text-xs text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200/60 dark:ring-indigo-800/60">
          <Zap size={14} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span className="font-medium">
            <strong>Fast Track:</strong> Enter the company name and choose a stage. You can add extra details anytime later.
          </span>
        </div>
      )}

      {/* 1. Company Name */}
      <Field label="Company name" htmlFor="c-name" required>
        <Input
          id="c-name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Google, Microsoft, TCS, Infosys…"
          required
          autoFocus
          className="text-base font-semibold"
        />
      </Field>

      {/* 2. Fast Stage Selector Pills */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Pipeline Stage
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STAGE_ORDER.map((stageKey) => {
            const meta = STAGE_META[stageKey]
            const isSelected = form.stage === stageKey
            return (
              <button
                key={stageKey}
                type="button"
                onClick={() => set('stage', stageKey)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm scale-[1.02]'
                    : 'bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
                {meta.short}
              </button>
            )
          })}
        </div>
      </div>

      {/* Compact Quick Fields: Role & CTC */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Role (optional)" htmlFor="c-role">
          <Input
            id="c-role"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            placeholder="e.g. Software Engineer"
          />
        </Field>
        <Field label="CTC / Package (optional)" htmlFor="c-ctc">
          <Input
            id="c-ctc"
            value={form.ctc}
            onChange={(e) => set('ctc', e.target.value)}
            placeholder="e.g. 14 LPA"
          />
        </Field>
      </div>

      {/* Expand / Collapse More Details */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          {showMore ? (
            <>
              <ChevronUp size={14} />
              Hide extra details
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              + Add more details (location, JD link, notes, superset...)
            </>
          )}
        </button>
      </div>

      {showMore && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" htmlFor="c-location">
              <Input
                id="c-location"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Bengaluru / Remote"
              />
            </Field>
            <Field label="Resume version used" htmlFor="c-resume">
              <Input
                id="c-resume"
                value={form.resumeVersion}
                onChange={(e) => set('resumeVersion', e.target.value)}
                placeholder="Resume v3 — Backend"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Applied on" htmlFor="c-applied">
              <Input
                id="c-applied"
                type="date"
                value={form.appliedOn ?? ''}
                onChange={(e) => set('appliedOn', e.target.value)}
              />
            </Field>
            <Field label="Job description link" htmlFor="c-jd">
              <Input
                id="c-jd"
                type="url"
                value={form.jdLink}
                onChange={(e) => set('jdLink', e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </div>

          <Field
            label="Research notes"
            htmlFor="c-notes"
            hint="Culture, tech stack, recent news, interviewer names, why you want in."
          >
            <Textarea
              id="c-notes"
              rows={3}
              value={form.researchNotes}
              onChange={(e) => set('researchNotes', e.target.value)}
              placeholder="What did you learn while researching this company?"
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-3 transition hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-indigo-600 rounded"
              checked={form.registeredOnSuperset}
              onChange={(e) => set('registeredOnSuperset', e.target.checked)}
            />
            <span className="text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200">Registered on Superset / College Portal</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Confirms the TPO-portal registration step is complete.
              </span>
            </span>
          </label>
        </div>
      )}
    </form>
  )
}
