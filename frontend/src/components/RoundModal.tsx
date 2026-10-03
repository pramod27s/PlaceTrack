import { useState } from 'react'
import type { FormEvent } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { apiError, apiFieldErrors, parseRoundNotice } from '../lib/api'
import { useSaveRound } from '../hooks/queries'
import { ROUND_MODES, ROUND_STATUSES, ROUND_STATUS_META, ROUND_TYPES, ROUND_TYPE_META } from '../lib/constants'
import { toDateTimeLocal } from '../lib/format'
import { Button, ErrorNote, Field, FilterChip, Input, Modal, Select } from './ui'
import { AiNoticePanel } from './AiNoticePanel'
import type { Round, RoundInput } from '../lib/types'

interface RoundModalProps {
  open: boolean
  onClose: () => void
  companyId?: number
  round?: Round
}

function defaultSchedule(): string {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

function blankForm(): RoundInput {
  return {
    type: 'TECHNICAL',
    title: '',
    scheduledAt: defaultSchedule(),
    durationMinutes: 60,
    mode: 'ONLINE',
    meetingLink: '',
    location: '',
    status: 'SCHEDULED',
  }
}

function fromRound(round: Round): RoundInput {
  return {
    type: round.type,
    title: round.title ?? '',
    scheduledAt: toDateTimeLocal(round.scheduledAt),
    durationMinutes: round.durationMinutes,
    mode: round.mode,
    meetingLink: round.meetingLink ?? '',
    location: round.location ?? '',
    status: round.status,
  }
}

export function RoundModal({ open, onClose, companyId, round }: RoundModalProps) {
  const save = useSaveRound()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={round ? 'Edit round' : 'Schedule a round'}
      description={
        round ? 'Update the details and timing of this round.' : 'Only the type and time are required.'
      }
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="round-form" loading={save.isPending}>
            {round ? 'Save changes' : 'Add to schedule'}
          </Button>
        </>
      }
    >
      <RoundForm
        key={round?.id ?? 'new-round'}
        companyId={companyId}
        round={round}
        onClose={onClose}
        save={save}
      />
    </Modal>
  )
}

