import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { apiError, apiFieldErrors, parseCompanyNotice } from '../lib/api'
import { useSaveCompany } from '../hooks/queries'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { cn } from '../lib/format'
import { Button, ErrorNote, Field, FilterChip, Input, Modal, Textarea } from './ui'
import { AiNoticePanel } from './AiNoticePanel'
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
      title={company ? 'Edit company' : 'Add company'}
      description={
        company
          ? 'Update the details for this application.'
          : 'Only the name is required. You can add the rest later.'
      }
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="company-form" loading={save.isPending}>
            {company ? 'Save changes' : 'Add to pipeline'}
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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

  const fillFromNotice = async (text: string) => {
    const data = await parseCompanyNotice(text)
    setForm((prev) => ({
      ...prev,
      name: data.name || prev.name,
      role: data.role || prev.role,
      ctc: data.ctc || prev.ctc,
      location: data.location || prev.location,
      jdLink: data.jdLink || prev.jdLink,
      registeredOnSuperset: data.registeredOnSuperset === true ? true : prev.registeredOnSuperset,
      researchNotes: data.researchNotes || prev.researchNotes,
      resumeVersion: data.resumeVersion || prev.resumeVersion,
    }))
    if (data.location || data.jdLink || data.researchNotes || data.registeredOnSuperset || data.resumeVersion) {
      setShowMore(true)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    try {
      await save.mutateAsync({
        id: company?.id,
        input: { ...form, appliedOn: form.appliedOn || null },
      })
      onClose()
    } catch (err) {
      const perField = apiFieldErrors(err)
      setFieldErrors(perField)
      setError(Object.keys(perField).length ? 'Please fix the highlighted fields.' : apiError(err))
      if (perField.location || perField.jdLink || perField.resumeVersion || perField.researchNotes) {
        setShowMore(true)
      }
    }
  }

  return (
    <form id="company-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorNote message={error} />}

      <AiNoticePanel
        heading="Fill from a notice"
        description="Paste text from WhatsApp, Superset or email and AI fills the form."
        placeholder="e.g. Drive: Deloitte USI · Role: Analyst · CTC: 7.6 LPA · Register on Superset by Friday"
        onExtract={fillFromNotice}
      />

      <Field label="Company name" htmlFor="c-name" required error={fieldErrors.name}>
        <Input
          id="c-name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Google, Microsoft, TCS"
          required
          autoFocus
          aria-invalid={Boolean(fieldErrors.name) || undefined}
        />
      </Field>

      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Stage</legend>
        <div className="flex flex-wrap gap-1.5">
          {STAGE_ORDER.map((stageKey) => {
            const meta = STAGE_META[stageKey]
            return (
              <FilterChip key={stageKey} selected={form.stage === stageKey} onClick={() => set('stage', stageKey)}>
                <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden="true" />
                {meta.short}
              </FilterChip>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role" htmlFor="c-role" error={fieldErrors.role}>
          <Input
            id="c-role"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            placeholder="e.g. Software Engineer"
            aria-invalid={Boolean(fieldErrors.role) || undefined}
          />
        </Field>
        <Field label="CTC" htmlFor="c-ctc" error={fieldErrors.ctc}>
          <Input
            id="c-ctc"
            value={form.ctc}
            onChange={(e) => set('ctc', e.target.value)}
            placeholder="e.g. 14 LPA"
            aria-invalid={Boolean(fieldErrors.ctc) || undefined}
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((prev) => !prev)}
        aria-expanded={showMore}
        className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {showMore ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
        {showMore ? 'Fewer details' : 'More details'}
        {!showMore && (
          <span className="font-normal text-slate-500 dark:text-slate-400">· location, JD link, notes, Superset</span>
        )}
      </button>

      {showMore && (
        <div className="animate-fade-in space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" htmlFor="c-location" error={fieldErrors.location}>
              <Input
                id="c-location"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Bengaluru / Remote"
                aria-invalid={Boolean(fieldErrors.location) || undefined}
              />
            </Field>
            <Field label="Resume version used" htmlFor="c-resume" error={fieldErrors.resumeVersion}>
              <Input
                id="c-resume"
                value={form.resumeVersion}
                onChange={(e) => set('resumeVersion', e.target.value)}
                placeholder="Resume v3 (backend)"
                aria-invalid={Boolean(fieldErrors.resumeVersion) || undefined}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Applied on" htmlFor="c-applied" error={fieldErrors.appliedOn}>
              <Input
                id="c-applied"
                type="date"
                value={form.appliedOn ?? ''}
                onChange={(e) => set('appliedOn', e.target.value)}
                aria-invalid={Boolean(fieldErrors.appliedOn) || undefined}
              />
            </Field>
            <Field label="Job description link" htmlFor="c-jd" error={fieldErrors.jdLink}>
              <Input
                id="c-jd"
                type="url"
                value={form.jdLink}
                onChange={(e) => set('jdLink', e.target.value)}
                placeholder="https://…"
                aria-invalid={Boolean(fieldErrors.jdLink) || undefined}
              />
            </Field>
          </div>

          <Field
            label="Research notes"
            htmlFor="c-notes"
            hint="Eligibility, tech stack, recent news, why you want to join."
            error={fieldErrors.researchNotes}
          >
            <Textarea
              id="c-notes"
              rows={3}
              value={form.researchNotes}
              onChange={(e) => set('researchNotes', e.target.value)}
              placeholder="What did you learn while researching this company?"
              aria-invalid={Boolean(fieldErrors.researchNotes) || undefined}
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-3.5 py-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded accent-indigo-600"
              checked={form.registeredOnSuperset}
              onChange={(e) => set('registeredOnSuperset', e.target.checked)}
            />
            <span className="text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200">Registered on Superset or the college portal</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Tick this once the TPO portal registration is done.
              </span>
            </span>
          </label>
        </div>
      )}
    </form>
  )
}
