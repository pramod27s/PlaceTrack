import { useState } from 'react'
import type { FormEvent } from 'react'
import { Star } from 'lucide-react'
import { apiError } from '../lib/api'
import { useCreateJournal, useUpdateJournal } from '../hooks/queries'
import { ROUND_TYPE_META } from '../lib/constants'
import { cn, formatDateTime } from '../lib/format'
import { Button, ErrorNote, Field, Input, Modal, Textarea } from './ui'
import type { JournalEntry, JournalInput, Round, RoundType } from '../lib/types'

/** The minimum round info the journal modal needs to render and save. */
export interface JournalRoundContext {
  id: number
  companyName: string
  type: RoundType
  scheduledAt: string
}

interface JournalModalProps {
  round: JournalRoundContext | Round
  /** Pass an existing entry to edit it; omit to create a new one. */
  entry?: JournalEntry
  onClose: () => void
}

const EMPTY: JournalInput = {
  title: '',
  questionsAsked: '',
  topics: '',
  whatWentWell: '',
  whatFlopped: '',
  resources: '',
  rating: null,
}

function fromEntry(entry: JournalEntry): JournalInput {
  return {
    title: entry.title ?? '',
    questionsAsked: entry.questionsAsked ?? '',
    topics: entry.topics ?? '',
    whatWentWell: entry.whatWentWell ?? '',
    whatFlopped: entry.whatFlopped ?? '',
    resources: entry.resources ?? '',
    rating: entry.rating,
  }
}

export function JournalModal({ round, entry, onClose }: JournalModalProps) {
  const create = useCreateJournal()
  const update = useUpdateJournal()
  const saving = create.isPending || update.isPending

  const [form, setForm] = useState<JournalInput>(() =>
    entry ? fromEntry(entry) : EMPTY,
  )
  const [error, setError] = useState('')

  const set = <K extends keyof JournalInput>(key: K, value: JournalInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (entry) {
        await update.mutateAsync({ entryId: entry.id, roundId: round.id, input: form })
      } else {
        await create.mutateAsync({ roundId: round.id, input: form })
      }
      onClose()
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={entry ? 'Edit journal entry' : 'New journal entry'}
      description={`${round.companyName} · ${ROUND_TYPE_META[round.type].label} · ${formatDateTime(round.scheduledAt)}`}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="journal-form" disabled={saving}>
            {saving ? 'Saving…' : entry ? 'Save changes' : 'Add entry'}
          </Button>
        </>
      }
    >
      <form id="journal-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorNote message={error} />}

        <Field
          label="Title"
          htmlFor="j-title"
          hint="Optional — e.g. 'Immediate notes' or 'Day-after reflection'."
        >
          <Input
            id="j-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="A short label for this entry"
          />
        </Field>

        <Field label="Questions asked" htmlFor="j-questions">
          <Textarea
            id="j-questions"
            rows={3}
            value={form.questionsAsked}
            onChange={(e) => set('questionsAsked', e.target.value)}
            placeholder="The actual problems and questions you were asked…"
          />
        </Field>

        <Field label="Topics that came up" htmlFor="j-topics">
          <Textarea
            id="j-topics"
            rows={2}
            value={form.topics}
            onChange={(e) => set('topics', e.target.value)}
            placeholder="Arrays, graphs, system design, behavioural…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="What went well" htmlFor="j-well">
            <Textarea
              id="j-well"
              rows={3}
              value={form.whatWentWell}
              onChange={(e) => set('whatWentWell', e.target.value)}
              placeholder="Wins to repeat next time."
            />
          </Field>
          <Field label="What flopped" htmlFor="j-flop">
            <Textarea
              id="j-flop"
              rows={3}
              value={form.whatFlopped}
              onChange={(e) => set('whatFlopped', e.target.value)}
              placeholder="Mistakes to fix before the next round."
            />
          </Field>
        </div>

        <Field label="Resources to revisit" htmlFor="j-resources">
          <Textarea
            id="j-resources"
            rows={2}
            value={form.resources}
            onChange={(e) => set('resources', e.target.value)}
            placeholder="Links, problem sets, or topics to revise."
          />
        </Field>

        <Field label="How did it go?">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rate ${value} of 5`}
                onClick={() => set('rating', form.rating === value ? null : value)}
                className="rounded-md p-0.5 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Star
                  size={26}
                  className={cn(
                    form.rating && value <= form.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300',
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-slate-500">
              {form.rating ? `${form.rating} / 5` : 'Not rated'}
            </span>
          </div>
        </Field>
      </form>
    </Modal>
  )
}
