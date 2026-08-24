import { useState } from 'react'
import type { FormEvent } from 'react'
import { Shield, UserCheck } from 'lucide-react'
import { apiError } from '../lib/api'
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

export function ExperienceModal({
  onClose,
  initialCompany,
  initialRole,
}: ExperienceModalProps) {
  const create = useCreateExperience()
  const [form, setForm] = useState<ExperienceInput>(() => ({
    ...EMPTY,
    companyName: initialCompany ?? '',
    role: initialRole ?? '',
    title: initialCompany
      ? `${initialCompany} ${initialRole || 'Interview'} Experience`
      : '',
  }))
  const [error, setError] = useState('')

  const set = <K extends keyof ExperienceInput>(key: K, value: ExperienceInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.companyName.trim()) {
      setError('Company name is required')
      return
    }
    if (!form.role.trim()) {
      setError('Role is required')
      return
    }
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setError('')
      await create.mutateAsync(form)
      onClose()
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <Modal
      title="Share Interview Experience"
      subtitle="Help your fellow classmates and juniors crack their placement drives with real questions and tips."
      onClose={onClose}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorNote>{error}</ErrorNote>}

        {/* Section 1: Company & Role Details */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px]">
              1
            </span>
            <span>Drive Overview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *" hint="e.g. Amazon, Oracle, TCS">
              <Input
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                placeholder="Google / Cisco"
                required
                autoFocus
              />
            </Field>

            <Field label="Role / Designation *" hint="e.g. SDE-1, Intern, Analyst">
              <Input
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="Software Engineer"
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Drive Type">
              <Select
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

            <Field label="CTC / Stipend" hint="Optional, e.g. 16 LPA or 50k/mo">
              <Input
                value={form.ctc ?? ''}
                onChange={(e) => set('ctc', e.target.value)}
                placeholder="e.g. 18 LPA"
              />
            </Field>

            <Field label="Location" hint="e.g. Bengaluru / Hybrid">
              <Input
                value={form.location ?? ''}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Pune / Remote"
              />
            </Field>
          </div>
        </div>

        {/* Section 2: Verdict & Experience Title */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px]">
              2
            </span>
            <span>Verdict & Difficulty</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Final Outcome / Verdict">
              <Select
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

            <Field label="Overall Difficulty">
              <Select
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
            label="Post Headline / Title *"
            hint="A clear title summarizing your experience"
          >
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Amazon SDE-1 On-Campus 2026 — 3 Rounds Experience & DSA Questions"
              required
            />
          </Field>

          <Field
            label="Quick Summary / TL;DR"
            hint="1-2 sentences on how the drive was organized"
          >
            <Textarea
              rows={2}
              value={form.summary ?? ''}
              onChange={(e) => set('summary', e.target.value)}
              placeholder="Overall a smooth process. OA had 2 questions, followed by 2 technical rounds focused on Trees and System Design basics."
            />
          </Field>
        </div>

        {/* Section 3: In-Depth Rounds & Questions */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px]">
              3
            </span>
            <span>Rounds Breakdown & Questions Asked</span>
          </div>

          <Field
            label="Round-by-Round Breakdown"
            hint="Break down OA, Round 1, Round 2, HR..."
          >
            <Textarea
              rows={4}
              value={form.roundsDetails ?? ''}
              onChange={(e) => set('roundsDetails', e.target.value)}
              placeholder="• Round 1 (Online Test): 2 LeetCode medium questions (Graph BFS, 2D DP) + 20 CS core MCQs.&#10;• Round 2 (Technical 1 - 45 min): Deep dive into project architecture, SQL query optimization, and LRU Cache design.&#10;• Round 3 (HR/Managerial - 30 min): Standard behavioral questions and situational scenarios."
            />
          </Field>

          <Field
            label="Key Questions & Topics Asked"
            hint="Specific DSA problems, concepts, or DBMS/OS questions"
          >
            <Textarea
              rows={3}
              value={form.questionsAsked ?? ''}
              onChange={(e) => set('questionsAsked', e.target.value)}
              placeholder="1. Coin Change problem variation&#10;2. How does indexing work in PostgreSQL B-trees?&#10;3. Differences between Process and Thread, Mutex vs Semaphore."
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Topics / Tags (comma separated)"
              hint="e.g. DSA, DP, Graphs, OS, DBMS, Spring Boot"
            >
              <Input
                value={form.topics ?? ''}
                onChange={(e) => set('topics', e.target.value)}
                placeholder="DSA, Dynamic Programming, SQL, OS"
              />
            </Field>

            <Field
              label="Tips / Advice for Juniors"
              hint="What helped you most? What should others prep?"
            >
              <Input
                value={form.tips ?? ''}
                onChange={(e) => set('tips', e.target.value)}
                placeholder="Revise CS fundamentals thoroughly and practice dry runs out loud."
              />
            </Field>
          </div>
        </div>

        {/* Section 4: Privacy & Author Attribution */}
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {form.anonymous ? (
                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Privacy & Attribution
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => set('anonymous', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
              />
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Post Anonymously
              </span>
            </label>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            {form.anonymous
              ? '🛡️ Your name and email will be hidden from everyone. Your post will be marked as "Anonymous Student".'
              : '👤 Your full name will be shown alongside your post to help peers connect with you.'}
          </p>

          <Field label="Batch / Branch (Optional)" hint="e.g. 2026 Batch, CSE '25">
            <Input
              value={form.authorBatch ?? ''}
              onChange={(e) => set('authorBatch', e.target.value)}
              placeholder="e.g. 2026 Batch"
            />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={create.isPending}>
            {create.isPending ? 'Publishing...' : 'Publish Experience 🚀'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
