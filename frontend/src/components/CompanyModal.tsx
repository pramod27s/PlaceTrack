import { useState } from 'react'
import type { FormEvent } from 'react'
import { apiError } from '../lib/api'
import { useSaveCompany } from '../hooks/queries'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { Button, ErrorNote, Field, Input, Modal, Select, Textarea } from './ui'
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
      title={company ? 'Edit company' : 'Add a company'}
      description={
        company
          ? 'Update the details for this application.'
          : 'Add a company to your placement pipeline.'
      }
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="company-form" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : company ? 'Save changes' : 'Add company'}
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

      <Field label="Company name" htmlFor="c-name" required>
        <Input
          id="c-name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Google"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role" htmlFor="c-role">
          <Input
            id="c-role"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            placeholder="Software Engineer"
          />
        </Field>
        <Field label="CTC" htmlFor="c-ctc">
          <Input
            id="c-ctc"
            value={form.ctc}
            onChange={(e) => set('ctc', e.target.value)}
            placeholder="e.g. 18 LPA"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="c-location">
          <Input
            id="c-location"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Bengaluru"
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
        <Field label="Current stage" htmlFor="c-stage">
          <Select
            id="c-stage"
            value={form.stage}
            onChange={(e) => set('stage', e.target.value as CompanyInput['stage'])}
          >
            {STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_META[stage].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Applied on" htmlFor="c-applied">
          <Input
            id="c-applied"
            type="date"
            value={form.appliedOn ?? ''}
            onChange={(e) => set('appliedOn', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Job description link" htmlFor="c-jd">
        <Input
          id="c-jd"
          type="url"
          value={form.jdLink}
          onChange={(e) => set('jdLink', e.target.value)}
          placeholder="https://…"
        />
      </Field>

      <Field
        label="Research notes"
        htmlFor="c-notes"
        hint="Culture, tech stack, recent news, interviewer names, why you want in."
      >
        <Textarea
          id="c-notes"
          rows={4}
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
          <span className="font-medium text-slate-800 dark:text-slate-200">Registered on Superset</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            Confirms the TPO-portal registration step is complete.
          </span>
        </span>
      </label>
    </form>
  )
}
