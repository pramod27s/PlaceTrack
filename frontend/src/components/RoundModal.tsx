import { useState } from 'react'
import type { FormEvent } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { apiError } from '../lib/api'
import { useSaveRound } from '../hooks/queries'
import { ROUND_MODES, ROUND_STATUSES, ROUND_STATUS_META, ROUND_TYPES, ROUND_TYPE_META } from '../lib/constants'
import { cn, toDateTimeLocal } from '../lib/format'
import { Button, ErrorNote, Field, Input, Modal, Select } from './ui'
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
      title={round ? 'Edit round' : 'Schedule a Round'}
      description={
        round
          ? 'Update your round details and schedule.'
          : 'Schedule an interview, OA, or GD in seconds.'
      }
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="round-form" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : round ? 'Save changes' : 'Add to schedule'}
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
  const [showMore, setShowMore] = useState<boolean>(
    Boolean(round && (round.title || round.meetingLink || round.location || round.durationMinutes !== 60 || round.mode !== 'ONLINE')),
  )

  const set = <K extends keyof RoundInput>(key: K, value: RoundInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
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
      setError(apiError(err))
    }
  }

  return (
    <form id="round-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorNote message={error} />}

      {!round && (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 text-xs text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200/60 dark:ring-indigo-800/60">
          <Zap size={14} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span className="font-medium">
            <strong>Fast Track:</strong> Pick the round type and timing. Meeting links and custom durations can be added anytime.
          </span>
        </div>
      )}

      {/* 1. Fast Round Type Selector Pills */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Round Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ROUND_TYPES.map((typeKey) => {
            const meta = ROUND_TYPE_META[typeKey]
            const isSelected = form.type === typeKey
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => set('type', typeKey)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                )}
              >
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Date & Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date & time" htmlFor="r-when" required>
          <Input
            id="r-when"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => set('scheduledAt', e.target.value)}
            required
            className="text-sm font-semibold"
          />
        </Field>

        <Field label="Status" htmlFor="r-status">
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
              + Add extra details (meeting link, duration, mode, title)
            </>
          )}
        </button>
      </div>

      {showMore && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title / Focus (optional)" htmlFor="r-title" hint="e.g. 'DSA & Trees' or 'Director Interview'">
              <Input
                id="r-title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Round topic / label"
              />
            </Field>

            <Field label="Duration (minutes)" htmlFor="r-duration">
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
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {[30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => set('durationMinutes', mins)}
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[11px] font-semibold transition',
                      Number(form.durationMinutes) === mins
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                    )}
                  >
                    {mins}m
                  </button>
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
            <Field label="Meeting link" htmlFor="r-link">
              <Input
                id="r-link"
                type="url"
                value={form.meetingLink}
                onChange={(e) => set('meetingLink', e.target.value)}
                placeholder="https://meet.google.com/… or MS Teams link"
              />
            </Field>
          ) : (
            <Field label="Location" htmlFor="r-location">
              <Input
                id="r-location"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Auditorium / Placement Cell Room 302"
              />
            </Field>
          )}
        </div>
      )}
    </form>
  )
}
