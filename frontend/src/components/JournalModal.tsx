import { useState } from 'react'
import type { FormEvent } from 'react'
import { Star } from 'lucide-react'
import { apiError } from '../lib/api'
import { useRoundJournal, useSaveJournal } from '../hooks/queries'
import { ROUND_TYPE_META } from '../lib/constants'
import { cn, formatDateTime } from '../lib/format'
import { Button, ErrorNote, Field, Modal, Spinner, Textarea } from './ui'
import type { JournalEntry, JournalInput, Round } from '../lib/types'

interface JournalModalProps {
  round: Round
  onClose: () => void
}

const EMPTY: JournalInput = {
  questionsAsked: '',
  topics: '',
  whatWentWell: '',
  whatFlopped: '',
  resources: '',
  rating: null,
}

function fromJournal(entry: JournalEntry | null | undefined): JournalInput {
  return entry
    ? {
        questionsAsked: entry.questionsAsked ?? '',
        topics: entry.topics ?? '',
        whatWentWell: entry.whatWentWell ?? '',
        whatFlopped: entry.whatFlopped ?? '',
        resources: entry.resources ?? '',
        rating: entry.rating,
      }
    : EMPTY
}

export function JournalModal({ round, onClose }: JournalModalProps) {
  const { data: existing, isLoading } = useRoundJournal(round.id)
  const save = useSaveJournal()

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Interview journal"
      description={`${round.companyName} · ${ROUND_TYPE_META[round.type].label} · ${formatDateTime(round.scheduledAt)}`}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="journal-form" disabled={save.isPending || isLoading}>
            {save.isPending ? 'Saving…' : 'Save entry'}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-7 w-7" />
        </div>
      ) : (
        <JournalForm
          key={existing?.id ?? `round-${round.id}-empty`}
          roundId={round.id}
          initial={fromJournal(existing)}
          onClose={onClose}
          save={save}
        />
      )}
    </Modal>
  )
}

function JournalForm({
  roundId,
  initial,
  onClose,
  save,
}: {
  roundId: number
  initial: JournalInput
  onClose: () => void
  save: ReturnType<typeof useSaveJournal>
}) {
  const [form, setForm] = useState<JournalInput>(() => initial)
  const [error, setError] = useState('')

  const set = <K extends keyof JournalInput>(key: K, value: JournalInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await save.mutateAsync({ roundId, input: form })
      onClose()
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <form id="journal-form" onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorNote message={error} />}

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
  )
}
