import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Shield, UserCheck } from 'lucide-react'
import { apiError, apiFieldErrors } from '../lib/api'
import { useCreateExperience } from '../hooks/queries'
import {
  DIFFICULTIES,
  DIFFICULTY_META,
  DRIVE_TYPES,
  DRIVE_TYPE_META,
  VERDICTS,
  VERDICT_META,
} from '../lib/constants'
import { Button, ErrorNote, Field, Input, Modal, Select, Textarea } from './ui'
import type { Difficulty, DriveType, ExperienceInput, Verdict } from '../lib/types'


interface ExperienceModalProps {
  onClose: () => void
  initialCompany?: string
  initialRole?: string
  initialData?: Partial<ExperienceInput>
}

const EMPTY: ExperienceInput = {
  companyName: '',
  role: '',
  ctc: '',
  location: '',
  driveType: 'ON_CAMPUS',
  verdict: 'SELECTED',
  difficulty: 'MEDIUM',
  title: '',
  summary: '',
  roundsDetails: '',
  questionsAsked: '',
  topics: '',
  tips: '',
  authorBatch: '',
  anonymous: true,
}

/** A titled group of fields inside the form. */
function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="border-b border-slate-100 pb-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function ExperienceModal({
  onClose,
  initialCompany,
  initialRole,
  initialData,
}: ExperienceModalProps) {
  const create = useCreateExperience()
  const [form, setForm] = useState<ExperienceInput>(() => ({
    ...EMPTY,
    companyName: initialCompany || initialData?.companyName || '',
    role: initialRole || initialData?.role || '',
    title:
      initialData?.title ||
      (initialCompany ? `${initialCompany} Interview Experience` : ''),
    ...initialData,
  }))
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const set = <K extends keyof ExperienceInput>(key: K, value: ExperienceInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const invalid = (key: string) => Boolean(fieldErrors[key]) || undefined

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const missing: Record<string, string> = {}
    if (!form.companyName.trim()) missing.companyName = 'Enter the company name.'
    if (!form.role.trim()) missing.role = 'Enter the role.'
    if (!form.title.trim()) missing.title = 'Give your post a title.'
    if (Object.keys(missing).length) {
      setFieldErrors(missing)
      setError('Please fill in the required fields.')
      return
    }

    try {
      setError('')
      setFieldErrors({})
      await create.mutateAsync(form)
      onClose()
    } catch (err) {
      const perField = apiFieldErrors(err)
      setFieldErrors(perField)
      setError(Object.keys(perField).length ? 'Please fix the highlighted fields.' : apiError(err))
    }
  }

  return (
    <Modal
      title="Share your interview experience"
      subtitle="Real questions and tips help classmates and juniors prepare for the same drives."
      onClose={onClose}
      size="xl"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="experience-form" loading={create.isPending}>
            Publish
          </Button>
        </>
      }
    >
      <form id="experience-form" onSubmit={handleSubmit} className="space-y-8" noValidate>
        {error && <ErrorNote message={error} />}

        <FormSection title="The drive">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company" htmlFor="x-company" required error={fieldErrors.companyName}>
              <Input
                id="x-company"
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                placeholder="e.g. Amazon, Oracle, TCS"
                aria-invalid={invalid('companyName')}
              />
            </Field>

            <Field label="Role" htmlFor="x-role" required error={fieldErrors.role}>
              <Input
                id="x-role"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="e.g. SDE-1, Intern, Analyst"
                aria-invalid={invalid('role')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Drive type" htmlFor="x-drive">
              <Select
                id="x-drive"
                value={form.driveType}
                onChange={(e) => set('driveType', e.target.value as DriveType)}
              >
                {DRIVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {DRIVE_TYPE_META[t].label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="CTC or stipend" htmlFor="x-ctc" error={fieldErrors.ctc}>
              <Input
                id="x-ctc"
                value={form.ctc ?? ''}
                onChange={(e) => set('ctc', e.target.value)}
                placeholder="e.g. 18 LPA or 50k/month"
                aria-invalid={invalid('ctc')}
              />
            </Field>

            <Field label="Location" htmlFor="x-location" error={fieldErrors.location}>
              <Input
                id="x-location"
                value={form.location ?? ''}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Pune, Remote"
                aria-invalid={invalid('location')}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Outcome">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Result" htmlFor="x-verdict">
              <Select
                id="x-verdict"
                value={form.verdict}
                onChange={(e) => set('verdict', e.target.value as Verdict)}
              >
                {VERDICTS.map((v) => (
                  <option key={v} value={v}>
                    {VERDICT_META[v].label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Overall difficulty" htmlFor="x-difficulty">
              <Select
                id="x-difficulty"
                value={form.difficulty}
                onChange={(e) => set('difficulty', e.target.value as Difficulty)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_META[d].label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Title"
            htmlFor="x-title"
            required
            hint="A clear one-line summary of your experience."
            error={fieldErrors.title}
          >
            <Input
              id="x-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Amazon SDE-1 on-campus 2026: 3 rounds, DSA heavy"
              aria-invalid={invalid('title')}
            />
          </Field>

          <Field label="Summary" htmlFor="x-summary" hint="One or two sentences on how the drive went.">
            <Textarea
              id="x-summary"
              rows={2}
              value={form.summary ?? ''}
              onChange={(e) => set('summary', e.target.value)}
              placeholder="Smooth process. The OA had 2 questions, then 2 technical rounds on trees and system design basics."
            />
          </Field>
        </FormSection>

        <FormSection title="Rounds and questions">
          <Field label="Round-by-round breakdown" htmlFor="x-rounds" hint="OA, round 1, round 2, HR…">
            <Textarea
              id="x-rounds"
              rows={4}
              value={form.roundsDetails ?? ''}
              onChange={(e) => set('roundsDetails', e.target.value)}
              placeholder={'Round 1 (online test): 2 LeetCode mediums (graph BFS, 2D DP) and 20 CS MCQs.\nRound 2 (technical, 45 min): project deep dive, SQL optimisation, LRU cache design.\nRound 3 (HR, 30 min): behavioural and situational questions.'}
            />
          </Field>

          <Field
            label="Questions asked"
            htmlFor="x-questions"
            hint="Specific DSA problems, concepts, or DBMS and OS questions."
          >
            <Textarea
              id="x-questions"
              rows={3}
              value={form.questionsAsked ?? ''}
              onChange={(e) => set('questionsAsked', e.target.value)}
              placeholder={'1. Coin change variation\n2. How do B-tree indexes work in PostgreSQL?\n3. Process vs thread, mutex vs semaphore'}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Topics" htmlFor="x-topics" hint="Comma separated, e.g. DSA, DP, Graphs, OS, DBMS">
              <Input
                id="x-topics"
                value={form.topics ?? ''}
                onChange={(e) => set('topics', e.target.value)}
                placeholder="DSA, Dynamic programming, SQL, OS"
              />
            </Field>

            <Field label="Tips for others" htmlFor="x-tips" hint="What helped you most?">
              <Input
                id="x-tips"
                value={form.tips ?? ''}
                onChange={(e) => set('tips', e.target.value)}
                placeholder="Revise CS fundamentals and practise explaining your approach out loud."
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Privacy">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-3.5 py-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60">
            <input
              type="checkbox"
              checked={form.anonymous}
              onChange={(e) => set('anonymous', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-indigo-600"
            />
            <span className="text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                {form.anonymous ? (
                  <Shield size={14} aria-hidden="true" />
                ) : (
                  <UserCheck size={14} aria-hidden="true" />
                )}
                Post anonymously
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                {form.anonymous
                  ? 'Your name and email are hidden. The post shows "Anonymous Student".'
                  : 'Your full name is shown with the post so peers can reach out.'}
              </span>
            </span>
          </label>

          <Field label="Batch or branch" htmlFor="x-batch" hint="Optional, e.g. 2026 batch, CSE" error={fieldErrors.authorBatch}>
            <Input
              id="x-batch"
              value={form.authorBatch ?? ''}
              onChange={(e) => set('authorBatch', e.target.value)}
              placeholder="e.g. 2026 batch"
              aria-invalid={invalid('authorBatch')}
            />
          </Field>
        </FormSection>
      </form>
    </Modal>
  )
}
