import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Calendar,
  Check,
  Copy,
  MapPin,
  Shield,
  ThumbsUp,
  Trash2,
  User,
} from 'lucide-react'
import {
  DIFFICULTY_META,
  DRIVE_TYPE_META,
  VERDICT_META,
} from '../lib/constants'
import { cn, formatDate } from '../lib/format'
import { useDeleteExperience, useHelpfulExperience } from '../hooks/queries'

import { Badge, Button, ConfirmDialog, Modal } from './ui'
import type { Experience } from '../lib/types'


interface ExperienceDetailModalProps {
  experience: Experience
  onClose: () => void
}

/** A titled block of long-form text from the post. */
function ReadingSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  )
}

export function ExperienceDetailModal({
  experience,
  onClose,
}: ExperienceDetailModalProps) {
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const helpfulMutation = useHelpfulExperience()
  const deleteMutation = useDeleteExperience()

  const verdictMeta = VERDICT_META[experience.verdict]
  const difficultyMeta = DIFFICULTY_META[experience.difficulty]
  const driveMeta = DRIVE_TYPE_META[experience.driveType]

  const handleHelpful = () => {
    helpfulMutation.mutate(experience.id)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(experience.id)
    onClose()
  }

  const handleCopySummary = async () => {
    const text = `${experience.title}\nCompany: ${experience.companyName} (${experience.role})\nVerdict: ${experience.verdict}\n\nQuestions Asked:\n${experience.questionsAsked ?? 'N/A'}\n\nTips:\n${experience.tips ?? 'N/A'}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Modal
        title={experience.title}
        subtitle={`${experience.companyName} · ${experience.role}`}
        onClose={onClose}
        size="xl"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            {experience.isAuthor ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 size={13} aria-hidden="true" />
                Delete post
              </Button>
            ) : (
              <span />
            )}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={verdictMeta.badge}>{verdictMeta.label}</Badge>
            <Badge className={difficultyMeta.badge}>{difficultyMeta.label}</Badge>
            <Badge className={driveMeta.badge}>{driveMeta.label}</Badge>
            {experience.ctc && (
              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{experience.ctc}</Badge>
            )}
            {experience.location && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin size={12} aria-hidden="true" />
                {experience.location}
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-xs tabular-nums text-slate-500 dark:text-slate-400">
              <Calendar size={12} aria-hidden="true" />
              {formatDate(experience.createdAt)}
            </span>
          </div>

          {/* Author and actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {experience.isAnonymous ? <Shield size={15} aria-hidden="true" /> : <User size={15} aria-hidden="true" />}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {experience.authorName}
                  {experience.isAuthor && (
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">You</Badge>
                  )}
                </p>
                {experience.authorBatch && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{experience.authorBatch}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleHelpful}
                disabled={helpfulMutation.isPending}
                aria-pressed={experience.hasLiked}
                className={cn(
                  experience.hasLiked &&
                    'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950',
                )}
              >
                <ThumbsUp size={13} aria-hidden="true" className={cn(experience.hasLiked && 'fill-current')} />
                Helpful <span className="tabular-nums">{experience.helpfulCount}</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleCopySummary}>
                {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {experience.summary && <ReadingSection title="Summary">{experience.summary}</ReadingSection>}

          {experience.roundsDetails && (
            <ReadingSection title="Rounds">{experience.roundsDetails}</ReadingSection>
          )}

          {experience.questionsAsked && (
            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Questions asked</h3>
              <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                {experience.questionsAsked}
              </div>
            </section>
          )}

          {experience.topics && (
            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Topics</h3>
              <div className="flex flex-wrap gap-1.5">
                {experience.topics.split(',').map((tag, idx) => {
                  const clean = tag.trim()
                  if (!clean) return null
                  return (
                    <span
                      key={idx}
                      className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
                    >
                      {clean}
                    </span>
                  )
                })}
              </div>
            </section>
          )}

          {experience.tips && <ReadingSection title="Tips">{experience.tips}</ReadingSection>}
        </div>
      </Modal>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this post?"
          message="Your experience will be removed for everyone. This can't be undone."
          confirmLabel="Delete"
          loading={deleteMutation.isPending}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