function RoundForm({
  companyId,
  round,
  onClose,
  save,
}: {
  companyId?: number
  round?: Round
  onClose: () => void
  save: ReturnType<typeof useSaveRound>
}) {
  const [form, setForm] = useState<RoundInput>(() =>
    round ? fromRound(round) : blankForm(),
  )
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showMore, setShowMore] = useState<boolean>(
    Boolean(round && (round.title || round.meetingLink || round.location || round.durationMinutes !== 60 || round.mode !== 'ONLINE')),
  )

  const set = <K extends keyof RoundInput>(key: K, value: RoundInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const fillFromInvite = async (text: string) => {
    const data = await parseRoundNotice(text)
    setForm((prev) => ({
      ...prev,
      type: data.type || prev.type,
      title: data.title || prev.title,
      scheduledAt: data.scheduledAt || prev.scheduledAt,
      durationMinutes: data.durationMinutes ?? prev.durationMinutes,
      mode: data.mode || prev.mode,
      meetingLink: data.meetingLink || prev.meetingLink,
      location: data.location || prev.location,
    }))
    if (
      data.title ||
      data.meetingLink ||
      data.location ||
      (data.durationMinutes && data.durationMinutes !== 60) ||
      (data.mode && data.mode !== 'ONLINE')
    ) {
      setShowMore(true)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    try {
      await save.mutateAsync({
        roundId: round?.id,
        companyId: round?.companyId ?? companyId,
        input: {
          ...form,
          durationMinutes: Number(form.durationMinutes) || 60,
        },
      })
      onClose()
    } catch (err) {
      const perField = apiFieldErrors(err)
      setFieldErrors(perField)
      setError(Object.keys(perField).length ? 'Please fix the highlighted fields.' : apiError(err))
      if (perField.title || perField.durationMinutes || perField.meetingLink || perField.location) {
        setShowMore(true)
      }
    }
  }

  return (
    <form id="round-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorNote message={error} />}

      <AiNoticePanel
        heading="Fill from an invite"
        description="Paste an interview email, Meet invite or schedule message."
        placeholder="e.g. Technical interview with Amazon on 18 Oct at 3:00 PM IST (45 mins). Meet: https://meet.google.com/…"
        onExtract={fillFromInvite}
      />

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Round type
          <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {ROUND_TYPES.map((typeKey) => (
            <FilterChip key={typeKey} selected={form.type === typeKey} onClick={() => set('type', typeKey)}>
              {ROUND_TYPE_META[typeKey].label}
            </FilterChip>
          ))}
        </div>
        {fieldErrors.type && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            {fieldErrors.type}
          </p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date and time" htmlFor="r-when" required error={fieldErrors.scheduledAt}>
          <Input
            id="r-when"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => set('scheduledAt', e.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.scheduledAt) || undefined}
          />
        </Field>

        <Field label="Status" htmlFor="r-status" error={fieldErrors.status}>
          <Select
            id="r-status"
            value={form.status}
            onChange={(e) => set('status', e.target.value as RoundInput['status'])}
          >
            {ROUND_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ROUND_STATUS_META[status].label}
              </option>
            ))}
          </Select>
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
          <span className="font-normal text-slate-500 dark:text-slate-400">· title, duration, mode, link</span>
        )}
      </button>

      {showMore && (
        <div className="animate-fade-in space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="r-title" hint="e.g. DSA and trees, or Director interview" error={fieldErrors.title}>
              <Input
                id="r-title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="What this round focuses on"
                aria-invalid={Boolean(fieldErrors.title) || undefined}
              />
            </Field>

            <Field label="Duration (minutes)" htmlFor="r-duration" error={fieldErrors.durationMinutes}>
              <Input
                id="r-duration"
                type="number"
                min={5}
                max={600}
                step={5}
                value={form.durationMinutes === ('' as unknown as number) ? '' : form.durationMinutes}
                onChange={(e) => {
                  const val = e.target.value
                  set('durationMinutes', val === '' ? ('' as unknown as number) : Number(val))
                }}
                aria-invalid={Boolean(fieldErrors.durationMinutes) || undefined}
              />
              <div className="mt-1.5 flex flex-wrap gap-1" role="group" aria-label="Common durations">
                {[30, 45, 60, 90, 120].map((mins) => (
                  <FilterChip
                    key={mins}
                    selected={Number(form.durationMinutes) === mins}
                    onClick={() => set('durationMinutes', mins)}
                    className="h-7 px-2.5 tabular-nums"
                  >
                    {mins} min
                  </FilterChip>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Mode" htmlFor="r-mode">
            <Select
              id="r-mode"
              value={form.mode}
              onChange={(e) => set('mode', e.target.value as RoundInput['mode'])}
            >
              {ROUND_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode === 'ONLINE' ? 'Online' : 'In person'}
                </option>
              ))}
            </Select>
          </Field>

          {form.mode === 'ONLINE' ? (
            <Field label="Meeting link" htmlFor="r-link" error={fieldErrors.meetingLink}>
              <Input
                id="r-link"
                type="url"
                value={form.meetingLink}
                onChange={(e) => set('meetingLink', e.target.value)}
                placeholder="https://meet.google.com/… or a Teams link"
                aria-invalid={Boolean(fieldErrors.meetingLink) || undefined}
              />
            </Field>
          ) : (
            <Field label="Location" htmlFor="r-location" error={fieldErrors.location}>
              <Input
                id="r-location"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Auditorium, Placement cell room 302"
                aria-invalid={Boolean(fieldErrors.location) || undefined}
              />
            </Field>
          )}
        </div>
      )}
    </form>
  )
}
