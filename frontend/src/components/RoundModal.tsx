import { useState } from 'react'
import type { FormEvent } from 'react'
import { format } from 'date-fns'
import { apiError } from '../lib/api'
import { useSaveRound } from '../hooks/queries'
import { ROUND_MODES, ROUND_STATUSES, ROUND_STATUS_META, ROUND_TYPES, ROUND_TYPE_META } from '../lib/constants'
import { toDateTimeLocal } from '../lib/format'
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
      title={round ? 'Edit round' : 'Schedule a round'}
      description="Each round can be scheduled, tracked, and journaled."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="round-form" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : round ? 'Save changes' : 'Add round'}
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

  const set = <K extends keyof RoundInput>(key: K, value: RoundInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await save.mutateAsync({
        roundId: round?.id,
        companyId: round?.companyId ?? companyId,
        input: form,
      })
      onClose()
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <form id="round-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorNote message={error} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Round type" htmlFor="r-type" required>
          <Select
            id="r-type"
            value={form.type}
            onChange={(e) => set('type', e.target.value as RoundInput['type'])}
          >
            {ROUND_TYPES.map((type) => (
              <option key={type} value={type}>
                {ROUND_TYPE_META[type].label}
              </option>
            ))}
          </Select>
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

      <Field label="Title" htmlFor="r-title" hint="Optional — e.g. 'DSA round' or 'System design'.">
        <Input
          id="r-title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Round label"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date & time" htmlFor="r-when" required>
          <Input
            id="r-when"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => set('scheduledAt', e.target.value)}
            required
          />
        </Field>
        <Field label="Duration (minutes)" htmlFor="r-duration">
          <Input
            id="r-duration"
            type="number"
            min={5}
            step={5}
            value={form.durationMinutes}
            onChange={(e) => set('durationMinutes', Number(e.target.value) || 60)}
          />
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
            placeholder="https://meet.…"
          />
        </Field>
      ) : (
        <Field label="Location" htmlFor="r-location">
          <Input
            id="r-location"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Venue / room"
          />
        </Field>
      )}
    </form>
  )
}
